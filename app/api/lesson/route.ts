import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json(
      { error: "Lesson ID is required" },
      { status: 400 }
    );
  }
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
  });

  return NextResponse.json(lessons, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, content, courseId, order } = body;

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    select: { order: true },
    orderBy: { order: "asc" },
  });

  let maxOrder = 0;

  if (lessons.length > 0) {
    maxOrder = Math.max(...lessons.map((lesson) => lesson.order));
  }

  if (!title || !courseId) {
    return NextResponse.json(
      { error: "Title, and courseId are required" },
      { status: 400 }
    );
  }
  const lesson = await prisma.lesson.create({
    data: {
      title,
      description,
      content,
      order: maxOrder + 1,
      courseId,
    },
  });

  return NextResponse.json(
    { message: "Lesson created successfully", lesson: lesson },
    { status: 201 }
  );
}
