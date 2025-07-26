import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        select: { id: true, title: true },
      },
    },
  });

  return NextResponse.json(enrollments, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 }
    );
  }

  // Get first lesson of the course
  const firstLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: "asc" },
  });

  const enrollment = await prisma.courseEnrollment.create({
    data: {
      userId: session.user.id,
      courseId,
      currentLessonId: firstLesson?.id,
    },
  });

  return NextResponse.json(
    { message: "Course enrolled successfully", enrollment: enrollment },
    { status: 201 }
  );
}
