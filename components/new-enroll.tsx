"use client";
import { CourseEnrollment } from "@/lib/generated/prisma";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, PlusIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description: string;
  createdBy: string;
}

const NewEnroll = ({ onEnrollSuccess }: { onEnrollSuccess: () => void }) => {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseEnrollment[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchEnrollData = async () => {
      try {
        const response = await fetch("/api/enroll");
        if (!response.ok) throw new Error("Failed to fetch enrolled courses");
        const data: CourseEnrollment[] = await response.json();
        setEnrolledCourses(data);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        toast.error("Failed to load enrolled courses");
      }
    };

    const fetchAllCourses = async () => {
      try {
        const response = await fetch("/api/course");
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setAllCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };

    fetchEnrollData();
    fetchAllCourses();
  }, []);

  const availableCoursesToEnroll = allCourses.filter((course) => {
    return !enrolledCourses.some(
      (enrollment) => enrollment.courseId === course.id
    );
  });

  async function handleEnroll(id: string): Promise<void> {
    setLoading(true);

    try {
      const response = await fetch(`/api/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to enroll in the course");
      }

      const data = await response.json();

      // Update the state with the newly enrolled course
      setEnrolledCourses((prev) => [...prev, data]);
      toast.success("Enrolled in the course successfully");

      // Close the sheet after successful enrollment
      setIsSheetOpen(false);

      router.refresh();
    } catch (error) {
      toast.error("Failed to enroll in the course");
    } finally {
      onEnrollSuccess();
      setLoading(false);
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <Tooltip>
        <TooltipTrigger>
          <SheetTrigger asChild>
            <PlusIcon />
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add new course</p>
        </TooltipContent>
      </Tooltip>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex justify-between items-center mr-8">
            <SheetTitle>Available Courses to Enroll</SheetTitle>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </div>
          <SheetDescription>
            Here you can see the courses you can enroll in.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          {availableCoursesToEnroll.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No courses available to enroll
            </div>
          ) : (
            availableCoursesToEnroll.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                  <CardAction>
                    <Button
                      disabled={loading}
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewEnroll;
