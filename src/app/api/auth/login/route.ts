import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        professionalProfile: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This account has been suspended or deactivated. Please contact support." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as any,
      avatarUrl: user.avatarUrl,
      professionalProfileId: user.professionalProfile?.id,
    });

    let defaultRedirect = "/dashboard";
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      defaultRedirect = "/admin/dashboard";
    } else if (user.role === "PROFESSIONAL") {
      defaultRedirect = "/professional/dashboard";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectUrl: defaultRedirect,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
