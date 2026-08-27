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
} from "lucide-react";

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [activeDiagram, setActiveDiagram] = useState<"arch" | "pipeline" | "erd" | "rag">("arch");
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const navItems = [
    { id: "overview", label: "Executive Overview", icon: Sparkles },
    { id: "ai-engine", label: "AI & Neural Speech Engine", icon: Cpu },
    { id: "diagrams", label: "Interactive Architecture & ERD", icon: Layers },
    { id: "rbac", label: "RBAC Security Matrix", icon: Shield },
    { id: "api", label: "REST & AI API Reference", icon: Code2 },
    { id: "infra", label: "Cloud Infra & Compliance", icon: Server },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-indigo-900/60 via-emerald-950/60 to-slate-950 border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              Enterprise v2.4 Live
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-400">
              Client & Engineering Specifications
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Go to App <ArrowRight className="w-3.5 h-3.5" />
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
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1.5">
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Server Status:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Online (HTTPS)
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Public Ingress:</span>
                      <span className="font-mono text-slate-300 text-[10px]">
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
            {/* SECTION 1: EXECUTIVE PRODUCT OVERVIEW */}
            {/* ========================================================================= */}
            <section id="overview" className="space-y-6 scroll-mt-20">
              <div className="p-8 rounded-3xl bg-linear-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Sparkles className="w-3.5 h-3.5" /> Executive Summary
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Transforming Raw Academic Materials into Interactive AI Masterclasses
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                    AI LectureHub is an enterprise educational engine designed for universities, corporate academies, and digital training institutions. It eliminates the cognitive fatigue of passive 50-slide reading by automatically synthesizing slide decks into **condensed, neural-narrated visual lectures** with real-time RAG Q&A.
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
                        Full 45-slide AI extraction, audio synthesis & vector indexing
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-2xl font-black text-amber-400">100% Retained</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">
                        Human-in-the-loop teacher escalation for complex edge cases
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Proposition Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">The Student Problem Solved</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Students struggle with dense 40+ page slide decks with minimal audio context. AI LectureHub provides a dual-pane studio featuring real-time slide synchronized transcript, studio neural voice playback, and a live AI tutor.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">The Instructor Advantage</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Faculty members spend zero hours recording audio or editing video. Simply upload standard PDF/PPTX materials. The platform creates studio-grade lectures instantly and routes only unresolved questions to the teacher's queue.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 2: AI & NEURAL SPEECH ENGINE */}
            {/* ========================================================================= */}
            <section id="ai-engine" className="space-y-6 scroll-mt-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    AI & Neural Speech Architecture
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dual-LLM Reasoning, Cognitive Chunking & Sub-Second Neural Audio
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Module 1
                    </span>
                    <Layers className="w-4 h-4 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Thematic Cognitive Chunking</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Documents exceeding 10 slides are algorithmically grouped into **8 to 14 coherent masterclass modules**. Crucially, 100% of architectural diagrams and visual artifacts are retained for visual display.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Module 2
                    </span>
                    <Mic className="w-4 h-4 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Edge-TTS & FFmpeg Packaging</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Uses Microsoft Edge Neural Voice (`en-US-ChristopherNeural`) with zero rate limits. Audio segments are packaged with FFmpeg (`libmp3lame`, 128k bitrate) into broadcast-compliant MP3s with valid ID3 sync headers.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Module 3
                    </span>
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Groq Llama 3.3 70B RAG</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Student queries trigger vector similarity searches in ChromaDB (`cosine space`). Top-5 matching slide chunks are fed to Groq Llama 3.3 70B (with Gemini fallback) to produce grounded, direct answers.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 3: THE 4 INTERACTIVE ARCHITECTURAL DIAGRAMS */}
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
                      Inspect core system topology, AI sequence pipeline & database schemas
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
            {/* SECTION 4: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX */}
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
            {/* SECTION 5: REST & AI API REFERENCE */}
            {/* ========================================================================= */}
            <section id="api" className="space-y-6 scroll-mt-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    REST API &amp; Microservice Reference
                  </h2>
                  <p className="text-xs text-slate-400">
                    Core API endpoints with request payloads, status codes, and rate limits
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Endpoint 1 */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        POST
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        /api/v1/auth/login
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Public (Rate limited: 20 failed attempts / 5 min)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Authenticates credentials and returns a signed JSON Web Token (JWT) with user role claims.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                    <span className="text-slate-500">// Request Payload</span><br />
                    &#123; &quot;email&quot;: &quot;student@lecturehub.pk&quot;, &quot;password&quot;: &quot;Student@123&quot; &#125;
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        POST
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        /api/v1/lectures/upload
                      </span>
                    </div>
                    <span className="text-[11px] text-indigo-400 font-semibold">
                      Requires Role: TEACHER
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Uploads slide presentation (PDF/PPTX), stores file, and dispatches BullMQ background processing job.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                    <span className="text-slate-500">// Multipart Form Data</span><br />
                    file: [binary presentation] | courseId: &quot;course_uuid&quot; | title: &quot;Computer Networks Lab 04&quot;
                  </div>
                </div>

                {/* Endpoint 3 */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        POST
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        /api/v1/qa/ask-question
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-400 font-semibold">
                      FastAPI AI Microservice (Groq 70B RAG)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Performs ChromaDB cosine vector search and synthesizes grounded educational answers with dynamic confidence scoring.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                    <span className="text-slate-500">// Response Payload</span><br />
                    &#123; &quot;answer_text&quot;: &quot;The default gateway routes traffic...&quot;, &quot;confidence_score&quot;: 0.94, &quot;sources&quot;: [34] &#125;
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 6: CLOUD INFRASTRUCTURE, SECURITY & COMPLIANCE */}
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
