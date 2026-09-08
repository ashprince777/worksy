import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, phone, password, role = "CUSTOMER" } = await request.json();

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, phone number, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    // Check if email already registered
    const existingEmail = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Check if phone already registered
    const existingPhone = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: "An account with this phone number already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === "PROFESSIONAL" ? "PROFESSIONAL" : "CUSTOMER";

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        role: assignedRole,
        status: "ACTIVE",
      },
    });

    let proProfileId: string | undefined;

    if (assignedRole === "CUSTOMER") {
      await db.customerProfile.create({
        data: {
          userId: user.id,
        },
      });

      // Grant welcome reward points
      await db.reward.create({
        data: {
          userId: user.id,
          pointsBalance: 100,
          lifetimeEarned: 100,
          referralCode: `WRK-${user.id.slice(-6).toUpperCase()}`,
          transactions: {
            create: [
              {
                points: 100,
                type: "BONUS",
                description: "Welcome joining bonus points",
              },
            ],
          },
        },
      });
    } else if (assignedRole === "PROFESSIONAL") {
      const proProfile = await db.professionalProfile.create({
        data: {
          userId: user.id,
          verificationStatus: "PENDING_REVIEW",
          experienceYears: 1,
          bio: "Passionate and verified service professional ready to serve customers.",
        },
      });
      proProfileId = proProfile.id;
    }

    await setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: assignedRole,
      avatarUrl: user.avatarUrl,
      professionalProfileId: proProfileId,
    });

    const redirectUrl =
      assignedRole === "PROFESSIONAL"
        ? "/professional/onboarding"
        : "/dashboard";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectUrl,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
