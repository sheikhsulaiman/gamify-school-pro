import SignOutButton from "@/components/sign-out";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

const page = async () => {
  const session = await getSession();

  if (!session) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        Please log in to access this page.
      </div>
    );
  }

  const courseId = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastAccessedCourseId: true },
  });

  if (!courseId || !courseId.lastAccessedCourseId) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <p>No course found for this user.</p>
        <SignOutButton />
      </div>
    );
  }
  // Example: Get user's current progress in a course
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId.lastAccessedCourseId,
      },
    },
    include: {
      currentLesson: true,
      lessonProgress: {
        where: { completedAt: { not: null } },
      },
    },
  });

  const lessons = await prisma.lesson.findMany({
    where: { courseId: courseId.lastAccessedCourseId },
    orderBy: { order: "asc" },
    select: { id: true, title: true, description: true, content: true },
  });

  console.log("Enrollment Data:", enrollment);
  return (
    <div className="container mx-auto p-4 max-w-3xl pt-24 min-h-screen">
      {!enrollment ? (
        <div>
          <p>You are not enrolled in any course.</p>
        </div>
      ) : (
        <div className="relative">
          <h1 className="text-2xl font-bold mb-4">Current Course Progress</h1>
          <p>Course ID: {enrollment.courseId}</p>
          <p>
            Current Lesson:{" "}
            {enrollment.currentLesson?.title || "No current lesson"}
          </p>

          <div className="fixed bottom-12 mx-auto min-w-3xl place-content-center grid">
            <div className="flex justify-between items-center bg-white p-2 overflow-auto shadow-md border-2 rounded-2xl">
              {lessons.map((lesson, index) => (
                <Dialog key={lesson.id}>
                  <DialogTrigger asChild>
                    <Button
                      className="m-2 aspect-square min-w-24 min-h-24 text-2xl"
                      variant="outline"
                    >
                      {++index}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{lesson.title}</DialogTitle>
                      <DialogDescription>
                        {lesson.description}
                      </DialogDescription>
                    </DialogHeader>

                    <pre className="bg-gray-100 p-2 rounded">
                      {lesson.content}
                    </pre>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                      <Button asChild>
                        <Link
                          href={`/play?id=${lesson.id}`}
                          key={lesson.id}
                          className="p-4 border-b"
                        >
                          Play
                        </Link>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                // <Button
                //   key={lesson.id}
                //   className="m-2 aspect-square min-w-24 min-h-24 text-2xl"
                //   variant="default"
                // >
                //   {++index}
                // </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
