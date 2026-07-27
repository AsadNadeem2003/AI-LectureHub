"use client";

import { useEffect } from "react";

export function useProgressTracker(lectureId: string, currentTimeMs: number) {
  useEffect(() => {
    if (!lectureId || currentTimeMs <= 0) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await fetch(`http://localhost:5000/api/v1/lectures/${lectureId}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lastPositionMs: currentTimeMs,
          }),
        });
      } catch (e) {
        console.error("Error auto-saving lecture progress:", e);
      }
    }, 10000); // Save position every 10 seconds

    return () => clearInterval(interval);
  }, [lectureId, currentTimeMs]);
}
