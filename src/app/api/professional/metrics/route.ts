import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalService } from "@/services/professional.service";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Unauthorized professional" }, { status: 401 });
  }

  const profile = await db.professionalProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const data = await ProfessionalService.getProfessionalDashboardMetrics(profile.id);
  return NextResponse.json(data);
}
