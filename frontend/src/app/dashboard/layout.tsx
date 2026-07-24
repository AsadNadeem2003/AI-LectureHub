import { GraduationCap, LogOut, Settings, Users, BookOpen, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 flex-col border-r border-gray-200 bg-white hidden sm:flex dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            LectureHub
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/courses"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <BookOpen className="h-5 w-5" />
            Courses
          </Link>
          <Link
            href="/dashboard/users"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Users className="h-5 w-5" />
            Users
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>

        <div className="border-t border-gray-200 p-4 dark:border-zinc-800">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 sm:hidden dark:border-zinc-800 dark:bg-zinc-900">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            LectureHub
          </Link>
        </header>
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
