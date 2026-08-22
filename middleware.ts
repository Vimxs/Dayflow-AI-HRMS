import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Decodes JWT payload without external library to maintain lightweight edge runtime compatibility
function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("dayflow_access_token")?.value;
  const refreshToken = request.cookies.get("dayflow_refresh_token")?.value;

  let userRole: string | null = null;
  let isAuthenticated = false;

  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
      isAuthenticated = true;
      userRole = payload.role || null;
    }
  }

  // If access token is expired/missing but refresh token exists, treat as tentatively authenticated
  if (!isAuthenticated && refreshToken) {
    isAuthenticated = true;
  }

  const isAuthRoute =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isAdminRoute = pathname.startsWith("/admin");
  const isEmployeeRoute = pathname.startsWith("/employee");
  const isGenericDashboard = pathname === "/dashboard";

  // 1. Authenticated user trying to access login/signup -> Redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    const targetUrl = userRole === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // 2. Unauthenticated user trying to access protected routes -> Redirect to sign-in
  if ((isAdminRoute || isEmployeeRoute || isGenericDashboard) && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 3. Role enforcement: Employee trying to access Admin route
  if (isAdminRoute && userRole === "EMPLOYEE") {
    return NextResponse.redirect(new URL("/employee/dashboard", request.url));
  }

  // 4. Redirect generic /dashboard to role-specific dashboard
  if (isGenericDashboard && isAuthenticated) {
    const targetUrl = userRole === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/dashboard",
    "/admin/:path*",
    "/employee/:path*",
  ],
};
