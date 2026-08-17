"use client";

import { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  Check,
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string | null;
  currentTimeMs: number;
  totalDurationMs?: number;
  onTimeUpdate: (timeMs: number) => void;
}

export default function AudioPlayer({
  audioUrl,
  currentTimeMs,
  totalDurationMs = 60000,
  onTimeUpdate,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationSec, setDurationSec] = useState(totalDurationMs / 1000);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Full URL resolution pointing to FastAPI Microservice (Port 8001) or full URL
  const fullAudioUrl = audioUrl
    ? audioUrl.startsWith("http")
      ? audioUrl
      : `http://127.0.0.1:8001${audioUrl.startsWith("/") ? "" : "/"}${audioUrl}`
    : null;

  // Sync external seek (e.g. transcript sentence click)
  useEffect(() => {
    if (audioRef.current && audioLoaded) {
      const currentAudioTimeMs = Math.round(audioRef.current.currentTime * 1000);
      if (Math.abs(currentAudioTimeMs - currentTimeMs) > 600) {
        audioRef.current.currentTime = currentTimeMs / 1000;
      }
    }
  }, [currentTimeMs, audioLoaded]);

  // Update total duration state if totalDurationMs prop changes
  useEffect(() => {
    if (totalDurationMs > 0 && durationSec === 0) {
      setDurationSec(totalDurationMs / 1000);
    }
  }, [totalDurationMs, durationSec]);

  // Precision Scrubber Timer Fallback (runs ONLY if HTML5 audio element fails to load or no audio source)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !audioLoaded) {
      interval = setInterval(() => {
        const nextMs = currentTimeMs + 100 * playbackSpeed;
        const maxMs = durationSec * 1000;
        if (nextMs >= maxMs) {
          setIsPlaying(false);
          onTimeUpdate(maxMs);
        } else {
          onTimeUpdate(nextMs);
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, audioLoaded, currentTimeMs, playbackSpeed, durationSec, onTimeUpdate]);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audioRef.current && fullAudioUrl) {
        audioRef.current
          .play()
          .then(() => setAudioLoaded(true))
          .catch((err) => {
            console.warn("HTML5 audio playback blocked/failed, falling back to timer mode:", err);
            setAudioLoaded(false);
          });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTimeSec = parseFloat(e.target.value);
    const seekMs = Math.round(seekTimeSec * 1000);
    if (audioRef.current && audioLoaded) {
      audioRef.current.currentTime = seekTimeSec;
    }
    onTimeUpdate(seekMs);
  };

  const skipSeconds = (seconds: number) => {
    const currentSec = currentTimeMs / 1000;
    const newTimeSec = Math.max(0, Math.min(durationSec, currentSec + seconds));
    const newTimeMs = Math.round(newTimeSec * 1000);
    if (audioRef.current && audioLoaded) {
      audioRef.current.currentTime = newTimeSec;
    }
    onTimeUpdate(newTimeMs);
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-200 shadow-md space-y-3">
      {fullAudioUrl && (
        <audio
          ref={audioRef}
          src={fullAudioUrl}
          preload="auto"
          onError={(e) => {
            console.warn("⚠️ Audio load error, falling back to timer sync mode", e);
            setAudioLoaded(false);
          }}
          onCanPlay={() => setAudioLoaded(true)}
          onTimeUpdate={() => {
            if (audioRef.current) {
              onTimeUpdate(Math.round(audioRef.current.currentTime * 1000));
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration > 0) {
              setDurationSec(audioRef.current.duration);
              setAudioLoaded(true);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Progress Scrubber Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={durationSec || 60}
          step={0.1}
          value={currentTimeMs / 1000}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-500 font-semibold">
          <span>{formatTime(currentTimeMs / 1000)}</span>
          <span className="flex items-center gap-1">
            {audioLoaded ? (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-sans">
                <Check className="w-3 h-3" /> Voice Narration Loaded
              </span>
            ) : (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-sans">
                Timer Sync Mode
              </span>
            )}
            {formatTime(durationSec)}
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 pt-1">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => skipSeconds(-5)}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(5)}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Volume Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Speed Selector */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200">
            <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 ml-1 hidden xs:block" />
            {[1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md transition-all ${
                  playbackSpeed === s
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
