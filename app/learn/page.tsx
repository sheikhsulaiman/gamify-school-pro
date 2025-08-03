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
import { CourseToggle } from "@/components/course-toggle";
import {
  FlameIcon,
  HeartIcon,
  InfinityIcon,
  PartyPopperIcon,
  ZapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavUser } from "@/components/nav-user";

// 4. Get user's course progress
async function getUserCourseProgress(userId: string, courseId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    include: {
      course: {
        select: {
          title: true,
          lessons: {
            select: { id: true, title: true, description: true, content: true },
            orderBy: { order: "asc" },
          },
        },
      },
      currentLesson: {
        select: { id: true, title: true, order: true },
      },
      lessonProgress: {
        where: { completedAt: { not: null } },
        select: { lessonId: true, xpEarned: true },
      },
    },
  });

  if (!enrollment) return null;

  const totalLessons = enrollment.course.lessons.length;
  const completedLessons = enrollment.lessonProgress.length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const lessons = enrollment.course.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    content: lesson.content,
    isCompleted: enrollment.lessonProgress.some(
      (progress) => progress.lessonId === lesson.id
    ),
  }));

  return {
    courseTitle: enrollment.course.title,
    currentLesson: enrollment.currentLesson,
    progress: {
      completed: completedLessons,
      total: totalLessons,
      percentage: Math.round(progressPercentage),
    },
    lessons,
    totalXp: enrollment.totalXp,
    streakDays: enrollment.streakDays,
    lastActivity: enrollment.lastActivityAt,
    isCompleted: !!enrollment.completedAt,
  };
}

const page = async () => {
  const session = await getSession();

  if (!session) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        Please log in to access this page.
      </div>
    );
  }

  const course = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastAccessedCourseId: true },
  });

  if (!course || !course.lastAccessedCourseId) {
    return (
      <div className="container mx-auto p-4 max-w-3xl min-h-screen">
        <MainNav />
      </div>
    );
  }
  // // Example: Get user's current progress in a course
  // const enrollment = await prisma.courseEnrollment.findUnique({
  //   where: {
  //     userId_courseId: {
  //       userId: session.user.id,
  //       courseId: courseId.lastAccessedCourseId,
  //     },
  //   },
  //   include: {
  //     course: {
  //       select: {
  //         title: true,
  //         lessons: {
  //           select: { id: true },
  //           orderBy: { order: "asc" },
  //         },
  //       },
  //     },
  //     currentLesson: true,
  //     lessonProgress: {
  //       where: { completedAt: { not: null } },
  //     },
  //   },
  // });

  const progress = await getUserCourseProgress(
    session.user.id,
    course.lastAccessedCourseId
  );

  return (
    <div className="container mx-auto p-4 max-w-3xl min-h-screen">
      <MainNav />
      {!progress ? (
        <div>
          <p>You are not enrolled in any course.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="fixed bottom-12 mx-auto min-w-3xl place-content-center grid">
            <div className="flex justify-between items-center bg-white p-4 overflow-auto shadow-md border-2 rounded-2xl">
              {progress.lessons.map((lesson, index) => (
                <Dialog key={lesson.id}>
                  <DialogTrigger
                    asChild
                    disabled={progress.currentLesson?.id !== lesson.id}
                  >
                    {progress.currentLesson?.id === lesson.id ? (
                      <Button
                        key={lesson.id}
                        className="m-2 aspect-square min-w-24 min-h-24 text-2xl"
                        variant="rainbow"
                      >
                        {++index}
                      </Button>
                    ) : (
                      <Button
                        key={lesson.id}
                        disabled
                        className="m-2 aspect-square min-w-24 min-h-24 text-2xl"
                        variant={lesson.isCompleted ? "passed" : "outline"}
                      >
                        {++index}
                      </Button>
                    )}
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

const MainNav = async () => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || "",
  };

  const course = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastAccessedCourseId: true },
  });
  if (!course || !course.lastAccessedCourseId) {
    return (
      <header className="border rounded-full shadow-md px-4">
        <nav className="w-full container mx-auto p-2 flex justify-between items-center">
          <div>
            <p className="p-2 border rounded-lg">Logo</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <CourseToggle />
            <NavUser user={user} />
          </div>
        </nav>
      </header>
    );
  }
  const progress = await getUserCourseProgress(
    session.user.id,
    course.lastAccessedCourseId
  );

  return (
    <header className="border rounded-full shadow-md px-4">
      <nav className="w-full container mx-auto p-2 flex justify-between items-center">
        <div>
          <p className="p-2 border rounded-lg">Logo</p>
        </div>
        {progress && (
          <div className="flex items-center justify-center gap-3">
            {progress.isCompleted ? (
              <div className="flex items-center justify-center gap-1 border py-1 px-2 rounded-lg">
                <PartyPopperIcon />
                <p className="font-bold text-2xl">Hurray! Completed.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1 border py-1 px-2 rounded-lg">
                  <FlameIcon
                    className={cn(
                      progress.streakDays > 0 &&
                        progress.lastActivity.toDateString() ===
                          new Date().toDateString() &&
                        "text-red-500"
                    )}
                  />
                  <p className="font-bold text-2xl">{progress.streakDays}</p>
                </div>
                <div className="flex items-center justify-center gap-1 border py-1 px-2 rounded-lg">
                  <ZapIcon
                    className={cn(progress.totalXp > 0 && "text-green-500")}
                  />
                  <p className="font-bold text-2xl">{progress.totalXp}</p>
                </div>
                <div className="flex items-center justify-center gap-1 border py-1 px-2 rounded-lg">
                  <HeartIcon
                    className={cn(progress.totalXp > 0 && "text-red-500")}
                  />
                  <InfinityIcon className="text-green-500 text-2xl" />
                </div>
              </>
            )}
          </div>
        )}
        <div className="flex items-center justify-center gap-2">
          <CourseToggle />
          <NavUser user={user} />
        </div>
      </nav>
    </header>
  );
};
