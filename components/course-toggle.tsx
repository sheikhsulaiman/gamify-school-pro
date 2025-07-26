"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import NewEnroll from "./new-enroll";

interface Course {
  id: string;
  title: string;
}

interface NewEnrollProps {
  onEnrollSuccess?: () => void;
}

export const CourseToggle = () => {
  const path = usePathname();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch current course and enrolled courses in parallel
      const [currentResponse, coursesResponse] = await Promise.all([
        fetch("/api/current"),
        fetch("/api/enroll"),
      ]);

      if (!currentResponse.ok || !coursesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const currentData = await currentResponse.json();
      const coursesData = await coursesResponse.json();

      // Set selected course
      setSelected(currentData.lastAccessedCourseId || "");

      // Transform and set courses data
      const courseData = coursesData.map((course: any) => ({
        id: course.course.id,
        title: course.course.title,
      })) as Course[];

      setCourses(courseData);
    } catch (error) {
      console.error("Error fetching data:", error);
      // You might want to set an error state here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateCourse = async (courseId: string) => {
    try {
      const response = await fetch("/api/current", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update course");
      }

      // Don't update selected state here since we already updated it optimistically
      // const data = await response.json();
      // setSelected(data.lastAccessedCourseId || "");
    } catch (error) {
      console.error("Error updating course:", error);
      // Revert the selection on error by refetching current course
      try {
        const currentResponse = await fetch("/api/current");
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          setSelected(currentData.lastAccessedCourseId || "");
        }
      } catch (revertError) {
        console.error("Error reverting selection:", revertError);
      }
    }
  };

  const handleChange = (value: string) => {
    // Update UI immediately (optimistic update)
    setSelected(value);
    // Then update the backend
    handleUpdateCourse(value);
  };

  // Only render on /learn path
  if (path !== "/learn") {
    return null;
  }

  return (
    <div className="flex gap-2 items-center justify-center">
      <Select
        value={selected}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={isLoading ? "Loading courses..." : "Select a course"}
          />
        </SelectTrigger>
        <SelectContent>
          {courses.length === 0 && !isLoading ? (
            <SelectItem value="no-courses" disabled>
              No courses available
            </SelectItem>
          ) : (
            courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <NewEnroll
        onEnrollSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
};
