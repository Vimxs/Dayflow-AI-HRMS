import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import {
  verifyAccessToken,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  rotateRefreshToken,
  signAccessToken,
  TokenPayload,
} from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

export interface AuthContext {
  user: TokenPayload;
  refreshed?: boolean;
  newAccessToken?: string;
}

export async function getSession(req: NextRequest): Promise<AuthContext | null> {
  const accessCookie = req.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (accessCookie) {
    const payload = verifyAccessToken(accessCookie);
    if (payload) {
      return { user: payload };
    }
  }

  // Access token expired or missing — try refresh token
  const refreshCookie = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshCookie) {
    return null;
  }

  const rotation = await rotateRefreshToken(refreshCookie);
  if (!rotation) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: rotation.userId },
    include: { employee: true },
  });

  if (!user || !user.isVerified) {
    return null;
  }

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employee?.id,
    employeeCode: user.employee?.employeeCode,
    name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}`.trim() : undefined,
  };

  const newAccessToken = signAccessToken(payload);

  return {
    user: payload,
    refreshed: true,
    newAccessToken,
  };
}

export async function requireAuth(req: NextRequest): Promise<
  | { session: AuthContext; response?: never }
  | { session?: never; response: NextResponse }
> {
  const session = await getSession(req);

  if (!session) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in to access this resource.",
        },
        { status: 401 }
      ),
    };
  }

  return { session };
}

export async function requireRole(
  req: NextRequest,
  allowedRoles: Role[]
): Promise<
  | { session: AuthContext; response?: never }
  | { session?: never; response: NextResponse }
> {
  const authResult = await requireAuth(req);
  if (authResult.response) {
    return authResult;
  }

  const { session } = authResult;
  if (!allowedRoles.includes(session.user.role)) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden. You do not have permission to perform this action.",
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function requireOwnershipOrAdmin(
  req: NextRequest,
  targetEmployeeId: string
): Promise<
  | { session: AuthContext; response?: never }
  | { session?: never; response: NextResponse }
> {
  const authResult = await requireAuth(req);
  if (authResult.response) {
    return authResult;
  }

  const { session } = authResult;

  if (session.user.role === Role.ADMIN) {
    return { session };
  }

  if (session.user.employeeId !== targetEmployeeId) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden. You can only view or modify your own records.",
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}
