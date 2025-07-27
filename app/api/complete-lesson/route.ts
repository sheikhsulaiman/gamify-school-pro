import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";

// Helper function to calculate streak days
async function calculateStreakDays(enrollmentId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get all completed lessons ordered by completion date (most recent first)
  const completedLessons = await prisma.lessonProgress.findMany({
    where: {
      enrollmentId,
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  if (completedLessons.length === 0) return 1; // First lesson completed today

  // Group completions by date
  const completionDates = new Set<string>();
  completedLessons.forEach((lesson) => {
    if (lesson.completedAt) {
      const date = new Date(lesson.completedAt);
      date.setHours(0, 0, 0, 0);
      completionDates.add(date.toISOString().split("T")[0]);
    }
  });

  const sortedDates = Array.from(completionDates).sort().reverse();

  let streakDays = 0;
  const todayStr = today.toISOString().split("T")[0];

  // Check if user completed something today
  if (sortedDates.includes(todayStr)) {
    streakDays = 1;

    // Count consecutive days backwards from today
    let currentDate = new Date(today);
    for (let i = 1; i < sortedDates.length; i++) {
      currentDate.setDate(currentDate.getDate() - 1);
      const expectedDateStr = currentDate.toISOString().split("T")[0];

      if (sortedDates.includes(expectedDateStr)) {
        streakDays++;
      } else {
        break; // Streak is broken
      }
    }
  }

  return streakDays;
}

// Alternative simpler approach - just increment if last activity was yesterday
async function calculateSimpleStreak(enrollment: any): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastActivity = new Date(enrollment.lastActivityAt);
  lastActivity.setHours(0, 0, 0, 0);

  // If last activity was yesterday, increment streak
  if (lastActivity.getTime() === yesterday.getTime()) {
    return enrollment.streakDays + 1;
  }
  // If last activity was today, keep current streak
  else if (lastActivity.getTime() === today.getTime()) {
    return enrollment.streakDays;
  }
  // If last activity was more than 1 day ago, reset streak
  else {
    return 1;
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const body = await req.json();
  const { lessonId } = body;

  // Get lesson details
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: { id: true },
      },
    },
  });

  const courseId = lesson?.course.id;

  if (!userId || !courseId || !lessonId) {
    return NextResponse.json(
      { error: "User ID, course ID, and lesson ID are required" },
      { status: 400 }
    );
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  if (!enrollment) throw new Error("User not enrolled in course");

  if (!lesson) throw new Error("Lesson not found");

  // Mark lesson as completed
  await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
    update: {
      completedAt: new Date(),
      xpEarned: lesson.xpReward,
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId,
      completedAt: new Date(),
      xpEarned: lesson.xpReward,
    },
  });

  const newStreakDays = await calculateSimpleStreak(enrollment);

  // Update total XP and streakDays
  await prisma.courseEnrollment.update({
    where: { id: enrollment.id },
    data: {
      totalXp: {
        increment: lesson.xpReward,
      },
      streakDays: newStreakDays,
      lastActivityAt: new Date(),
    },
  });

  // Find and unlock next lesson
  const nextLesson = await prisma.lesson.findFirst({
    where: {
      courseId,
      order: { gt: lesson.order },
    },
    orderBy: { order: "asc" },
  });

  if (nextLesson) {
    // Update current lesson and unlock next lesson
    await prisma.$transaction([
      prisma.courseEnrollment.update({
        where: { id: enrollment.id },
        data: { currentLessonId: nextLesson.id },
      }),
      prisma.lesson.update({
        where: { id: nextLesson.id },
        data: { isLocked: false },
      }),
    ]);
  } else {
    // Course completed
    await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        completedAt: new Date(),
        currentLessonId: null,
      },
    });
  }

  return NextResponse.json(
    { message: "Lesson completed successfully" },
    { status: 200 }
  );
}
