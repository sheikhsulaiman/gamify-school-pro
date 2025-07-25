"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Course {
  id: string;
  title: string;
}

export const CourseToggle = ({ courses }: { courses: Course[] }) => {
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/current");
      const data = await response.json();
      setSelected(data.lastAccessedCourseId || "add-course");
    };
    fetchData();
  }, []);

  const [selected, setSelected] = useState("add-course");

  const handleUpdateCourse = async (courseId: string) => {
    const response = await fetch("/api/current", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId }),
    });

    const data = await response.json();
    setSelected(data.lastAccessedCourseId || "add-course");
  };
  useEffect(() => {
    if (selected) {
      handleUpdateCourse(selected);
    }
  }, [selected]);
  const handleChange = (value: string) => {
    if (value === "add-course") {
      // router.push("/learn/add-course");
      setSelected("add-course");
    } else {
      setSelected(value);
      handleUpdateCourse(value);
    }
  };

  if (path === "/learn") {
    return (
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a course" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="add-course" className="flex items-center">
            <PlusIcon className="mr-2" />
            Add Course
          </SelectItem>

          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  } else {
    return null;
  }
};
