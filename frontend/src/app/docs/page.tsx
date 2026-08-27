"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Cpu,
  Layers,
  Shield,
  Server,
  Database,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Workflow,
  Zap,
  Code2,
  FileText,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Network,
  Mic,
  MessageSquare,
  BarChart3,
  Globe2,
  KeyRound,
  RefreshCw,
  Terminal,
  Play,
  Sliders,
  Compass,
  HelpCircle,
  FolderOpen,
  Send,
  AlertTriangle,
} from "lucide-react";

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [activeDiagram, setActiveDiagram] = useState<"arch" | "pipeline" | "erd" | "rag">("arch");
  const [activeApiTab, setActiveApiTab] = useState<"auth" | "courses" | "lectures" | "qa" | "analytics" | "users" | "ai">("auth");
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const navItems = [
    { id: "overview", label: "Executive & Product Overview", icon: Sparkles },
    { id: "user-guides", label: "Role User Guides (How It Works)", icon: Compass },
    { id: "components", label: "Frontend & Player Architecture", icon: LayoutDashboard },
    { id: "ai-engine", label: "AI Microservice & Speech Pipeline", icon: Cpu },
    { id: "diagrams", label: "Interactive Architecture & ERD", icon: Layers },
    { id: "rbac", label: "RBAC Security & Permission Matrix", icon: Shield },
    { id: "api", label: "Comprehensive REST & AI API Reference", icon: Code2 },
    { id: "infra", label: "AWS Cloud Deployment & Compliance", icon: Server },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-indigo-950 via-slate-900 to-slate-950 border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Enterprise v2.4 Reference
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">
              Interactive System, API &amp; Architecture Documentation
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Open Application <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sticky Left Navigation Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20 space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-800">
                  <div className="p-2 rounded-xl bg-linear-to-tr from-emerald-500 to-indigo-600 text-white shadow-lg shadow-emerald-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-sm text-white leading-none">
                      Documentation
                    </h2>
                    <span className="text-[10px] text-slate-400 font-medium">
                      AI LectureHub Enterprise
                    </span>
                  </div>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          const el = document.getElementById(item.id);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1.5 font-mono">
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Gateway:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        HTTPS :443
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Domain:</span>
                      <span className="text-slate-300 text-[10px]">
                        3.89.86.157.sslip.io
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-16">
            
            {/* ========================================================================= */}
            {/* SECTION 1: EXECUTIVE & PRODUCT OVERVIEW */}
            {/* ========================================================================= */}
            <section id="overview" className="space-y-6 scroll-mt-20">
              <div className="p-8 rounded-3xl bg-linear-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Sparkles className="w-3.5 h-3.5" /> Executive Summary &amp; System Purpose
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    AI LectureHub — The Next-Gen Interactive University Lecture Platform
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                    AI LectureHub is an enterprise-grade education platform that transforms static academic presentations (PDF and PPTX files) into **immersive, studio-narrated AI lecture masterclasses**. It synchronizes visual slides with studio neural audio, clusters verbose presentations into concise thematic modules, and provides real-time RAG question-answering with human-in-the-loop teacher escalation.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-2xl font-black text-emerald-400">75% Faster</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">
                        Lecture comprehension via Thematic Cognitive Chunking
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-2xl font-black text-indigo-400">&lt; 15 Seconds</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">
                        Full 45-slide AI parsing, speech synthesis &amp; vector indexing
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-2xl font-black text-amber-400">100% Retained</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">
                        All diagrams and visual slides kept for student playback
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">1. Zero Instructor Overhead</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Faculty upload existing lecture slides. The platform automatically writes an engaging script, generates neural audio, and packages media streams without requiring microphone or camera recording.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">2. Multi-Track Synced Studio</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Students listen to crystal-clear neural narration while the slide viewer advances automatically in lockstep with the live transcript, offering variable playback speeds (0.75x to 2x).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">3. Precision RAG Q&amp;A</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Queries are answered using Groq Llama 3.3 70B grounded strictly on slide vector embeddings. If confidence is uncertain or the student requests it, the query escalates to the instructor.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 2: HOW IT WORKS — ROLE-BY-ROLE USER JOURNEY */}
            {/* ========================================================================= */}
            <section id="user-guides" className="space-y-6 scroll-mt-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    How It Works — Step-by-Step User Journeys
                  </h2>
                  <p className="text-xs text-slate-400">
                    A clear, non-technical walkthrough of how each user interacts with the system
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Admin Journey */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
                    <span>👑 Admin Workflow (Institution Management)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 1: Sign In</span>
                      <p className="text-slate-400">Log into the system with administrative master credentials.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 2: Create Course</span>
                      <p className="text-slate-400">Define course code (e.g. CS-401) and title (Computer Networks).</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 3: Assign Teacher</span>
                      <p className="text-slate-400">Assign authorized faculty members to lead specific courses.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 4: Provision Users</span>
                      <p className="text-slate-400">Invite teachers and students with automated onboarding links.</p>
                    </div>
                  </div>
                </div>

                {/* Teacher Journey */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>👨‍🏫 Teacher Workflow (Lecture Creation &amp; Escalation Inbox)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 1: Select Course</span>
                      <p className="text-slate-400">Open your assigned course in the Teacher Studio.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 2: Upload Slides</span>
                      <p className="text-slate-400">Drag &amp; drop standard `.pdf` or `.pptx` presentations.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 3: AI Generation</span>
                      <p className="text-slate-400">AI extracts diagrams, clusters modules, and writes studio audio.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 4: Answer Inbox</span>
                      <p className="text-slate-400">Review student questions that required teacher clarification.</p>
                    </div>
                  </div>
                </div>

                {/* Student Journey */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <GraduationCap className="w-5 h-5" />
                    <span>🎓 Student Workflow (Interactive Learning &amp; AI Tutoring)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 1: Browse Courses</span>
                      <p className="text-slate-400">Access enrolled subjects and lecture modules.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 2: Studio Player</span>
                      <p className="text-slate-400">Listen to neural narration while slides flip in sync with transcript.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 3: Ask AI Tutor</span>
                      <p className="text-slate-400">Ask any question to receive instant answers grounded on the slides.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-bold text-white">Step 4: Ask Teacher</span>
                      <p className="text-slate-400">Escalate deep questions directly to your teacher with 1 click.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 3: FRONTEND COMPONENTS & PLAYER ARCHITECTURE */}
            {/* ========================================================================= */}
            <section id="components" className="space-y-6 scroll-mt-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Frontend Components &amp; Studio Player Architecture
                  </h2>
                  <p className="text-xs text-slate-400">
                    Component breakdown, state management, and real-time audio synchronization logic
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Component 1 */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      &lt;AudioPlayer /&gt;
                    </span>
                    <Play className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Custom multi-track audio player maintaining playback state (`isPlaying`, `currentTimeMs`, `playbackRate`). Dispatches continuous timestamp events (`onTimeUpdate`) that synchronize the slide viewer and transcript.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-bold">Key Props:</span> src: string, onTimeUpdate: (ms: number) =&gt; void, playbackSpeed: 0.75x | 1x | 1.25x | 1.5x | 2x
                  </div>
                </div>

                {/* Component 2 */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 font-mono">
                      &lt;SlideViewer /&gt;
                    </span>
                    <Layers className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Displays high-resolution presentation slides and architectural diagrams. Dynamically maps `currentTimeMs` to the active segment time range (`startTimeMs &lt;= time &lt; endTimeMs`) and auto-switches slides.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400">
                    <span className="text-indigo-400 font-bold">Key Props:</span> slides: SlideImage[], activePage: number, onSlideSelect: (page: number) =&gt; void
                  </div>
                </div>

                {/* Component 3 */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      &lt;TranscriptViewer /&gt;
                    </span>
                    <FileText className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Renders the full lecture narration transcript. Highlights the currently active sentence in real time and uses container-scoped `container.scrollTo()` to scroll smoothly without jumping the browser window.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400">
                    <span className="text-amber-400 font-bold">Key Props:</span> segments: LectureSegment[], currentTimestampMs: number
                  </div>
                </div>

                {/* Component 4 */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 font-mono">
                      &lt;StudentLectureChat /&gt;
                    </span>
                    <MessageSquare className="w-4 h-4 text-rose-400" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    AI Assistant chat box featuring `overscroll-contain` to isolate scroll events. Sends user queries to the RAG endpoint, displays confidence scores, and enables 1-click teacher escalation.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400">
                    <span className="text-rose-400 font-bold">Key Props:</span> lectureId: string, activePage: number, onAskQuestion: (q: string) =&gt; void
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 4: AI MICROSERVICE & SPEECH PIPELINE */}
            {/* ========================================================================= */}
            <section id="ai-engine" className="space-y-6 scroll-mt-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    AI Microservice &amp; Speech Pipeline
                  </h2>
                  <p className="text-xs text-slate-400">
                    PyMuPDF parsing, Thematic Cognitive Chunking, Edge-TTS, and ChromaDB vector embeddings
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">The 5 Pipeline Stages:</h3>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold shrink-0">Stage 1</span>
                    <div>
                      <span className="font-bold text-white">Document Ingestion &amp; OCR (`pdf_parser.py` / `pptx_parser.py`):</span>
                      <p className="text-slate-400 font-sans mt-0.5">Extracts structured text, title hierarchies, and renders presentation slides as PNG images at 150 DPI for visual display.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold shrink-0">Stage 2</span>
                    <div>
                      <span className="font-bold text-white">Thematic Cognitive Chunking (`script_generator.py`):</span>
                      <p className="text-slate-400 font-sans mt-0.5">If presentations contain &gt;10 slides, clusters related slides into 8–14 conceptual lecture modules, preserving 100% of diagrams.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold shrink-0">Stage 3</span>
                    <div>
                      <span className="font-bold text-white">Studio Neural Voice Synthesis (`tts_service.py`):</span>
                      <p className="text-slate-400 font-sans mt-0.5">Uses Microsoft Edge Neural Voice (`en-US-ChristopherNeural`) with FFmpeg `libmp3lame` stream concat encoding and precise segment timestamping.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold shrink-0">Stage 4</span>
                    <div>
                      <span className="font-bold text-white">Vector Embedding &amp; Indexing (`chroma_manager.py`):</span>
                      <p className="text-slate-400 font-sans mt-0.5">Generates 384-dimensional multilingual embeddings (`paraphrase-multilingual-MiniLM-L12-v2`) and indexes all slides into ChromaDB in cosine vector space.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-400 font-bold shrink-0">Stage 5</span>
                    <div>
                      <span className="font-bold text-white">Groq RAG Q&amp;A Engine (`qa.py`):</span>
                      <p className="text-slate-400 font-sans mt-0.5">Matches student questions to top-5 slide contexts, filters greetings, and generates concise answers via Groq Llama 3.3 70B (with Gemini hot-standby).</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 5: THE 4 INTERACTIVE ARCHITECTURAL DIAGRAMS */}
            {/* ========================================================================= */}
            <section id="diagrams" className="space-y-6 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Interactive Architectural Blueprints
                    </h2>
                    <p className="text-xs text-slate-400">
                      Explore full-stack infrastructure topology, AI sequences &amp; database schemas
                    </p>
                  </div>
                </div>

                {/* Diagram Switcher Tabs */}
                <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => setActiveDiagram("arch")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeDiagram === "arch"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    1. System Arch
                  </button>
                  <button
                    onClick={() => setActiveDiagram("pipeline")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeDiagram === "pipeline"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    2. AI Pipeline
                  </button>
                  <button
                    onClick={() => setActiveDiagram("erd")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeDiagram === "erd"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    3. Database ERD
                  </button>
                  <button
                    onClick={() => setActiveDiagram("rag")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeDiagram === "rag"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    4. RAG Flow
                  </button>
                </div>
              </div>

              {/* Diagram Viewer Box */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-x-auto">
                {activeDiagram === "arch" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Diagram 1: Full-Stack Production System Architecture
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Caddy → Next.js / Express / FastAPI → PostgreSQL / Redis
                      </span>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-4 leading-relaxed">
                      <div className="text-center font-bold text-indigo-400 text-sm pb-2 border-b border-slate-800">
                        [ Client Web Browsers (Chrome / Safari / Edge / Mobile) ]
                      </div>
                      <div className="text-center text-slate-500">
                        │ HTTPS :443 (Let&apos;s Encrypt Auto-TLS / ZeroSSL)
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 text-center font-bold text-emerald-300 shadow-lg">
                        🛡️ Ingress Reverse Proxy: Caddy v2 (Port 80/443 Gateway &amp; Gzip/Zstd Compression)
                        <div className="text-[11px] text-slate-400 font-normal mt-1">
                          Path Routing: /api/* → Express | /ai/* → FastAPI | /* → Next.js 14
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Next.js 14 Frontend
                          </div>
                          <p className="text-[11px] text-slate-400">
                            • App Router &amp; Tailwind CSS<br />
                            • Multi-Role Dashboards<br />
                            • Synchronized Audio Player<br />
                            • Isolated Chat Scroll Anchor
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            Express Node.js API
                          </div>
                          <p className="text-[11px] text-slate-400">
                            • Prisma ORM Layer<br />
                            • JWT Authentication &amp; RBAC<br />
                            • Sliding-Window Rate Limiter<br />
                            • BullMQ Job Dispatcher
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            FastAPI AI Microservice
                          </div>
                          <p className="text-[11px] text-slate-400">
                            • PyMuPDF &amp; Slide Parsing<br />
                            • Thematic Chunking Engine<br />
                            • Edge-TTS Neural Audio<br />
                            • ChromaDB + Groq Llama 70B
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
                          <span className="font-bold text-indigo-400">🗄️ PostgreSQL 16 DB:</span> Relational state for users, courses, lectures, segments, and teacher question inbox.
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
                          <span className="font-bold text-amber-400">⚡ Redis 7 Broker:</span> Asynchronous queue broker managing long-running document processing tasks.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDiagram === "pipeline" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Diagram 2: Thematic Cognitive Chunking &amp; Audio Pipeline
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Document Upload → Clustering → Neural TTS → Studio
                      </span>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                          <div className="font-bold text-white">1. Raw Document</div>
                          <div className="text-[10px] text-slate-400">46-Slide PDF / PPTX</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                          <div className="font-bold text-white">2. PyMuPDF OCR</div>
                          <div className="text-[10px] text-slate-400">Extracts Text &amp; Diagrams</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="flex-1 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center text-emerald-300">
                          <div className="font-bold">3. Cognitive Clustering</div>
                          <div className="text-[10px]">Groups into 8–12 Modules</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                          <div className="font-bold text-white">4. Script Synthesis</div>
                          <div className="text-[10px] text-slate-400">Engaging Lecture Voice Text</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="flex-1 p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/50 text-center text-indigo-300">
                          <div className="font-bold">5. Edge-TTS &amp; FFmpeg</div>
                          <div className="text-[10px]">Broadcast MP3 Packaging</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                          <div className="font-bold text-white">6. ChromaDB Vectors</div>
                          <div className="text-[10px] text-slate-400">All 46 Pages Indexed</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] text-center font-bold">
                        🎉 Output: Interactive Lecture Studio with Timed Slide Transitions &amp; Voice Narration
                      </div>
                    </div>
                  </div>
                )}

                {activeDiagram === "erd" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Diagram 3: PostgreSQL Relational Entity Relationship Diagram (ERD)
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Prisma PostgreSQL 16 Schema
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="font-bold text-emerald-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span>User (Account &amp; Auth)</span>
                          <span className="text-[10px] text-slate-500">PK: id</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          • id (UUID, PK)<br />
                          • email (String, Unique)<br />
                          • name (String)<br />
                          • passwordHash (String)<br />
                          • role (Enum: ADMIN | TEACHER | STUDENT)<br />
                          • isVerified (Boolean)<br />
                          • createdAt / updatedAt (DateTime)
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="font-bold text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span>Course &amp; Enrollment</span>
                          <span className="text-[10px] text-slate-500">PK: id</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          • id (UUID, PK)<br />
                          • title (String) / code (String, Unique)<br />
                          • description (String)<br />
                          • teacherId (FK → User.id)<br />
                          • Enrollment (studentId FK → User.id, courseId FK)
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="font-bold text-amber-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span>Lecture &amp; LectureSegment</span>
                          <span className="text-[10px] text-slate-500">PK: id</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          • id (UUID, PK)<br />
                          • courseId (FK → Course.id)<br />
                          • status (PROCESSING | READY | FAILED)<br />
                          • audioUrl (String) / totalDurationMs (Int)<br />
                          • LectureSegment: segmentIndex, segmentText, pageNumber, startTimeMs, endTimeMs, imageUrls[]
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="font-bold text-rose-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span>Question &amp; TeacherEscalation</span>
                          <span className="text-[10px] text-slate-500">PK: id</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          • id (UUID, PK)<br />
                          • lectureId (FK → Lecture.id)<br />
                          • studentId (FK → User.id)<br />
                          • questionText (String) / aiAnswer (String)<br />
                          • confidenceScore (Float)<br />
                          • isEscalated (Boolean) / teacherReply (String)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeDiagram === "rag" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                        Diagram 4: Student RAG Q&amp;A &amp; Human Escalation Flow
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Student Query → ChromaDB Vector Search → Groq 70B → Instructor
                      </span>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          1
                        </div>
                        <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="font-bold text-white">Student Asks Question</span>: e.g. &quot;What is the purpose of the default gateway in slide 34?&quot;
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                          2
                        </div>
                        <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="font-bold text-white">Conversational Filter &amp; ChromaDB Search</span>: Identifies greetings or performs cosine vector search to retrieve top-5 relevant slide contexts.
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                          3
                        </div>
                        <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="font-bold text-white">Groq (Llama 3.3 70B) Synthesizes Grounded Answer</span>: Generates clear, instruction-compliant explanation with confidence rating (e.g. 94%).
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                          4
                        </div>
                        <div className="flex-1 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200">
                          <span className="font-bold">Human-in-the-Loop Option</span>: If student clicks &quot;Ask Teacher&quot;, question &amp; slide snapshot are dispatched directly to the instructor&apos;s Escalated Queue!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 6: RBAC SECURITY & PERMISSION MATRIX */}
            {/* ========================================================================= */}
            <section id="rbac" className="space-y-6 scroll-mt-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Role-Based Access Control (RBAC) Matrix
                  </h2>
                  <p className="text-xs text-slate-400">
                    Granular permission boundaries enforced across API middleware and UI routes
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                      <th className="p-4">Platform Capability / Action</th>
                      <th className="p-4 text-center">Admin</th>
                      <th className="p-4 text-center">Teacher</th>
                      <th className="p-4 text-center">Student</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                    <tr>
                      <td className="p-4 font-semibold text-slate-200">User Account Provisioning &amp; Role Invites</td>
                      <td className="p-4 text-center text-emerald-400 font-bold">✅ Full Access</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-200">Course Creation &amp; Teacher Assignment</td>
                      <td className="p-4 text-center text-emerald-400 font-bold">✅ Full Access</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-200">Upload PDF/PPTX &amp; Trigger AI Generation</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                      <td className="p-4 text-center text-emerald-400 font-bold">✅ Full Access</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-200">Review &amp; Reply to Escalated Questions</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                      <td className="p-4 text-center text-emerald-400 font-bold">✅ Full Access</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-200">Interactive Lecture Studio &amp; AI Q&amp;A</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                      <td className="p-4 text-center text-amber-400 font-bold">👁️ Preview Mode</td>
                      <td className="p-4 text-center text-emerald-400 font-bold">✅ Full Access</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-200">Auto-Save Progress &amp; Watch History</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                      <td className="p-4 text-center text-slate-600">❌ Restricted</td>
                      <td className="p-4 text-center text-emerald-400 font-bold">✅ Full Access</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 7: COMPREHENSIVE REST & AI API REFERENCE */}
            {/* ========================================================================= */}
            <section id="api" className="space-y-6 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Comprehensive REST &amp; AI API Reference
                    </h2>
                    <p className="text-xs text-slate-400">
                      Every single endpoint, HTTP method, authorization rule, and payload schema
                    </p>
                  </div>
                </div>

                {/* API Route Tab Filter */}
                <div className="flex flex-wrap p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                  {(["auth", "courses", "lectures", "qa", "analytics", "users", "ai"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveApiTab(tab)}
                      className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                        activeApiTab === tab
                          ? "bg-rose-600 text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint Cards */}
              <div className="space-y-4">
                {activeApiTab === "auth" && (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/auth/login</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Public (Rate limited: 20 failed / 5 min)</span>
                      </div>
                      <p className="text-xs text-slate-300">Authenticates email and password, returning a signed JWT token and user profile.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                        <span className="text-slate-500">// Request Payload</span><br />
                        &#123; &quot;email&quot;: &quot;student@lecturehub.pk&quot;, &quot;password&quot;: &quot;Student@123&quot; &#125;<br /><br />
                        <span className="text-slate-500">// Response 200 OK</span><br />
                        &#123; &quot;token&quot;: &quot;eyJhbGciOi...&quot;, &quot;user&quot;: &#123; &quot;id&quot;: &quot;uuid&quot;, &quot;name&quot;: &quot;Student&quot;, &quot;role&quot;: &quot;STUDENT&quot; &#125; &#125;
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">GET</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/auth/me</span>
                        </div>
                        <span className="text-[11px] text-indigo-400 font-semibold">Bearer JWT Required</span>
                      </div>
                      <p className="text-xs text-slate-300">Returns current authenticated user session data and role permissions.</p>
                    </div>
                  </>
                )}

                {activeApiTab === "courses" && (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">GET</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/courses</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Authenticated (All Roles)</span>
                      </div>
                      <p className="text-xs text-slate-300">Fetches all courses accessible to the requesting user (enrolled courses for students, assigned courses for teachers).</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/courses</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold">Requires Role: ADMIN</span>
                      </div>
                      <p className="text-xs text-slate-300">Creates a new course entity and assigns a teacher lead.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                        &#123; &quot;code&quot;: &quot;CS-301&quot;, &quot;title&quot;: &quot;Operating Systems&quot;, &quot;description&quot;: &quot;Core OS Principles&quot;, &quot;teacherId&quot;: &quot;teacher_uuid&quot; &#125;
                      </div>
                    </div>
                  </>
                )}

                {activeApiTab === "lectures" && (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/lectures/upload</span>
                        </div>
                        <span className="text-[11px] text-amber-400 font-semibold">Requires Role: TEACHER</span>
                      </div>
                      <p className="text-xs text-slate-300">Uploads slide deck (PDF/PPTX), stores file, and dispatches BullMQ async background job.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                        <span className="text-slate-500">// Multipart Form-Data</span><br />
                        file: [Binary Presentation File] | courseId: &quot;course_uuid&quot; | title: &quot;Lecture 04: Process Scheduling&quot;
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">GET</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/lectures/:id</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Authenticated (All Roles)</span>
                      </div>
                      <p className="text-xs text-slate-300">Retrieves full lecture metadata, audio URL, and all synchronized segments with millisecond timing marks.</p>
                    </div>
                  </>
                )}

                {activeApiTab === "qa" && (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/qa/ask-question</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold">Groq Llama 3.3 70B RAG</span>
                      </div>
                      <p className="text-xs text-slate-300">Executes ChromaDB cosine vector search and synthesizes a direct, grounded answer with confidence score.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                        <span className="text-slate-500">// Request Payload</span><br />
                        &#123; &quot;lectureId&quot;: &quot;lecture_uuid&quot;, &quot;questionText&quot;: &quot;What is context switching?&quot;, &quot;activePage&quot;: 14 &#125;<br /><br />
                        <span className="text-slate-500">// Response 200 OK</span><br />
                        &#123; &quot;answerText&quot;: &quot;Context switching is the process of storing...&quot;, &quot;confidenceScore&quot;: 0.94, &quot;sources&quot;: [14, 15] &#125;
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">POST</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/qa/escalate</span>
                        </div>
                        <span className="text-[11px] text-amber-400 font-semibold">Human-in-the-Loop</span>
                      </div>
                      <p className="text-xs text-slate-300">Dispatches an unresolved student question directly to the teacher&apos;s Escalated Question inbox.</p>
                    </div>
                  </>
                )}

                {activeApiTab === "analytics" && (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">GET</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/analytics/system</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold">Requires Role: ADMIN</span>
                      </div>
                      <p className="text-xs text-slate-300">Aggregates total active users, courses, lectures processed, and storage statistics.</p>
                    </div>
                  </>
                )}

                {activeApiTab === "users" && (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">GET</span>
                          <span className="font-mono text-xs font-bold text-white">/api/v1/users</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold">Requires Role: ADMIN</span>
                      </div>
                      <p className="text-xs text-slate-300">Lists all registered student, teacher, and admin profiles in the institution database.</p>
                    </div>
                  </>
                )}

                {activeApiTab === "ai" && (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
                          <span className="font-mono text-xs font-bold text-white">/ai/extract</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Internal AI Microservice</span>
                      </div>
                      <p className="text-xs text-slate-300">Extracts slide text, hierarchy, and PNG slide snapshots from uploaded documents via PyMuPDF.</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
                          <span className="font-mono text-xs font-bold text-white">/ai/tts</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Internal AI Microservice</span>
                      </div>
                      <p className="text-xs text-slate-300">Generates Edge-TTS studio neural audio with FFmpeg MP3 packaging and returns millisecond sync metadata.</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 8: CLOUD INFRASTRUCTURE, SECURITY & COMPLIANCE */}
            {/* ========================================================================= */}
            <section id="infra" className="space-y-6 scroll-mt-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Cloud Infrastructure, Security &amp; Compliance
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enterprise AWS deployment specifications, automated TLS, and anti-abuse safeguards
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    Automated Let&apos;s Encrypt / ZeroSSL HTTPS
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Caddy reverse proxy acts as the automated ACME client over ports 80/443. All HTTP traffic is permanently redirected to HTTPS (`308 Permanent Redirect`). Certificates are automatically renewed without manual certbot intervention.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Adaptive Rate Limiting Defense
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Authentication routes are protected with a sliding-window rate limiter allowing 20 failed attempts per 5 minutes while exempting valid logins (`skipSuccessfulRequests: true`), preventing shared campus Wi-Fi lockouts.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    CI/CD Push-to-Deploy Architecture
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    GitHub Actions deploys updates directly to AWS EC2 via secure SSH (`appleboy/ssh-action@v1.0.3`). Builds execute sequentially with extended 60-minute timeouts to avoid CPU throttling on `t3.micro` instances.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <RefreshCw className="w-4 h-4 text-rose-400" />
                    Resource &amp; Memory Optimization
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Lightweight CPU-only PyTorch builds reduce AI container footprint from 2.5 GB to 150 MB, ensuring rock-solid stability within 1 GB RAM limits on AWS Free Tier.
                  </p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
