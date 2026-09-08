import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const claims = await db.warrantyClaim.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      booking: {
        include: {
          items: true,
          professional: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(claims);
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { claimId, status, resolutionNotes } = await request.json();

    const updated = await db.warrantyClaim.update({
      where: { id: claimId },
      data: {
        status,
        resolutionNotes,
      },
      include: { booking: true },
    });

    await db.auditLog.create({
      data: {
        userEmail: user.email,
        userRole: "ADMIN",
        action: `WARRANTY_${status}`,
        entity: "WarrantyClaim",
        entityId: claimId,
        newValueJson: JSON.stringify({ status, resolutionNotes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update warranty claim" }, { status: 500 });
  }
}
