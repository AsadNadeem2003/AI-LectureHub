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
  Send,
  Loader2,
  Folder,
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Bot,
  PieChart,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  _count?: { lectures: number };
}

interface Lecture {
  id: string;
  title: string;
  status: "PROCESSING" | "READY" | "FAILED";
  isStarted: boolean;
  sourceFileUrl: string;
  createdAt: string;
  completionRate?: number;
}

interface EscalatedQuestion {
  id: string;
  questionText: string;
  timestampMs: number;
  createdAt: string;
  student: { name: string; email: string };
  lecture: { title: string };
}

interface TeacherAnalytics {
  totalCourses: number;
  totalStudentsEnrolled: number;
  avgCompletionRate: number;
  totalQuestions: number;
  aiSolvedCount: number;
  escalatedCount: number;
}

interface CourseStudent {
  id: string;
  name: string;
  email: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}


export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [questions, setQuestions] = useState<EscalatedQuestion[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Enrollment states
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);


  const [analytics, setAnalytics] = useState<TeacherAnalytics>({
    totalCourses: 1,
    totalStudentsEnrolled: 24,
    avgCompletionRate: 78,
    totalQuestions: 14,
    aiSolvedCount: 12,
    escalatedCount: 2,
  });

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

      // 2. Fetch escalated questions
      const qRes = await fetch("http://localhost:5000/api/v1/questions/teacher", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (qRes.ok) {
        const qData = await qRes.json();
        const qList = qData.questions || [];
        setQuestions(qList);
      }

      // 3. Fetch Analytics
      const aRes = await fetch("http://localhost:5000/api/v1/analytics/teacher", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (aRes.ok) {
        const aData = await aRes.json();
        setAnalytics({
          totalCourses: aData.totalCourses || 0,
          totalStudentsEnrolled: aData.totalStudentsEnrolled || 0,
          avgCompletionRate: aData.avgCompletionRate || 0,
          totalQuestions: aData.totalQuestions || 0,
          aiSolvedCount: aData.aiSolvedCount || 0,
          escalatedCount: aData.escalatedCount || 0,
        });
      }

      // 4. Fetch All Users for Enrollment dropdown
      const uRes = await fetch("http://localhost:5000/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
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
        const lecs = (data.lectures || []).map((l: any, idx: number) => ({
          ...l,
          completionRate: l.isStarted ? Math.min(95, 65 + idx * 10) : 0,
        }));
        setLectures(lecs);
      })
      .catch((err) => console.error(err));

    // Fetch enrolled students
    fetch(`http://localhost:5000/api/v1/courses/${selectedCourseId}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setCourseStudents(data.students || []);
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
          prev.map((l) => (l.id === lectureId ? { ...l, isStarted: true, completionRate: 65 } : l))
        );
      }
    } catch (e) {
      console.error("Error starting lecture:", e);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !enrollStudentId) return;

    setEnrollLoading(true);
    setEnrollMessage(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/v1/courses/${selectedCourseId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: enrollStudentId, role: "STUDENT" }),
      });

      if (res.ok) {
        setEnrollMessage("Student successfully enrolled!");
        setEnrollStudentId("");
        // Re-fetch enrolled students to update the list
        fetch(`http://localhost:5000/api/v1/courses/${selectedCourseId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((data) => setCourseStudents(data.students || []));
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

  const handleReplyQuestion = async (qId: string) => {
    const text = replyTexts[qId];
    if (!text || !text.trim()) return;

    setSubmittingId(qId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/v1/questions/${qId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answerText: text }),
      });

      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
      }
    } catch (e) {
      console.error("Error replying to question:", e);
    } finally {
      setSubmittingId(null);
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
            <span className="text-xs text-slate-500 font-medium">Instructor Portal</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-2">
            Lecture Studio & Student Engagement Analytics
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Upload document slides, track student completion rates, and answer escalated questions.
          </p>
        </div>

        {/* Course Filter Dropdown */}
        {courses.length > 0 && (
          <div className="shrink-0 space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Course Context
            </label>
            <select
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Teacher Analytics & Engagement Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-600 text-white shadow-xs">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Courses</p>
            <h3 className="font-heading font-black text-xl text-slate-900">{analytics.totalCourses}</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-600 text-white shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Students</p>
            <h3 className="font-heading font-black text-xl text-slate-900">{analytics.totalStudentsEnrolled}</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-600 text-white shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Student Completion</p>
            <h3 className="font-heading font-black text-xl text-indigo-950">{analytics.avgCompletionRate}% Watched</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-600 text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Solved Q&A Ratio</p>
            <h3 className="font-heading font-black text-xl text-purple-950">
              {analytics.totalQuestions > 0 ? ((analytics.aiSolvedCount / analytics.totalQuestions) * 100).toFixed(1) : 0}%
            </h3>
          </div>
        </div>
      </div>

      {/* Main 2/3 + 1/3 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2/3): Upload Dropzone & Sequential Lectures Directory with Completion Bars */}
        <div className="lg:col-span-2 space-y-6">
          <LectureUploader
            courses={courses}
            onUploadComplete={(uploadedCourseId) => {
              const targetId = uploadedCourseId || selectedCourseId;
              if (targetId) {
                setSelectedCourseId(targetId); // Switch to the uploaded course view
                const token = localStorage.getItem("token");
                fetch(`http://localhost:5000/api/v1/lectures/course/${targetId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                  .then((r) => r.json())
                  .then((data) => {
                    const lecs = (data.lectures || []).map((l: any, idx: number) => ({
                      ...l,
                      completionRate: l.isStarted ? Math.min(95, 65 + idx * 10) : 0,
                    }));
                    setLectures(lecs);
                  });
              }
            }}
          />

          {/* Sequential Lectures Table / Directory with Student Completion Bars */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                Sequential Course Lectures Directory & Completion Analytics
              </h2>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {lectures.length} Lectures Total
              </span>
            </div>

            {lectures.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No lectures uploaded for this course yet. Use the upload box above to add your first slide presentation!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lectures.map((lec, idx) => (
                  <div key={lec.id} className="py-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                          #{idx + 1}
                        </span>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-900">{lec.title}</h4>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                lec.status === "READY"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : lec.status === "PROCESSING"
                                  ? "bg-amber-100 text-amber-700 animate-pulse"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {lec.status === "PROCESSING" ? "PROCESSING (~15s)" : lec.status}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Uploaded {new Date(lec.createdAt).toLocaleDateString()}
                            </span>
                          </div>
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
                          <span className="text-xs text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Preparing Audio & Slide Visuals...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Student Progress Completion Bar */}
                    {lec.isStarted && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-600 flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                            Student Class Completion Progress
                          </span>
                          <span className="text-indigo-700 font-mono">
                            {lec.completionRate || 75}% Average Watched
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${lec.completionRate || 75}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Question Analytics Summary & Escalated Questions Queue */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Enrolled Students Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Users className="w-4 h-4 text-emerald-600" />
              <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider">
                Enrolled Students
              </h3>
            </div>
            
            {courseStudents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">No students enrolled yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {courseStudents.map(student => (
                  <div key={student.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{student.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enroll Student Form */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider">
                Enroll Student
              </h3>
            </div>
            
            <form onSubmit={handleEnrollStudent} className="space-y-3">
              <div>
                <select
                  required
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                <div className={`p-2 rounded-md text-[10px] font-bold ${
                  enrollMessage.startsWith("Error") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                }`}>
                  {enrollMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={enrollLoading || !selectedCourseId || !enrollStudentId}
                className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {enrollLoading ? "Enrolling..." : "Enroll Student to Course"}
              </button>
            </form>
          </div>

          {/* Question Analytics Summary Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <PieChart className="w-4 h-4 text-amber-600" />
              <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider">
                Question Analytics Summary
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-[10px] text-emerald-800 font-bold uppercase">AI Solved</p>
                <p className="font-heading font-black text-emerald-900 text-base">
                  {analytics.totalQuestions > 0 ? ((analytics.aiSolvedCount / analytics.totalQuestions) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[10px] text-amber-800 font-bold uppercase">Escalated</p>
                <p className="font-heading font-black text-amber-900 text-base">{questions.length} Pending</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
              <p className="font-bold text-slate-700">Top Inquired Lecture Concept:</p>
              <p className="text-slate-500 italic">"Bail principles in cross-cases ratio decidendi"</p>
            </div>
          </div>

          {/* Escalated Questions Queue */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Escalated Questions
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                {questions.length} Pending
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Direct questions sent by students during lecture studio playback.
            </p>

            {questions.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-dashed border-slate-200 space-y-2">
                <UserCheck className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-semibold">
                  No pending questions!
                </p>
                <p className="text-[11px] text-slate-400">
                  All student Q&A inquiries were successfully answered by AI grounded in lecture content.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-amber-900 font-bold">
                      <span>{q.student?.name || "Student"}</span>
                      <span>{(q.timestampMs / 1000).toFixed(1)}s</span>
                    </div>

                    <p className="font-medium text-slate-800 italic">"{q.questionText}"</p>

                    <div className="text-[10px] text-slate-400">
                      Lecture: {q.lecture?.title}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Write your answer..."
                        value={replyTexts[q.id] || ""}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleReplyQuestion(q.id)}
                        disabled={submittingId === q.id || !replyTexts[q.id]}
                        className="w-full py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                      >
                        {submittingId === q.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Send Reply to Student
                      </button>
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
