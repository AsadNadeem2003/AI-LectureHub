"use client";

import { useRef, useEffect } from "react";
import { FileText, Play, Sparkles } from "lucide-react";

interface Segment {
  segmentIndex: number;
  segmentText: string;
  pageNumber: number;
  startTimeMs: number;
  endTimeMs: number;
}

interface TranscriptViewerProps {
  segments: Segment[];
  activeSegmentIndex: number;
  onSelectSegment: (startTimeMs: number) => void;
}

export default function TranscriptViewer({
  segments,
  activeSegmentIndex,
  onSelectSegment,
}: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll smooth to keep current active spoken sentence centered
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeSegmentIndex]);

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Transcript Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h3 className="font-heading font-bold text-slate-900 text-xs tracking-wide uppercase">
            Live Synced Transcript
          </h3>
        </div>

        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
          Click text to jump audio
        </span>
      </div>

      {/* Auto-scrolling Segments List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 max-h-125 scrollbar-thin scrollbar-thumb-slate-200"
      >
        {segments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No transcript segments available.
          </div>
        ) : (
          segments.map((seg, i) => {
            const isActive = i === activeSegmentIndex;
            return (
              <div
                key={i}
                ref={isActive ? activeItemRef : null}
                onClick={() => onSelectSegment(seg.startTimeMs)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer border text-xs leading-relaxed ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 text-slate-900 shadow-sm ring-2 ring-emerald-500/10 font-medium"
                    : "bg-slate-50/50 hover:bg-slate-100 border-slate-200/80 text-slate-600 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    Slide {seg.pageNumber}
                  </span>

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    {isActive && <Sparkles className="w-3 h-3 text-emerald-600 animate-spin" />}
                    {(seg.startTimeMs / 1000).toFixed(1)}s
                  </span>
                </div>

                <p className="font-sans">{seg.segmentText}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
