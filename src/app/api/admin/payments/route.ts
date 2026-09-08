import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [payments, commissions, payouts] = await Promise.all([
      db.payment.findMany({
        include: {
          booking: {
            include: {
              customer: { select: { name: true, email: true, phone: true } },
              professional: { include: { user: { select: { name: true } } } },
              items: true,
            },
          },
          transactions: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.commission.findMany({
        include: {
          professional: { include: { user: { select: { name: true, email: true } } } },
          booking: { select: { bookingNumber: true, totalAmount: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.payout.findMany({
        include: {
          professional: { include: { user: { select: { name: true, email: true } } } },
          bankAccount: true,
        },
        orderBy: { requestedAt: "desc" },
      }),
    ]);

    const totalVolume = payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    const pendingPayoutsAmount = payouts
      .filter((p) => p.status === "REQUESTED" || p.status === "PROCESSING")
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      metrics: {
        totalVolume,
        totalCommission,
        pendingPayoutsAmount,
        successfulPaymentsCount: payments.filter((p) => p.status === "SUCCESS").length,
        pendingPayoutsCount: payouts.filter((p) => p.status === "REQUESTED").length,
      },
      payments,
      commissions,
      payouts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch financial data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { type, id, status, transactionRef } = await request.json();

    if (type === "PAYOUT") {
      const updated = await db.payout.update({
        where: { id },
        data: {
          status,
          transactionRef: transactionRef || undefined,
          processedAt: status === "PROCESSED" ? new Date() : undefined,
        },
      });

      await db.auditLog.create({
        data: {
          userEmail: user.email,
          userRole: "ADMIN",
          action: `PAYOUT_${status}`,
          entity: "Payout",
          entityId: id,
          newValueJson: JSON.stringify(updated),
        },
      });

      return NextResponse.json(updated);
    }

    if (type === "COMMISSION") {
      const updated = await db.commission.update({
        where: { id },
        data: {
          status,
          settledAt: status === "SETTLED" ? new Date() : undefined,
        },
      });

      await db.auditLog.create({
        data: {
          userEmail: user.email,
          userRole: "ADMIN",
          action: `COMMISSION_${status}`,
          entity: "Commission",
          entityId: id,
          newValueJson: JSON.stringify(updated),
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update financial record" }, { status: 500 });
  }
}
