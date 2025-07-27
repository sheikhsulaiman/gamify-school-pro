import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/learn", "/profile", "/settings", "/dashboard"];

// Routes that redirect authenticated users (auth pages)
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

// Check if user is authenticated by looking for session cookie
function isAuthenticated(request: NextRequest): boolean {
  // better-auth typically sets a session cookie
  // Adjust the cookie name based on your better-auth configuration
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("session");

  return !!sessionCookie?.value;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const authenticated = isAuthenticated(request);

  // Check if current path is protected
  const isProtectedPath = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthPath = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes
  if (isProtectedPath && !authenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users from auth routes
  if (isAuthPath && authenticated) {
    const redirectUrl =
      request.nextUrl.searchParams.get("callbackUrl") || "/learn";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
