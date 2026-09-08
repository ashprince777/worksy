import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { code, title, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate } =
      await request.json();

    if (!code || !title || !discountValue) {
      return NextResponse.json({ error: "Code, title, and discount value are required" }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        title,
        description: description || title,
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 86400000),
      },
    });

    await db.auditLog.create({
      data: {
        userEmail: user.email,
        userRole: "ADMIN",
        action: "CREATE_COUPON",
        entity: "Coupon",
        entityId: coupon.id,
        newValueJson: JSON.stringify(coupon),
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}
