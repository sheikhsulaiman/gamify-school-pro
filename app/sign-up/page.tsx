"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const res = await signUp.email({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      if (res.error) {
        setError(res.error.message || "Something went wrong.");
        toast.error("Account creation failed", {
          description:
            res.error.message || "Please check your information and try again.",
        });
      } else {
        toast.success("Account created successfully!", {
          description:
            "Welcome! Your account has been created and you're now signed in.",
        });
        router.push("/learn");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-muted/50">
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
              Create an account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details below to create your account and start learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <div className="text-sm">{error}</div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border border-transparent border-t-current" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {isLoading && (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="underline underline-offset-4 hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-4 text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{" "}
              <Link
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
