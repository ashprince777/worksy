import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    let email = "customer@worksy.com";
    if (role === "PROFESSIONAL") {
      email = "pro@worksy.com";
    } else if (role === "ADMIN") {
      email = "admin@worksy.com";
    } else if (role === "SUPER_ADMIN") {
      email = "superadmin@worksy.com";
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        professionalProfile: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Demo user not found in database. Please run seed." }, { status: 404 });
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to authenticate demo user" }, { status: 500 });
  }
}
