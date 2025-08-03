import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";
import React from "react";
import { NavUser } from "@/components/nav-user";
import { CourseToggleStudio } from "@/components/course-toggle-studio";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import CreateLesson from "@/components/create-lesson";
import { Separator } from "@/components/ui/separator";
import GameModules from "@/components/game-modules";
import { Lesson } from "@/lib/generated/prisma";

const getLessonsCreatedByUser = async (userId: string) => {
  return await prisma.lesson.findMany({
    where: { course: { createdBy: userId } },
    include: {
      course: {
        select: { id: true, title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getLessonsOfLastVisitedCourse = async (courseId: string) => {
  return await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
};

const page = async () => {
  const session = await getSession();

  if (!session) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        Please log in to access this page.
      </div>
    );
  }

  const lastVisitedCourse = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastAccessedCourseId: true },
  });

  if (!lastVisitedCourse || !lastVisitedCourse.lastAccessedCourseId) {
    return (
      <div className="container mx-auto p-4 max-w-3xl min-h-screen">
        <MainNav />
        <p className="mt-8">
          No recent course found for this user. Please select a course.
        </p>
      </div>
    );
  }

  const lessons: Lesson[] = await getLessonsOfLastVisitedCourse(
    lastVisitedCourse?.lastAccessedCourseId
  );

  return (
    <div className="container mx-auto p-4 max-w-5xl min-h-screen">
      <MainNav />
      {/* <div className="flex justify-between items-center bg-white p-4 overflow-auto shadow-md border-2 rounded-2xl">
        {lessons.length > 0 ? (
          <div className="fixed bottom-12 mx-auto min-w-3xl place-content-center grid">
            <div className="flex justify-between items-center gap-2 shadow-md border-2 rounded-2xl">
              <div className="flex justify-between items-center p-4 overflow-auto gap-2">
                {lessons.map((lesson, index) => (
                  <HoverCard key={lesson.id}>
                    <Button className="min-h-16 min-w-16" asChild>
                      <HoverCardTrigger>{++index}</HoverCardTrigger>
                    </Button>
                    <HoverCardContent>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">
                          {lesson.title}
                        </h3>
                        <p>{lesson.description}</p>
                        <pre>{lesson.content}</pre>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
              <Separator orientation="vertical" className="h-auto" />
              <CreateLesson courseId={lastVisitedCourse.lastAccessedCourseId} />
            </div>
          </div>
        ) : (
          <p>No lessons found in the last visited course.</p>
        )}
      </div> */}

      <GameModules
        lessons={lessons}
        courseId={lastVisitedCourse.lastAccessedCourseId}
      />
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

  return (
    <header className="sticky top-4 z-10 bg-background border rounded-full shadow-md px-4">
      <nav className="w-full container mx-auto p-2 flex justify-between items-center">
        <div>
          <p className="p-2 border rounded-lg">Logo</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <CourseToggleStudio />
          <NavUser user={user} />
        </div>
      </nav>
    </header>
  );
};
