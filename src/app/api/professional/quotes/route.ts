import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalService } from "@/services/professional.service";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const quote = await ProfessionalService.createQuote({
      ...body,
      professionalId: profile.id,
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create quote" }, { status: 400 });
  }
}
