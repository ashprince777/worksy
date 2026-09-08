import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { code, amount } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: "Invalid or inactive coupon code" }, { status: 400 });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" }, { status: 400 });
    }

    if (amount < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = Math.min(coupon.discountValue, amount);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: Math.round(discount),
      message: `Coupon applied! You saved ₹${Math.round(discount)}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to validate coupon" }, { status: 500 });
  }
}
