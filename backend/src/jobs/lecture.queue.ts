import { Queue, Worker } from 'bullmq';
import { processLectureJob, LectureJobData } from './lecture.worker';

const QUEUE_NAME = 'lecture-processing';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

let lectureQueue: Queue | null = null;
let lectureWorker: Worker | null = null;
let isRedisAvailable = false;

// Initialize BullMQ Queue if Redis is active
try {
  const connection = {
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
    connectTimeout: 2000,
  };
  lectureQueue = new Queue(QUEUE_NAME, { connection });
  lectureWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
      await processLectureJob(job.data);
    },
    { connection }
  );

  lectureWorker.on('completed', (job) => {
    console.log(`[BullMQ] Job ${job.id} completed successfully`);
  });

  lectureWorker.on('failed', (job, err) => {
    console.error(`[BullMQ] Job ${job?.id} failed:`, err);
  });

  isRedisAvailable = true;
  console.log(`🚀 [BullMQ] Connected to Redis at ${redisHost}:${redisPort}`);
} catch (e) {
  console.warn('⚠️ [BullMQ] Redis server not connected. Using asynchronous background worker fallback.');
  isRedisAvailable = false;
}

/**
 * Enqueue a lecture processing job.
 * Non-blocking dispatch to ensure sub-second HTTP upload response.
 */
export async function enqueueLectureJob(data: LectureJobData): Promise<void> {
  // Always trigger async background execution so HTTP handler returns in < 1 second!
  setImmediate(async () => {
    if (isRedisAvailable && lectureQueue) {
      try {
        await Promise.race([
          lectureQueue.add('process-lecture', data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Queue timeout')), 2000)),
        ]);
        console.log(`📥 [BullMQ] Job queued for lecture ${data.lectureId}`);
        return;
      } catch (e) {
        console.warn(`⚠️ [BullMQ Queue] Redis queue add failed or timed out, executing direct worker fallback:`, (e as any).message);
      }
    }

    // Direct background worker execution fallback
    processLectureJob(data).catch((err) => {
      console.error(`❌ [Background Worker] Processing failed for lecture ${data.lectureId}:`, err.message || err);
    });
  });

  console.log(`⚡ [Queue] Background processing dispatched for lecture ${data.lectureId}`);
}
