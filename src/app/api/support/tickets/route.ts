import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await db.supportTicket.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { messages: true },
  });

  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      // Support inquiries from guest visitors fallback to system/first user
      const fallbackUser =
        (await db.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } })) ||
        (await db.user.findFirst({ select: { id: true } }));

      if (fallbackUser) {
        userId = fallbackUser.id;
      } else {
        return NextResponse.json({ error: "System operator unavailable" }, { status: 500 });
      }
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
