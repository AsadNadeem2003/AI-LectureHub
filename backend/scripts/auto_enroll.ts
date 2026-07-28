import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function enrollAll() {
  console.log("Enrolling all students into all courses...");
  
  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT }
  });
  
  const courses = await prisma.course.findMany();
  
  for (const student of students) {
    for (const course of courses) {
      await prisma.courseAssignment.upsert({
        where: {
          userId_courseId: { userId: student.id, courseId: course.id }
        },
        update: {},
        create: {
          userId: student.id,
          courseId: course.id,
          role: Role.STUDENT
        }
      });
      console.log(`Enrolled student ${student.email} into course ${course.title}`);
    }
  }
  
  console.log("Done!");
}

enrollAll().catch(console.error).finally(() => prisma.$disconnect());
