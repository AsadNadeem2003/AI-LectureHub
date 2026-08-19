"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface LectureUploaderProps {
  courses: Course[];
  onUploadComplete?: (courseId: string) => void;
}

export default function LectureUploader({ courses, onUploadComplete }: LectureUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processingLectureId, setProcessingLectureId] = useState<string | null>(null);
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED">("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  // Poll status when processing a lecture
  useEffect(() => {
    if (!processingLectureId || status === "READY" || status === "FAILED") return;

    const token = localStorage.getItem("token");
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/lectures/${processingLectureId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "READY") {
            setStatus("READY");
            clearInterval(interval);
            const targetCourseId = courseId || (courses.length > 0 ? courses[0].id : "");
            if (onUploadComplete) onUploadComplete(targetCourseId);
          } else if (data.status === "FAILED") {
            setStatus("FAILED");
            setErrorMessage(data.errorMessage || "Processing failed");
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error("Error polling lecture status:", e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [processingLectureId, status, onUploadComplete]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetCourseId = courseId || (courses.length > 0 ? courses[0].id : "");

    if (!selectedFile) {
      setErrorMessage("Please select a PDF, PPTX, or DOCX file to upload.");
      return;
    }
    if (!title.trim()) {
      setErrorMessage("Please enter a title for the lecture.");
      return;
    }
    if (!targetCourseId) {
      setErrorMessage("No course selected or available.");
      return;
    }

    setUploading(true);
    setStatus("UPLOADING");
    setErrorMessage(null);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title.trim());
    formData.append("courseId", targetCourseId);

    try {
      const res = await fetch("/api/v1/lectures/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setUploading(false);

      if (res.ok && data.lecture) {
        setProcessingLectureId(data.lecture.id);
        setStatus("PROCESSING");
      } else {
        setStatus("FAILED");
        setErrorMessage(data.error || "Failed to upload document");
      }
    } catch (err: any) {
      setUploading(false);
      setStatus("FAILED");
      setErrorMessage(err.message || "Network error occurred");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setStatus("IDLE");
    setProcessingLectureId(null);
    setErrorMessage(null);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-slate-900 text-base">
            Upload Lecture Source Material
          </h3>
          <p className="text-xs text-slate-500">
            Upload PDF, PPTX, or DOCX slides to generate AI voice, transcript & synchronized segments.
          </p>
        </div>
      </div>

      {status === "IDLE" || status === "UPLOADING" ? (
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lecture Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Learning & Neural Architectures"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign to Course
            </label>
            <select
              value={courseId || (courses.length > 0 ? courses[0].id : "")}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop File Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/50 rounded-xl p-6 text-center transition-colors">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.pptx,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <Upload className="w-6 h-6" />
              </div>
              {selectedFile ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText className="w-4 h-4 text-amber-600" />
                  {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-700">
                    Click to select presentation file or drag and drop
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports PDF, PPTX, or DOCX (Up to 50MB)
                  </p>
                </>
              )}
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !selectedFile || !title.trim()}
            className="w-full py-2.5 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading Document...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Process & Publish Lecture
              </>
            )}
          </button>
        </form>
      ) : status === "PROCESSING" ? (
        <div className="py-8 text-center space-y-3 bg-amber-50/50 rounded-xl border border-amber-200">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">Processing AI Voice & Slide Visuals</h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Analyzing slide visuals, generating conceptual professor transcripts, and synthesizing synchronized studio audio narration (~15 seconds)...
          </p>
        </div>
      ) : status === "READY" ? (
        <div className="py-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">Lecture Successfully Processed!</h4>
          <p className="text-xs text-slate-600">
            Voice narration and synchronized slide segments are ready.
          </p>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
          >
            Upload Another Lecture
          </button>
        </div>
      ) : (
        <div className="py-8 text-center space-y-3 bg-rose-50 rounded-xl border border-rose-200">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">Processing Failed</h4>
          <p className="text-xs text-rose-600 max-w-md mx-auto whitespace-pre-wrap font-mono">
            {errorMessage || "An unexpected error occurred during processing."}
          </p>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
