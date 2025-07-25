"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import SignOutButton from "./sign-out";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

const AuthButton = () => {
  const session = useSession();
  const path = usePathname();

  console.log(path);
  if (!session) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button>
          <Link href="/sign-up">Get started</Link>
        </Button>
      </div>
    );
  }
  if (path === "/") {
    return (
      <Button variant="outline" asChild>
        <Link href="/learn">Learn</Link>
      </Button>
    );
  }
  return <SignOutButton />;
};

export default AuthButton;
