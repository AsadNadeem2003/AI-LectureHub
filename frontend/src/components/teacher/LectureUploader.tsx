"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface LectureUploaderProps {
  courses: Course[];
  onUploadComplete?: () => void;
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
        const res = await fetch(`http://localhost:5000/api/v1/lectures/${processingLectureId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "READY") {
            setStatus("READY");
            clearInterval(interval);
            if (onUploadComplete) onUploadComplete();
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
    if (!selectedFile || !title || !courseId) return;

    setUploading(true);
    setStatus("UPLOADING");
    setErrorMessage(null);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("courseId", courseId);

    try {
      const res = await fetch("http://localhost:5000/api/v1/lectures/upload", {
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
    <div className="glass-card rounded-2xl p-6 border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
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
              value={courseId}
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
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    Click to upload slide presentation or document
                  </span>
                  <span className="text-xs text-slate-400">
                    Supports PDF, PPTX, or DOCX up to 50MB
                  </span>
                </div>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={!selectedFile || !title || uploading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg text-sm font-bold shadow-md shadow-amber-500/20 hover:from-amber-700 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading File...
              </>
            ) : (
              "Start AI Lecture Processing"
            )}
          </button>
        </form>
      ) : status === "PROCESSING" ? (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-6 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-600 animate-bounce">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">
              Processing AI Lecture in Background...
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Parsing slides $\rightarrow$ ChromaDB vector indexing $\rightarrow$ Gemini LLM script generation $\rightarrow$ Google TTS audio synthesis.
            </p>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      ) : status === "READY" ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">
              AI Lecture Ready!
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Audio narration and synchronized slide segments generated successfully.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Upload Another Lecture
          </button>
        </div>
      ) : (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">
              Processing Failed
            </h4>
            <p className="text-xs text-rose-600 mt-1">{errorMessage}</p>
          </div>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
