import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
  "/learn",
  "/profile",
  "/settings",
  // Add more protected routes as needed
];

// Define auth routes that should redirect authenticated users
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/api/health",
  // Add more public routes as needed
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  try {
    // Get session by calling better-auth API endpoint
    const sessionResponse = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        method: "GET",
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    let session = null;
    let user = null;

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      session = sessionData.session;
      user = sessionData.user;
    }

    const isAuthenticated = !!session && !!user;

    // Check if route is public
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Check if route is auth-related
    const isAuthRoute = authRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Handle auth routes (sign-in, sign-up, etc.)
    if (isAuthRoute) {
      if (isAuthenticated) {
        // Redirect authenticated users away from auth pages
        return NextResponse.redirect(new URL("/learn", request.url));
      }
      return NextResponse.next();
    }

    // Handle protected routes
    if (isProtectedRoute) {
      if (!isAuthenticated) {
        // Store the attempted URL for redirect after login
        const redirectUrl = new URL("/sign-in", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Handle public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Default behavior for unmatched routes
    if (!isAuthenticated && !isPublicRoute) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // If there's an error getting the session, redirect to sign-in for protected routes
    const isProtectedRoute = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (isProtectedRoute) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
