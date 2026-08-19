"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Lock, Mail, GraduationCap, Users, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Login failed");

      // Save token and user details to localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Set cookie for middleware compatibility
      document.cookie = `lecturehub_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;

      // Redirect dynamically based on user role
      const role = data.user?.role || "STUDENT";
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex w-full bg-white">
      {/* Left Sidebar (Premium Branding) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white p-12 relative overflow-hidden">
        {/* Abstract Background Design Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full blur-3xl mix-blend-screen"></div>
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-violet-500 rounded-full blur-3xl mix-blend-screen"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <h2 className="font-heading font-bold text-xl tracking-wide">AI LectureHub</h2>
          </div>

          <h1 className="font-heading font-extrabold text-5xl leading-tight mb-6">
            Welcome to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
              Smart Education
            </span>
          </h1>
          <p className="text-indigo-200 text-lg max-w-md mb-12">
            Experience the future of learning with our role-based premium architecture. Seamlessly connecting knowledge to learners through AI.
          </p>

          {/* Architecture/Role Cards */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-transform hover:translate-x-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Student Portal</h3>
                <p className="text-xs text-indigo-300 mt-0.5">Interactive lectures & personalized AI Q&A</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-transform hover:translate-x-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Teacher Studio</h3>
                <p className="text-xs text-indigo-300 mt-0.5">Content creation & student analytics tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-transform hover:translate-x-2">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Admin Command</h3>
                <p className="text-xs text-indigo-300 mt-0.5">Platform management & health monitoring</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-indigo-400 font-medium">
          © 2026 AI LectureHub. All rights reserved.
        </div>
      </div>

      {/* Right Side (Login Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="font-heading font-extrabold text-3xl text-slate-900 mb-2">Sign in to your account</h2>
            <p className="text-sm text-slate-500">Enter your details to securely access your workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    placeholder="name@lecturehub.pk"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}
