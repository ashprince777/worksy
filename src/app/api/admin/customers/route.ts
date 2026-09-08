import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      addresses: { where: { isDefault: true } },
      bookings: { select: { id: true, finalAmount: true, status: true } },
      reward: { select: { pointsBalance: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = customers.map((c) => {
    const totalSpend = c.bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + b.finalAmount, 0);

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      status: c.status || "ACTIVE",
      city: c.addresses[0]?.city || "Bangalore",
      totalBookings: c.bookings.length,
      totalSpend,
      rewardPoints: c.reward?.pointsBalance || 0,
      createdAt: c.createdAt,
    };
  });

  return NextResponse.json(formatted);
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { customerId, status } = await request.json();

    const updated = await db.user.update({
      where: { id: customerId },
      data: { status },
    });

    await db.auditLog.create({
      data: {
        userEmail: user.email,
        userRole: "ADMIN",
        action: `CUSTOMER_${status}`,
        entity: "User",
        entityId: customerId,
        newValueJson: JSON.stringify({ status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update customer" }, { status: 500 });
  }
}

