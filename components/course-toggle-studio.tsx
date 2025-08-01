"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NewEnroll from "./new-enroll";
import { useSession } from "@/lib/auth-client";
import CreateCourse from "./create-course";

interface Course {
  id: string;
  title: string;
  description: string;
  createdBy: string;
}

export const CourseToggleStudio = () => {
  const router = useRouter();
  const path = usePathname();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch current course and enrolled courses in parallel
      const [currentResponse, coursesResponse] = await Promise.all([
        fetch("/api/current"),
        fetch("/api/course"),
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
        id: course.id,
        title: course.title,
        description: course.description,
        createdBy: course.createdBy,
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

  useEffect(() => {
    // Filter courses based on createdBy field
    const filtered = courses.filter(
      (course) => course.createdBy === session?.user.id
    );
    setFilteredCourses(filtered);
  }, [courses, selected, session]);

  const handleUpdateCourse = async (courseId: string) => {
    try {
      const response = await fetch("/api/current", {
        method: "PUT",
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
    router.refresh();
  };

  // Only render on /studio path
  if (path !== "/studio") {
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
          {filteredCourses.length === 0 && !isLoading ? (
            <SelectItem value="no-courses" disabled>
              No courses available
            </SelectItem>
          ) : (
            filteredCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <CreateCourse onCreateSuccess={fetchData} />
    </div>
  );
};
