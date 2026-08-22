import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  revokeRefreshToken,
  verifyAccessToken,
} from "@/lib/auth/jwt";
import { createAuditLog } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;

    let actorId: string | null = null;
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        actorId = payload.userId;
      }
    }

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    if (actorId) {
      await createAuditLog({
        actorId,
        action: "LOGOUT",
        entity: "User",
        entityId: actorId,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    // Clear authentication cookies
    response.cookies.set(ACCESS_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set(REFRESH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during logout.",
      },
      { status: 500 }
    );
  }
}
