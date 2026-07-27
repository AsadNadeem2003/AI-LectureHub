"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Lock, Mail } from "lucide-react";

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
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
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
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900">
            Welcome to AI LectureHub
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your role-based Smart Education Hub
          </p>
        </div>

        {/* Demo Credentials Helper Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
          <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
            🔑 Demo Login Accounts:
          </span>
          <div className="flex justify-between">
            <span>Admin:</span>
            <code className="font-mono text-indigo-600">admin@lecturehub.pk / Admin@123</code>
          </div>
          <div className="flex justify-between">
            <span>Teacher:</span>
            <code className="font-mono text-amber-600">teacher@lecturehub.pk / Teacher@123</code>
          </div>
          <div className="flex justify-between">
            <span>Student:</span>
            <code className="font-mono text-emerald-600">student@lecturehub.pk / Student@123</code>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. teacher@lecturehub.pk"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
