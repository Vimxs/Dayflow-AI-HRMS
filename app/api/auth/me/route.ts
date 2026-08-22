import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac/guards";
import { prisma } from "@/lib/db/prisma";
import { ACCESS_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Fetch fresh user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.userId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            phone: true,
            address: true,
            jobTitle: true,
            department: true,
            dateOfJoining: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!user || !user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found or account not active",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          employee: user.employee,
        },
      },
    });

    // If session was refreshed during request, set new access token cookie
    if (session.refreshed && session.newAccessToken) {
      response.cookies.set(
        ACCESS_COOKIE_NAME,
        session.newAccessToken,
        getAuthCookieOptions(15 * 60)
      );
    }

    return response;
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve user session.",
      },
      { status: 500 }
    );
  }
}
