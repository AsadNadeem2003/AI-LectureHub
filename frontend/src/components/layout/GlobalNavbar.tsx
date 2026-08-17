"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LayoutDashboard, GraduationCap, ShieldCheck, LogOut, Menu, X } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

export default function GlobalNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const storedUserStr = localStorage.getItem("user");
    if (storedUserStr) {
      try {
        setUser(JSON.parse(storedUserStr));
      } catch (e) {
        // ignore
      }
    }

    fetch("http://localhost:5000/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        if (!localStorage.getItem("user")) {
          localStorage.removeItem("token");
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "lecturehub_token=; path=/; max-age=0";
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/register") {
    return null; // Hide navbar on auth pages
  }

  const effectiveUser = user;
  const role = effectiveUser?.role || (pathname.startsWith("/teacher") ? "TEACHER" : pathname.startsWith("/admin") ? "ADMIN" : "STUDENT");

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-linear-to-tr from-amber-500 via-emerald-500 to-indigo-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block leading-none">
                AI LectureHub
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Smart Education
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
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

            {role === "STUDENT" && (
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
        </div>

        {/* User Profile & Role Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {effectiveUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Badge */}
              <span
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
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

              {/* User Identity (Desktop) */}
              <div className="hidden md:block text-right max-w-36 lg:max-w-48">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate">{effectiveUser.name}</p>
                <p className="text-[10px] text-slate-600 font-medium leading-tight truncate">{effectiveUser.email}</p>
              </div>

              {/* Avatar Initial */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center border border-slate-300 shrink-0">
                {effectiveUser.name ? effectiveUser.name.charAt(0).toUpperCase() : "U"}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {effectiveUser && (
            <div className="pb-2 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center border border-slate-300">
                {effectiveUser.name ? effectiveUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{effectiveUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{effectiveUser.email}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  pathname.startsWith("/admin")
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Admin Dashboard
              </Link>
            )}

            {role === "TEACHER" && (
              <Link
                href="/teacher/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  pathname.startsWith("/teacher")
                    ? "bg-amber-50 text-amber-700 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                Teacher Studio
              </Link>
            )}

            {role === "STUDENT" && (
              <Link
                href="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  pathname.startsWith("/student")
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Student Hub
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
