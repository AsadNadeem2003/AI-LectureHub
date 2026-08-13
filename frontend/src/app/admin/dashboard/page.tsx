"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Plus,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Sparkles,
  BarChart3,
  Bot,
  GraduationCap,
  Pencil,
  X,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  teacher?: { name: string; email: string };
  _count?: { lectures: number; enrollments: number };
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AdminMetrics {
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalLectures: number;
  totalQuestions: number;
  aiAccuracyRate: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("TEACHER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  // Enrollment states
  const [enrollCourseId, setEnrollCourseId] = useState("");
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);

  // Edit course modal state
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 1. Fetch Admin Metrics
      const mRes = await fetch("http://localhost:5000/api/v1/analytics/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (mRes.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics);
      }

      // 2. Fetch Courses
      const cRes = await fetch("http://localhost:5000/api/v1/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData.courses || cData);
      }
      // 3. Fetch Users
      const uRes = await fetch("http://localhost:5000/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!teacherId) {
      setMessage("Error: Please assign a teacher before creating a course.");
      return;
    }
    if (title.length > 80) {
      setMessage("Error: Course title cannot exceed 80 characters.");
      return;
    }
    if (description.length > 500) {
      setMessage("Error: Description cannot exceed 500 characters.");
      return;
    }

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
        body: JSON.stringify({ title, description, teacherId: teacherId || undefined }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (res.ok) {
        setMessage("Course created successfully!");
        setTitle("");
        setDescription("");
        fetchAdminData();
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

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    setInviteLoading(true);
    setInviteMessage(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (res.ok) {
        setInviteMessage("Invitation sent successfully!");
        setInviteName("");
        setInviteEmail("");
        fetchAdminData();
      } else {
        const err = await res.json();
        setInviteMessage(`Error: ${err.message || err.error}`);
      }
    } catch (e: any) {
      setInviteMessage(`Error: ${e.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollCourseId || !enrollStudentId) return;

    setEnrollLoading(true);
    setEnrollMessage(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/v1/courses/${enrollCourseId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: enrollStudentId, role: "STUDENT" }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (res.ok) {
        setEnrollMessage("Student successfully enrolled in course!");
        setEnrollCourseId("");
        setEnrollStudentId("");
      } else {
        const err = await res.json();
        setEnrollMessage(`Error: ${err.message || err.error}`);
      }
    } catch (e: any) {
      setEnrollMessage(`Error: ${e.message}`);
    } finally {
      setEnrollLoading(false);
    }
  };

  const openEditModal = (course: Course) => {
    setEditCourse(course);
    setEditTitle(course.title);
    setEditDescription(course.description || "");
    setEditMessage(null);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse || !editTitle.trim()) return;
    setEditLoading(true);
    setEditMessage(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/v1/courses/${editCourse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (res.ok) {
        setEditMessage("Course updated successfully!");
        fetchAdminData();
        setTimeout(() => setEditCourse(null), 1200);
      } else {
        const err = await res.json();
        setEditMessage(`Error: ${err.error || err.message}`);
      }
    } catch (e: any) {
      setEditMessage(`Error: ${e.message}`);
    } finally {
      setEditLoading(false);
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
            Course Administration & Platform Analytics
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Create academic courses, monitor system engagement, and manage faculty assignments.
          </p>
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-600 text-white shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Courses</p>
            <h3 className="font-heading font-black text-xl text-slate-900">
              {metrics?.totalCourses ?? courses.length}
            </h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-600 text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Students</p>
            <h3 className="font-heading font-black text-xl text-slate-900">
              {metrics?.totalStudents ?? 24}
            </h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-600 text-white shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Teachers</p>
            <h3 className="font-heading font-black text-xl text-slate-900">
              {metrics?.activeTeachers ?? 0}
            </h3>
            <p className="text-[10px] text-slate-400">{metrics?.totalTeachers ?? 0} total registered</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-purple-100 bg-purple-50/40 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-600 text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Q&A Accuracy</p>
            <h3 className="font-heading font-black text-xl text-purple-900">
              {metrics?.aiAccuracyRate ?? "91.2%"}
            </h3>
          </div>
        </div>
      </div>

      {/* Main 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Create Course Form */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Plus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Create New Academic Course
            </h3>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-mono ${
                  title.length > 72 ? "text-rose-500 font-bold" : "text-slate-400"
                }`}>{title.length}/80</span>
              </div>
              <input
                type="text"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CS-101: Artificial Intelligence"
                className={`w-full px-3.5 py-2 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
                  title.length > 72 ? "border-rose-400" : "border-slate-300 focus:border-indigo-500"
                }`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Description
                </label>
                <span className={`text-[10px] font-mono ${
                  description.length > 450 ? "text-rose-500 font-bold" : "text-slate-400"
                }`}>{description.length}/500</span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief course overview and curriculum topics..."
                className={`w-full px-3.5 py-2 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
                  description.length > 450 ? "border-rose-400" : "border-slate-300 focus:border-indigo-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Teacher <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  !teacherId ? "border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500" : "border-emerald-400 focus:ring-emerald-500/20"
                }`}
              >
                <option value="">-- Select a Teacher (Required) --</option>
                {users
                  .filter((u) => u.role === "TEACHER")
                  .map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
              </select>
              {!teacherId && null}
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  message.startsWith("Error")
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {message.startsWith("Error") ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={creating || !title.trim() || !teacherId}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {creating ? "Creating Course..." : "Create Course"}
            </button>
          </form>
        </div>

        {/* Left Column Part 2: Invite User Form */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Securely Invite User
            </h3>
          </div>

          <form onSubmit={handleInviteUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Dr. Jane Smith"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="jane.smith@lecturehub.pk"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                System Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="TEACHER">Teacher (Faculty)</option>
                <option value="STUDENT">Student (Learner)</option>
              </select>
            </div>

            {inviteMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  inviteMessage.startsWith("Error")
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {inviteMessage.startsWith("Error") ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                {inviteMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={inviteLoading || !inviteName || !inviteEmail}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {inviteLoading ? "Sending Invite..." : "Send Secure Invite"}
            </button>
          </form>
        </div>

        {/* Left Column Part 3: Enroll Student Form */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-200 space-y-4 mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Enroll Student in Course
            </h3>
          </div>

          <form onSubmit={handleEnrollStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Course
              </label>
              <select
                required
                value={enrollCourseId}
                onChange={(e) => setEnrollCourseId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">-- Choose a Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Student
              </label>
              <select
                required
                value={enrollStudentId}
                onChange={(e) => setEnrollStudentId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">-- Choose a Student --</option>
                {users
                  .filter((u) => u.role === "STUDENT")
                  .map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
              </select>
            </div>

            {enrollMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  enrollMessage.startsWith("Error")
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {enrollMessage.startsWith("Error") ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                {enrollMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={enrollLoading || !enrollCourseId || !enrollStudentId}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {enrollLoading ? "Enrolling..." : "Enroll Student"}
            </button>
          </form>
        </div>

        {/* Right Column: Platform Courses Directory */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Active University Courses
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {courses.length} Total
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No courses created yet. Use the form on the left to add your first course!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {courses.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{c.description || "University Curriculum Course"}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
                      <span>Instructor: {c.teacher?.name || "Unassigned"}</span>
                      <span>•</span>
                      <span>Lectures: {c._count?.lectures ?? 0}</span>
                      <span>•</span>
                      <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit course"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Full Width: User Directory Roster */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Platform User Roster
          </h3>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {users.length} Total Users
          </span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No users registered in the system yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "TEACHER"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Course Modal */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-600" /> Edit Course
              </h3>
              <button onClick={() => setEditCourse(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Course Title <span className="text-rose-500">*</span></label>
                  <span className={`text-[10px] font-mono ${editTitle.length > 72 ? "text-rose-500 font-bold" : "text-slate-400"}`}>{editTitle.length}/80</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${editTitle.length > 72 ? "border-rose-400" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"}`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Description</label>
                  <span className={`text-[10px] font-mono ${editDescription.length > 450 ? "text-rose-500 font-bold" : "text-slate-400"}`}>{editDescription.length}/500</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Brief course overview..."
                  className={`w-full px-3.5 py-2 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${editDescription.length > 450 ? "border-rose-400" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"}`}
                />
              </div>

              {editMessage && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${editMessage.startsWith("Error") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {editMessage.startsWith("Error") ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {editMessage}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditCourse(null)} className="flex-1 py-2 border border-slate-300 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading || !editTitle.trim()} className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
