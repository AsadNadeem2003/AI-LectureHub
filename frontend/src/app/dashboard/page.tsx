"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Redirecting to your role dashboard...</p>
      </div>
    </div>
  );
}
