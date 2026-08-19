"use client";

import { Presentation, Image as ImageIcon, Sparkles, Tag } from "lucide-react";

interface Segment {
  segmentIndex: number;
  segmentText: string;
  pageNumber: number;
  imageUrls: string[];
  startTimeMs: number;
  endTimeMs: number;
  keywords?: string[];
}

interface SlideViewerProps {
  segments: Segment[];
  activeSegmentIndex: number;
  lectureTitle: string;
}

export default function SlideViewer({
  segments,
  activeSegmentIndex,
  lectureTitle,
}: SlideViewerProps) {
  const currentSegment = segments[activeSegmentIndex] || segments[0];
  const pageNum = currentSegment ? currentSegment.pageNumber : 1;
  const totalPages = segments.length > 0 ? Math.max(...segments.map((s) => s.pageNumber)) : 1;

  const hasImage = currentSegment?.imageUrls && currentSegment.imageUrls.length > 0;
  const imageUrl = hasImage ? currentSegment.imageUrls[0] : null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 shadow-lg flex flex-col">
      {/* Slide Header */}
      <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-emerald-400" />
          <span className="font-heading font-bold text-xs tracking-wide uppercase text-slate-200">
            Slide Viewer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono">
            Slide {pageNum} of {totalPages}
          </span>
        </div>
      </div>

      {/* 16:9 Widescreen Landscape Presentation Canvas */}
      <div className="relative w-full aspect-video bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-6 text-white overflow-hidden shadow-inner">
        {imageUrl ? (
          // Render Slide Image
          <img
            src={imageUrl.startsWith("http") || imageUrl.startsWith("data:") ? imageUrl : `/ai${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`}
            alt={`Slide ${pageNum}`}
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-slate-700/50"
          />
        ) : (
          // Visual Text Slide Fallback
          <div className="max-w-2xl text-center space-y-4 p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <h3 className="font-heading font-extrabold text-xl md:text-2xl text-slate-100 tracking-tight leading-tight">
              {lectureTitle}
            </h3>

            <div className="inline-block bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs font-semibold text-emerald-300 font-mono">
              Page {pageNum} • Section {activeSegmentIndex + 1}
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans line-clamp-4 max-w-xl mx-auto italic">
              "{currentSegment?.segmentText || "Interactive Slide Presentation"}"
            </p>
          </div>
        )}
      </div>

      {/* Slide Footer with Keywords */}
      {currentSegment?.keywords && currentSegment.keywords.length > 0 && (
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Key Concepts:
          </span>
          <div className="flex items-center gap-1.5">
            {currentSegment.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs whitespace-nowrap"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
