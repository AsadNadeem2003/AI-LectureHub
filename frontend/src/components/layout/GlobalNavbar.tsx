"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

export default function GlobalNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Read logged in user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  // Hide nav on login & set-password pages
  if (pathname === "/login" || pathname === "/set-password") {
    return null;
  }

  const role = user?.role || "STUDENT";

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Title */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                AI LectureHub
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">
                Smart Education Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Admin Dashboard
              </Link>
            )}

            {role === "TEACHER" && (
              <Link
                href="/teacher/dashboard"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname.startsWith("/teacher")
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                Teacher Studio
              </Link>
            )}

            {(role === "STUDENT" || role === "TEACHER") && (
              <Link
                href="/student/dashboard"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname.startsWith("/student")
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                Student Hub
              </Link>
            )}
          </nav>

          {/* User Profile & Role Badge */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Role Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    role === "ADMIN"
                      ? "badge-admin"
                      : role === "TEACHER"
                      ? "badge-teacher"
                      : "badge-student"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      role === "ADMIN"
                        ? "bg-indigo-600"
                        : role === "TEACHER"
                        ? "bg-amber-600"
                        : "bg-emerald-600"
                    }`}
                  />
                  {role}
                </span>

                {/* User Info */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    {user.email}
                  </span>
                </div>

                {/* Avatar Icon */}
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
