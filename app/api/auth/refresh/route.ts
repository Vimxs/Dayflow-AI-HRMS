import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH_COOKIE_NAME,
  ACCESS_COOKIE_NAME,
  rotateRefreshToken,
  signAccessToken,
  getAuthCookieOptions,
  TokenPayload,
} from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No refresh token provided.",
        },
        { status: 401 }
      );
    }

    const rotationResult = await rotateRefreshToken(refreshToken);

    if (!rotationResult) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Invalid or expired session. Please sign in again.",
        },
        { status: 401 }
      );

      // Clear cookies on invalid refresh
      response.cookies.delete(ACCESS_COOKIE_NAME);
      response.cookies.delete(REFRESH_COOKIE_NAME);
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: rotationResult.userId },
      include: { employee: true },
    });

    if (!user || !user.isVerified) {
      const response = NextResponse.json(
        {
          success: false,
          error: "User not found or account deactivated.",
        },
        { status: 401 }
      );
      response.cookies.delete(ACCESS_COOKIE_NAME);
      response.cookies.delete(REFRESH_COOKIE_NAME);
      return response;
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

    const response = NextResponse.json({
      success: true,
      message: "Session refreshed successfully.",
      data: { user: payload },
    });

    response.cookies.set(
      ACCESS_COOKIE_NAME,
      newAccessToken,
      getAuthCookieOptions(15 * 60)
    );

    response.cookies.set(
      REFRESH_COOKIE_NAME,
      rotationResult.newRefreshToken,
      getAuthCookieOptions(7 * 24 * 60 * 60)
    );

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh authentication session.",
      },
      { status: 500 }
    );
  }
}
