"use client";
import React from "react";
import { Button } from "./ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const SignOutButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        await signOut();
        router.push("/sign-in");
      }}
      variant="destructive"
    >
      Sign Out
    </Button>
  );
};

export default SignOutButton;
