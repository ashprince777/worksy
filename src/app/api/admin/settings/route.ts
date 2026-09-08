import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const DEFAULT_SETTINGS = [
  { key: "platform_fee", value: "49", description: "Convenience & safety fee charged per booking (INR)", category: "COMMISSION" },
  { key: "tax_gst_percent", value: "18", description: "Standard GST applied to services (%)", category: "TAX" },
  { key: "default_commission_rate", value: "15", description: "Platform revenue share deducted from partner payout (%)", category: "COMMISSION" },
  { key: "referral_reward_points", value: "100", description: "Loyalty points awarded for referral signup", category: "GENERAL" },
  { key: "emergency_surcharge_multiplier", value: "1.25", description: "Price multiplier for 60-minute emergency jobs", category: "GENERAL" },
  { key: "warranty_standard_days", value: "30", description: "Standard post-service Worksy warranty coverage (Days)", category: "GENERAL" },
  { key: "auto_assign_bookings", value: "true", description: "Automatically match highest-scoring available partner", category: "MATCHING" },
  { key: "support_sla_hours", value: "24", description: "Maximum turnaround time for customer disputes (Hours)", category: "GENERAL" },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let settings = await db.settings.findMany({
      orderBy: { key: "asc" },
    });

    if (settings.length === 0) {
      for (const item of DEFAULT_SETTINGS) {
        await db.settings.create({
          data: item,
        });
      }
      settings = await db.settings.findMany({
        orderBy: { key: "asc" },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const updated = await db.settings.upsert({
      where: { key },
      update: { value: String(value) },
      create: {
        key,
        value: String(value),
        category: "GENERAL",
        description: `Custom configured ${key}`,
      },
    });

    await db.auditLog.create({
      data: {
        userEmail: user.email,
        userRole: "ADMIN",
        action: "UPDATE_SETTING",
        entity: "Settings",
        entityId: updated.id,
        newValueJson: JSON.stringify({ key, value }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update setting" }, { status: 500 });
  }
}
