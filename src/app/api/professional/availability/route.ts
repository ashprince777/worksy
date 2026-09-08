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

    const { availabilities } = await request.json();

    if (!Array.isArray(availabilities)) {
      return NextResponse.json({ error: "Availabilities must be an array" }, { status: 400 });
    }

    // Replace working hours
    await db.professionalAvailability.deleteMany({
      where: { professionalId: proProfileId },
    });

    await db.professionalAvailability.createMany({
      data: availabilities.map((a: any) => ({
        professionalId: proProfileId!,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime || "08:30",
        endTime: a.endTime || "19:00",
        isWorkingDay: Boolean(a.isWorkingDay),
      })),
    });

    return NextResponse.json({ success: true, message: "Working hours updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update availability" }, { status: 500 });
  }
}
