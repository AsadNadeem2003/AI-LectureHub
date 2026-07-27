"use client";

import { useEffect, useState } from "react";
import LectureUploader from "@/components/teacher/LectureUploader";
import {
  BookOpen,
  Play,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  UserCheck,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
}

interface Lecture {
  id: string;
  title: string;
  status: "PROCESSING" | "READY" | "FAILED";
  isStarted: boolean;
  sourceFileUrl: string;
  createdAt: string;
}

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      // 1. Fetch courses
      const cRes = await fetch("http://localhost:5000/api/v1/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cRes.ok) {
        const cData = await cRes.json();
        const courseList = cData.courses || cData;
        setCourses(courseList);
        if (courseList.length > 0 && !selectedCourseId) {
          setSelectedCourseId(courseList[0].id);
        }
      }
    } catch (e) {
      console.error("Error fetching teacher dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch lectures when course selected
  useEffect(() => {
    if (!selectedCourseId) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/v1/lectures/course/${selectedCourseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setLectures(data.lectures || []);
      })
      .catch((err) => console.error(err));
  }, [selectedCourseId]);

  const handleStartLecture = async (lectureId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/v1/lectures/${lectureId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLectures((prev) =>
          prev.map((l) => (l.id === lectureId ? { ...l, isStarted: true } : l))
        );
      }
    } catch (e) {
      console.error("Error starting lecture:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-teacher px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Teacher Studio
            </span>
            <span className="text-xs text-slate-500 font-medium">Command Center</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-2">
            Lecture Studio & Escalated Q&A Queue
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Upload course presentations, monitor AI synthesis progress, and publish interactive audio lectures to students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-amber-700 font-semibold block">Assigned Courses</span>
            <span className="font-heading font-extrabold text-lg text-amber-900">
              {courses.length}
            </span>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-indigo-700 font-semibold block">Total Lectures</span>
            <span className="font-heading font-extrabold text-lg text-indigo-900">
              {lectures.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2/3 and 1/3 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Uploader + Lectures List */}
        <div className="lg:col-span-2 space-y-6">
          <LectureUploader courses={courses} onUploadComplete={fetchData} />

          {/* Assigned Courses & Lecture Management */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                Course Lectures & Activation
              </h3>

              {courses.length > 0 && (
                <select
                  value={selectedCourseId || ""}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-800"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {lectures.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  No lectures uploaded yet for this course. Use the uploader above to add one!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lectures.map((lec) => (
                  <div key={lec.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{lec.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            lec.status === "READY"
                              ? "bg-emerald-100 text-emerald-700"
                              : lec.status === "PROCESSING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {lec.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Uploaded {new Date(lec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {lec.status === "READY" && !lec.isStarted ? (
                        <button
                          onClick={() => handleStartLecture(lec.id)}
                          className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-amber-700 transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Publish to Students
                        </button>
                      ) : lec.isStarted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active for Students
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Processing AI Audio...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Sticky Escalated Questions Queue */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 border border-slate-200 sticky top-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Escalated Questions
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                0 Pending
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Questions asked by students during lecture playback that required teacher review.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 text-center border border-dashed border-slate-200 space-y-2">
              <UserCheck className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-semibold">
                No escalated questions pending!
              </p>
              <p className="text-[11px] text-slate-400">
                All student Q&A inquiries were successfully answered by AI grounded in lecture content.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
