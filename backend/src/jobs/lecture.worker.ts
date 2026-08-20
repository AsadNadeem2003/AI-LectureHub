import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

export interface LectureJobData {
  lectureId: string;
  filePath: string;
  fileType: string;
  title: string;
}

/**
 * Execute the AI microservice lecture processing pipeline for a lecture job.
 */
export async function processLectureJob(data: LectureJobData): Promise<void> {
  const { lectureId, filePath, title } = data;
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

  try {
    console.log(`⏳ [Worker] Starting background processing for lecture ${lectureId}...`);

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Source file not found at path: ${filePath}`);
    }

    // Prepare multipart form data for Python AI Microservice
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, fileName);
    formData.append('lecture_id', lectureId);
    formData.append('title', title);

    // Call Python AI Microservice /api/v1/process/process-lecture
    const response = await fetch(`${aiServiceUrl}/api/v1/process/process-lecture`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Microservice error (${response.status}): ${errorText}`);
    }

    const result: any = await response.json();

    // Save processing output in PostgreSQL via Prisma
    const transcript = result.transcript || '';
    const audioUrl = result.audio_url || '';
    const segments = result.segments || [];

    await prisma.$transaction(
      async (tx) => {
        // 1. Update Lecture status and main outputs
        await tx.lecture.update({
          where: { id: lectureId },
          data: {
            status: 'READY',
            scriptContent: transcript,
            audioUrl: audioUrl,
            errorMessage: null,
          },
        });

        // 2. Delete any existing segments (idempotency)
        await tx.lectureSegment.deleteMany({
          where: { lectureId },
        });

        // 3. Bulk insert synchronized lecture segments
        if (segments.length > 0) {
          await tx.lectureSegment.createMany({
            data: segments.map((seg: any) => ({
              lectureId,
              segmentIndex: seg.segment_index,
              segmentText: seg.segment_text,
              pageNumber: seg.page_number,
              imageUrls: seg.image_urls || [],
              startTimeMs: seg.start_time_ms,
              endTimeMs: seg.end_time_ms,
              keywords: seg.keywords || [],
            })),
          });
        }
      },
      {
        maxWait: 20000, // 20 seconds maximum wait to acquire connection
        timeout: 30000, // 30 seconds maximum transaction execution time
      }
    );

    console.log(`✅ [Worker] Lecture ${lectureId} processed successfully! Status: READY (${segments.length} segments)`);
  } catch (error: any) {
    console.error(`❌ [Worker] Lecture ${lectureId} processing failed:`, error.message || error);

    // Mark lecture as FAILED in PostgreSQL
    await prisma.lecture.update({
      where: { id: lectureId },
      data: {
        status: 'FAILED',
        errorMessage: error.message || 'Unknown processing error',
      },
    });

    throw error;
  }
}
