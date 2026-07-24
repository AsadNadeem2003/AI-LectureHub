import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Create Admin User ────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lecturehub.pk" },
    update: {},
    create: {
      email: "admin@lecturehub.pk",
      passwordHash: adminPassword,
      name: "System Admin",
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ── Create Demo Teacher ──────────────────────────────────────────────────
  const teacherPassword = await bcrypt.hash("Teacher@123", 12);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@lecturehub.pk" },
    update: {},
    create: {
      email: "teacher@lecturehub.pk",
      passwordHash: teacherPassword,
      name: "Dr. Ahmed Khan",
      role: Role.TEACHER,
    },
  });
  console.log(`✅ Teacher created: ${teacher.email}`);

  // ── Create Demo Student ──────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash("Student@123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@lecturehub.pk" },
    update: {},
    create: {
      email: "student@lecturehub.pk",
      passwordHash: studentPassword,
      name: "Ali Raza",
      role: Role.STUDENT,
    },
  });
  console.log(`✅ Student created: ${student.email}`);

  // ── Create Demo Course ───────────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { id: "demo-course-001" },
    update: {},
    create: {
      id: "demo-course-001",
      title: "Introduction to Artificial Intelligence",
      description:
        "Covers fundamental AI concepts including machine learning, neural networks, natural language processing, and computer vision.",
      createdById: admin.id,
    },
  });
  console.log(`✅ Course created: ${course.title}`);

  // ── Assign Teacher to Course ─────────────────────────────────────────────
  await prisma.courseAssignment.upsert({
    where: {
      userId_courseId: { userId: teacher.id, courseId: course.id },
    },
    update: {},
    create: {
      userId: teacher.id,
      courseId: course.id,
      role: Role.TEACHER,
    },
  });
  console.log(`✅ Teacher assigned to course`);

  // ── Enroll Student in Course ─────────────────────────────────────────────
  await prisma.courseAssignment.upsert({
    where: {
      userId_courseId: { userId: student.id, courseId: course.id },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      role: Role.STUDENT,
    },
  });
  console.log(`✅ Student enrolled in course`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin   → admin@lecturehub.pk    / Admin@123");
  console.log("   Teacher → teacher@lecturehub.pk  / Teacher@123");
  console.log("   Student → student@lecturehub.pk  / Student@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
