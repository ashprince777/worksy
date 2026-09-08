import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await db.supportTicket.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: { messages: true },
  });

  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, description, category, priority, bookingId } = await request.json();

    if (!subject || !description) {
      return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
    }

    const count = await db.supportTicket.count();
    const ticketNumber = `TCK-2026-${(1000 + count + 1).toString()}`;

    const ticket = await db.supportTicket.create({
      data: {
        ticketNumber,
        customerId: userId,
        bookingId: bookingId || null,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
        subject,
        description,
        status: "OPEN",
        messages: {
          create: [
            {
              senderId: userId,
              senderRole: "CUSTOMER",
              message: description,
            },
          ],
        },
      },
      include: { messages: true },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create ticket" }, { status: 500 });
  }
}
