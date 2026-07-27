"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  createdBy?: { name: string };
}

interface Lecture {
  id: string;
  title: string;
  status: "READY";
  isStarted: boolean;
  audioUrl?: string;
  createdAt: string;
  uploadedBy?: { name: string };
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/v1/courses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = data.courses || data;
        setCourses(list);
        if (list.length > 0) setSelectedCourseId(list[0].id);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-student px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Student Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">Interactive Learning</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-2">
            Enrolled Courses & Interactive Lectures
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Access synchronized AI voice lectures with page visual slides, live auto-scroll transcripts, and grounded AI Q&A.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-emerald-700 font-semibold block">Active Courses</span>
            <span className="font-heading font-extrabold text-lg text-emerald-900">
              {courses.length}
            </span>
          </div>
        </div>
      </div>

      {/* Courses Selection Grid */}
      <div className="space-y-3">
        <h2 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          Select Enrolled Course
        </h2>

        {courses.length === 0 ? (
          <div className="glass-card p-8 text-center rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">
              No courses enrolled yet. Ask your teacher or admin to assign you to a course!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((c) => {
              const isSelected = c.id === selectedCourseId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`text-left p-4 rounded-xl transition-all border ${
                    isSelected
                      ? "bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Course
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    )}
                  </div>
                  <h3 className="font-heading font-extrabold text-slate-900 text-sm mt-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {c.description || "Interactive AI Lecture Hub Course"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Lectures List */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Published Lectures & Playback Studio
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {lectures.length} Available Lectures
          </span>
        </div>

        {lectures.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              No active lectures published for this course yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Your teacher will activate AI synthesized lectures here once processing is ready.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lectures.map((lec) => (
              <div
                key={lec.id}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      READY FOR PLAYBACK
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(lec.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-slate-900 text-base mt-2">
                    {lec.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Instructor: {lec.uploadedBy?.name || "Course Instructor"}
                  </p>
                </div>

                <Link
                  href={`/student/lecture/${lec.id}`}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4 fill-current" />
                  Open Interactive Lecture Studio
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
