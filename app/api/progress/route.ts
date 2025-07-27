import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Get the course ID from the request
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 }
    );
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    include: {
      course: {
        select: {
          title: true,
          lessons: {
            select: { id: true },
            orderBy: { order: "asc" },
          },
        },
      },
      currentLesson: {
        select: { title: true, order: true },
      },
      lessonProgress: {
        where: { completedAt: { not: null } },
        select: { lessonId: true, xpEarned: true },
      },
    },
  });

  if (!enrollment)
    return NextResponse.json(
      { error: "Enrollment not found" },
      { status: 404 }
    );

  const totalLessons = enrollment.course.lessons.length;
  const completedLessons = enrollment.lessonProgress.length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const progress = {
    courseTitle: enrollment.course.title,
    currentLesson: enrollment.currentLesson,
    progress: {
      completed: completedLessons,
      total: totalLessons,
      percentage: Math.round(progressPercentage),
    },
    totalXp: enrollment.totalXp,
    streakDays: enrollment.streakDays,
    lastActivity: enrollment.lastActivityAt,
    isCompleted: !!enrollment.completedAt,
  };

  return NextResponse.json(progress, { status: 200 });
}
