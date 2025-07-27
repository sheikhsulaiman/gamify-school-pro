"use client";

import React, { useState } from "react";
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
import { z } from "zod";

import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  content: z.string().max(1000).optional(),
});

const CreateLesson = ({ courseId }: { courseId: string }) => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreateLesson = async (values: z.infer<typeof formSchema>) => {
    const { title, description, content } = values;
    setLoading(true);
    try {
      const response = await fetch("/api/lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, content, courseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create lesson");
      }

      const data = await response.json();
      toast.success(data.message);
      form.reset();
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Failed to create lesson");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <Tooltip>
        <TooltipTrigger>
          <SheetTrigger
            asChild
            className={cn(
              buttonVariants({ variant: "outline" }),
              "p-2 m-2 rounded-full w-12 h-12"
            )}
          >
            <PlusIcon />
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create new lesson</p>
        </TooltipContent>
      </Tooltip>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex justify-between items-center mr-8">
            <SheetTitle>Create a new lesson</SheetTitle>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </div>
          <SheetDescription>
            Please fill the form correctly to create a new lesson.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateLesson)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Lesson Title" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Lesson Description" {...field} />
                    </FormControl>
                    <FormDescription>
                      A brief description of your lesson. (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Lesson Content" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional content for the lesson.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={loading}
                type="submit"
                className="flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateLesson;
