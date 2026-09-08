import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const tickets = await db.supportTicket.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tickets);
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { ticketId, status, replyMessage } = await request.json();

    const updatePayload: any = { status };

    if (replyMessage) {
      updatePayload.messages = {
        create: {
          senderId: user.id,
          senderRole: "ADMIN",
          message: replyMessage,
        },
      };
    }

    const updated = await db.supportTicket.update({
      where: { id: ticketId },
      data: updatePayload,
      include: { messages: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update ticket" }, { status: 500 });
  }
}
