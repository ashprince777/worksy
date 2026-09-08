import { NextResponse } from "next/server";
import { BookingService } from "@/services/booking.service";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await BookingService.getCustomerBookings(user.id);
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const booking = await BookingService.createBooking({
      ...body,
      customerId: user.id,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 400 });
  }
}
