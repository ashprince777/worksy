import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    let proProfileId = user?.professionalProfileId;

    if (!proProfileId) {
      const demoPro = await db.user.findUnique({
        where: { email: "pro@worksy.com" },
        include: { professionalProfile: true },
      });
      proProfileId = demoPro?.professionalProfile?.id;
    }

    if (!proProfileId) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    const { bio, experienceYears, hourlyRate } = await request.json();

    const updated = await db.professionalProfile.update({
      where: { id: proProfileId },
      data: {
        bio,
        experienceYears: parseInt(experienceYears) || undefined,
        hourlyRate: parseFloat(hourlyRate) || undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
