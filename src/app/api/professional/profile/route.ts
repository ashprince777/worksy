import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.professionalProfileId) {
      return NextResponse.json({ error: "Unauthorized: Professional account required" }, { status: 401 });
    }

    const proProfileId = user.professionalProfileId;

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
