import { requireAuth } from "@/lib/auth";

export default async function CoursesPage() {
  await requireAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
        Course management functionality is under construction.
      </p>
    </div>
  );
}
