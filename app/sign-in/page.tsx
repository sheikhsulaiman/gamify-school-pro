"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
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

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const res = await signIn.email({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      if (res.error) {
        setError(res.error.message || "Something went wrong.");
        toast.error("Sign in failed", {
          description:
            res.error.message || "Please check your credentials and try again.",
        });
      } else {
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
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
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email and password to sign in to your account
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border border-transparent border-t-current" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
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
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="underline underline-offset-4 hover:text-primary transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
