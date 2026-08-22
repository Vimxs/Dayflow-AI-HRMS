/**
 * Dayflow HRMS — Route Protection Middleware
 * Architecture doc §3: middleware.ts at project root
 * Security doc §2: "No client-side-only route protection — middleware.ts required"
 *
 * Phase 0: Stub — full JWT verification wired in T1.5 (RBAC middleware).
 * Currently passes all requests through so Phase 0 shell renders.
 */
import { type NextRequest, NextResponse } from "next/server";

// Routes that do NOT require authentication
const _PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

// Routes that require ADMIN role
const _ADMIN_ROUTES = ["/admin"];

// Routes that require EMPLOYEE role (or ADMIN)
const _EMPLOYEE_ROUTES = ["/dashboard", "/profile", "/attendance", "/leave", "/payroll"];

export function middleware(request: NextRequest) {
  const { pathname: _pathname } = request.nextUrl;

  // STUB (T1.5): Full JWT verification + role guard added here in Phase 1.
  // For now, allow all requests through so the Phase 0 shell renders.

  // TODO (T1.5): Implement:
  //   1. Extract + verify JWT from httpOnly cookie
  //   2. If protected route + no valid token → redirect /sign-in
  //   3. If admin route + role !== ADMIN → redirect /dashboard (403 handling)
  //   4. If auth route + valid token → redirect to role-appropriate dashboard

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files, _next internals, and API routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
