"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Sparkles,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  createdBy?: { name: string };
  createdAt: string;
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/v1/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || data);
      }
    } catch (e) {
      console.error("Error fetching courses:", e);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setCreating(true);
    setMessage(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/v1/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        setMessage("Course created successfully!");
        setTitle("");
        setDescription("");
        fetchCourses();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.message || err.error}`);
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-admin px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Admin Console
            </span>
            <span className="text-xs text-slate-500 font-medium">Platform Management</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-2">
            Course Administration & User Matrix
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Create academic courses, assign teachers and students, and monitor platform health metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-indigo-700 font-semibold block">Total Courses</span>
            <span className="font-heading font-extrabold text-lg text-indigo-900">
              {courses.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Course Widget */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Create New Course
                </h3>
                <p className="text-[11px] text-slate-500">
                  Add course to system directory
                </p>
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  message.startsWith("Error")
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CS50 AI & Machine Learning"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of course curriculum and goals..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={!title || creating}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {creating ? "Creating Course..." : "Create Course"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (2/3): Existing Courses Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Platform Courses Directory
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {courses.length} Active Courses
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  No courses created yet. Use the form on the left to add one!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                          ACTIVE COURSE
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-slate-900 text-sm mt-2">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {c.description || "No description specified."}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Created By: {c.createdBy?.name || "Admin"}</span>
                      <span className="font-mono text-slate-400">{c.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
