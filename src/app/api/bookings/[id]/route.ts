import { NextResponse } from "next/server";
import { BookingService } from "@/services/booking.service";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await BookingService.getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Authorization check: only customer, assigned pro, or admin can access
  if (
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN" &&
    booking.customerId !== user.id &&
    booking.professional?.userId !== user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(booking);
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, note } = await request.json();
    const updated = await BookingService.updateStatus(id, status, user.id, note);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update booking status" }, { status: 400 });
  }
}
