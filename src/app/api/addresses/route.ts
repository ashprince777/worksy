import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await db.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, street, landmark, city, state, postalCode, isDefault } = await request.json();

    if (!street || !city || !postalCode) {
      return NextResponse.json({ error: "Street, city, and postal code are required" }, { status: 400 });
    }

    if (isDefault) {
      await db.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId,
        label: label || "Home",
        street,
        landmark,
        city: city || "Bangalore",
        state: state || "Karnataka",
        postalCode,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create address" }, { status: 500 });
  }
}
