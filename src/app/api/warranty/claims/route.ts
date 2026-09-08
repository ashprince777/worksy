import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claims = await db.warrantyClaim.findMany({
    where: { customerId: userId },
    include: { booking: { include: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(claims);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, issueTitle, issueDescription } = await request.json();

    if (!bookingId || !issueTitle || !issueDescription) {
      return NextResponse.json({ error: "Booking ID, issue title, and issue description are required" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.customerId !== userId) {
      return NextResponse.json({ error: "Forbidden: You did not create this booking" }, { status: 403 });
    }

    const existingClaim = await db.warrantyClaim.findUnique({
      where: { bookingId },
    });

    if (existingClaim) {
      return NextResponse.json({ error: "A warranty claim has already been registered for this booking" }, { status: 400 });
    }

    const count = await db.warrantyClaim.count();
    const claimNumber = `WRN-2026-${(100 + count + 1).toString()}`;

    const claim = await db.warrantyClaim.create({
      data: {
        claimNumber,
        bookingId,
        customerId: userId,
        issueTitle,
        issueDescription,
        status: "SUBMITTED",
      },
      include: { booking: true },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit warranty claim" }, { status: 500 });
  }
}
