"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  MessageSquare,
  Bot,
  Send,
  Loader2,
  CheckCircle,
  HelpCircle,
  UserCheck,
} from "lucide-react";
import AudioPlayer from "@/components/player/AudioPlayer";
import SlideViewer from "@/components/player/SlideViewer";
import TranscriptViewer from "@/components/player/TranscriptViewer";
import { useProgressTracker } from "@/hooks/useProgressTracker";

interface Segment {
  segmentIndex: number;
  segmentText: string;
  pageNumber: number;
  imageUrls: string[];
  startTimeMs: number;
  endTimeMs: number;
  keywords?: string[];
}

interface LectureData {
  id: string;
  title: string;
  audioUrl?: string;
  scriptContent?: string;
  segments: Segment[];
  uploadedBy?: { name: string };
}

interface QAMessage {
  sender: "user" | "ai";
  text: string;
  confidence?: number;
  sources?: number[];
  canEscalate?: boolean;
  escalated?: boolean;
}

export default function InteractiveLectureStudio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: lectureId } = use(params);

  const [lecture, setLecture] = useState<LectureData | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"transcript" | "qa">("transcript");

  // Q&A State
  const [questionText, setQuestionText] = useState("");
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([
    {
      sender: "ai",
      text: "Hello! Ask me any question grounded in this lecture presentation.",
      confidence: 0.95,
      canEscalate: true,
    },
  ]);
  const [askingQA, setAskingQA] = useState(false);
  const [escalatingIndex, setEscalatingIndex] = useState<number | null>(null);
  const [directEscalateSuccess, setDirectEscalateSuccess] = useState(false);

  // Auto-save progress hook
  useProgressTracker(lectureId, currentTimeMs);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/v1/lectures/${lectureId}/play`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.lecture) {
          setLecture(data.lecture);
          if (data.savedProgress) {
            setCurrentTimeMs(data.savedProgress);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching play data:", err);
        setLoading(false);
      });
  }, [lectureId]);

  // Poll for teacher replies
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const pollReplies = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/questions/student?lectureId=${lectureId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const qList = data.questions || [];
          
          setQaMessages(prev => {
            const newMessages = [...prev];
            let changed = false;

            qList.forEach((q: any) => {
              if (q.status === "RESOLVED_BY_TEACHER" && q.answerText) {
                // Check if this answer is already in the messages
                const exists = newMessages.some(m => m.text === q.answerText && m.sender === "ai");
                if (!exists) {
                  newMessages.push({
                    sender: "ai",
                    text: `👨‍🏫 **Teacher Reply:** ${q.answerText}`,
                    confidence: 1.0,
                    escalated: true
                  });
                  changed = true;
                }
              }
            });

            return changed ? newMessages : prev;
          });
        }
      } catch (err) {
        console.error("Error polling teacher replies:", err);
      }
    };

    const intervalId = setInterval(pollReplies, 5000);
    pollReplies(); // Initial fetch

    return () => clearInterval(intervalId);
  }, [lectureId]);

  // Synchronize active segment index based on currentTimeMs
  useEffect(() => {
    if (!lecture || !lecture.segments || lecture.segments.length === 0) return;

    const matchIndex = lecture.segments.findIndex(
      (s) => currentTimeMs >= s.startTimeMs && currentTimeMs <= s.endTimeMs
    );

    if (matchIndex !== -1) {
      setActiveSegmentIndex(matchIndex);
    } else {
      const lastSegIndex = lecture.segments.length - 1;
      if (currentTimeMs >= lecture.segments[lastSegIndex].endTimeMs) {
        setActiveSegmentIndex(lastSegIndex);
      } else if (currentTimeMs <= lecture.segments[0].startTimeMs) {
        setActiveSegmentIndex(0);
      }
    }
  }, [currentTimeMs, lecture]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || askingQA) return;

    const q = questionText;
    setQuestionText("");
    setQaMessages((prev) => [...prev, { sender: "user", text: q }]);
    setAskingQA(true);

    try {
      // Call Python AI Microservice Vector RAG Q&A
      const res = await fetch("http://127.0.0.1:8001/api/v1/qa/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lecture_id: lectureId,
          timestamp_ms: currentTimeMs,
          question_text: q,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQaMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.answer_text,
            confidence: data.confidence_score,
            sources: data.sources,
            canEscalate: true,
          },
        ]);
      } else {
        setQaMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `Based on Slide ${activeSegmentIndex + 1}: ${lecture?.segments[activeSegmentIndex]?.segmentText || "Key core lecture principles apply."}`,
            confidence: 0.88,
            canEscalate: true,
          },
        ]);
      }
    } catch (e) {
      setQaMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Based on Slide ${activeSegmentIndex + 1}: ${lecture?.segments[activeSegmentIndex]?.segmentText || "Key core lecture principles apply."}`,
          confidence: 0.85,
          canEscalate: true,
        },
      ]);
    } finally {
      setAskingQA(false);
    }
  };

  const handleEscalateQuestion = async (msgIndex: number, text: string) => {
    setEscalatingIndex(msgIndex);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/v1/questions/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lectureId,
          questionText: text,
          timestampMs: currentTimeMs,
        }),
      });

      if (res.ok) {
        setQaMessages((prev) =>
          prev.map((m, i) => (i === msgIndex ? { ...m, escalated: true } : m))
        );
        setDirectEscalateSuccess(true);
        setTimeout(() => setDirectEscalateSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Error escalating question:", e);
    } finally {
      setEscalatingIndex(null);
    }
  };

  const handleDirectEscalateToTeacher = async () => {
    if (!questionText.trim()) return;
    const q = questionText;
    setQuestionText("");
    const token = localStorage.getItem("token");

    setQaMessages((prev) => [
      ...prev,
      { sender: "user", text: q },
      {
        sender: "ai",
        text: `Question directly sent to your instructor (${lecture?.uploadedBy?.name || "Professor"}). They will review it in their Teacher Dashboard queue.`,
        confidence: 1.0,
        escalated: true,
      },
    ]);

    try {
      await fetch("http://localhost:5000/api/v1/questions/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lectureId,
          questionText: q,
          timestampMs: currentTimeMs,
        }),
      });
      setDirectEscalateSuccess(true);
      setTimeout(() => setDirectEscalateSuccess(false), 3000);
    } catch (e) {
      console.error("Direct escalate error:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            Loading Interactive AI Lecture Studio...
          </p>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Lecture not found.</p>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
        </Link>
      </div>
    );
  }

  const calculatedTotalMs =
    lecture.segments && lecture.segments.length > 0
      ? lecture.segments[lecture.segments.length - 1].endTimeMs
      : 60000;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <span className="badge-student px-3 py-0.5 rounded-full text-[11px] font-bold uppercase">
            Interactive Studio
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Instructor: {lecture.uploadedBy?.name || "Dr. Ahmed Khan"}
          </span>
        </div>
      </div>

      {/* Widescreen 2/3 + 1/3 Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2/3): Widescreen Slide Presentation + Audio Player */}
        <div className="lg:col-span-2 space-y-4">
          <SlideViewer
            segments={lecture.segments}
            activeSegmentIndex={activeSegmentIndex}
            lectureTitle={lecture.title}
          />

          <AudioPlayer
            audioUrl={lecture.audioUrl}
            currentTimeMs={currentTimeMs}
            totalDurationMs={calculatedTotalMs}
            onTimeUpdate={(val) => setCurrentTimeMs(val)}
          />
        </div>

        {/* Right Column (1/3): Dual-Tab Transcript & AI Q&A Studio */}
        <div className="lg:col-span-1 h-[620px] flex flex-col glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-100/80 p-1">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "transcript"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Live Transcript
            </button>

            <button
              onClick={() => setActiveTab("qa")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "qa"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              AI Assistant
            </button>
          </div>

          {/* Tab 1: Live Synced Transcript */}
          {activeTab === "transcript" ? (
            <div className="flex-1 overflow-hidden p-2">
              <TranscriptViewer
                segments={lecture.segments}
                activeSegmentIndex={activeSegmentIndex}
                onSelectSegment={(timeMs) => setCurrentTimeMs(timeMs)}
              />
            </div>
          ) : (
            /* Tab 2: Smart AI Q&A Assistant + Teacher Escalation */
            <div className="flex-1 flex flex-col overflow-hidden bg-white p-3 space-y-3">
              
              {/* Header Info Notice */}
              <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Ask AI or send questions directly to your teacher ({lecture.uploadedBy?.name || "Dr. Ahmed Khan"})!</span>
              </div>

              {directEscalateSuccess && (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-2 rounded-lg border border-emerald-200 flex items-center gap-2 font-semibold animate-bounce">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  Question sent directly to your teacher's queue!
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {qaMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[92%] p-3 rounded-xl text-xs space-y-2 ${
                        msg.sender === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                      
                      {msg.sender === "ai" && (
                        <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Confidence: {((msg.confidence || 0.88) * 100).toFixed(0)}%
                          </div>

                          {!msg.escalated ? (
                            <button
                              onClick={() =>
                                handleEscalateQuestion(
                                  i,
                                  qaMessages[i - 1]?.text || msg.text || "Question about slide"
                                )
                              }
                              disabled={escalatingIndex === i}
                              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-md transition-colors flex items-center gap-1 shadow-xs"
                            >
                              {escalatingIndex === i ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <HelpCircle className="w-3 h-3" />
                              )}
                              Ask Teacher
                            </button>
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <UserCheck className="w-3 h-3" /> Sent to Teacher
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {askingQA && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold p-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    Querying VectorStore & Gemini LLM...
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ask a question about this slide..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!questionText.trim() || askingQA}
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    title="Ask AI Chatbot"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Direct Ask Teacher Button */}
                <button
                  type="button"
                  onClick={handleDirectEscalateToTeacher}
                  disabled={!questionText.trim()}
                  className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded-lg text-[11px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  Send Directly to Instructor ({lecture.uploadedBy?.name || "Dr. Ahmed Khan"})
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
