"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusIcon } from "lucide-react";

export function NewModule() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center justify-center">
          <PlusIcon className="mr-2" /> New Module
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Light</DropdownMenuItem>
        <DropdownMenuItem>Dark</DropdownMenuItem>
        <DropdownMenuItem>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
