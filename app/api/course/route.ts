import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, description: true },
  });

  return NextResponse.json(courses, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }
  const course = await prisma.course.create({
    data: {
      createdBy: session.user.id,
      title,
      description,
    },
  });

  return NextResponse.json(
    { message: "Course created successfully", course: course },
    { status: 201 }
  );
}
