import SignOutButton from "@/components/sign-out";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";
import React from "react";

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
        include: { lesson: true },
      },
    },
  });
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Learn Page</h1>
      </header>
      {!enrollment ? (
        <div>You are not enrolled in any course.</div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Current Course Progress</h1>
          <p>Course ID: {enrollment.courseId}</p>
          <p>
            Current Lesson:{" "}
            {enrollment.currentLesson?.title || "No current lesson"}
          </p>
          <h2 className="text-xl mt-4">Completed Lessons:</h2>
          <ul>
            {enrollment.lessonProgress.map((progress) => (
              <li key={progress.lesson.id}>
                {progress.lesson.title} - Completed on{" "}
                {progress.completedAt
                  ? new Date(progress.completedAt).toLocaleDateString()
                  : "Unknown"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default page;
