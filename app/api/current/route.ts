import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastAccessedCourseId: true },
  });

  return NextResponse.json(courseId, { status: 200 });
}

export async function PATCH(req: NextRequest) {
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

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        select: { id: true, title: true },
      },
    },
  });

  const isEnrolled = enrollments.some(
    (enrollment) => enrollment.course.id === courseId
  );

  if (!isEnrolled) {
    return NextResponse.json(
      { message: "You are not enrolled in this course" },
      { status: 403 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastAccessedCourseId: courseId },
  });

  return NextResponse.json(
    { message: "Course updated successfully" },
    { status: 201 }
  );
}
