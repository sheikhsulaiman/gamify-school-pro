import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json(
      { error: "Lesson ID is required" },
      { status: 400 }
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: { id: true },
      },
    },
  });

  const courseId = lesson?.course.id;

  if (!courseId) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ courseId }, { status: 200 });
}
