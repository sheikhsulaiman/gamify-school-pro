import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  if (!lessonId)
    return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  const modules = await prisma.gameModule.findMany({
    where: { lessonId },
    include: {
      rearrangeChallenge: true,
      mcq: true,
      matching: true,
    },
  });

  return NextResponse.json(modules);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, lessonId, title, order } = body;

  if (!type || !lessonId || !title || order === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: type, lessonId, title, or order" },
      { status: 400 }
    );
  }

  const module = await prisma.gameModule.create({
    data: {
      type,
      title,
      order,
      lesson: {
        connect: { id: lessonId },
      },
    },
  });

  return NextResponse.json(module, { status: 201 });
}
