import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AdminService } from "@/services/admin.service";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 403 });
  }

  const professionals = await db.professionalProfile.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
      documents: true,
      bankAccounts: true,
      _count: { select: { assignedJobs: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(professionals);
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 403 });
    }

    const { professionalId, status, notes } = await request.json();
    const updated = await AdminService.verifyProfessional(
      professionalId,
      status,
      notes,
      user.email
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update professional KYC" }, { status: 400 });
  }
}
