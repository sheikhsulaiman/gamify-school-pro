import SignOutButton from "@/components/sign-out";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";
import React from "react";
import { NavUser } from "@/components/nav-user";
import { CourseToggleStudio } from "@/components/course-toggle-studio";

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

  return (
    <div className="container mx-auto p-4 max-w-3xl min-h-screen">
      <MainNav />
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

  const lastVisitedCourse = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastAccessedCourseId: true },
  });

  return (
    <header className="border rounded-full shadow-md px-4">
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
