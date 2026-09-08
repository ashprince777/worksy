import { db } from "@/lib/db";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";

export const dynamic = "force-dynamic";

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

export default async function AdminSettingsPage() {
  let settings = await db.settings.findMany({
    orderBy: { key: "asc" },
  });

  if (settings.length === 0) {
    for (const item of DEFAULT_SETTINGS) {
      await db.settings.create({ data: item });
    }
    settings = await db.settings.findMany({
      orderBy: { key: "asc" },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          System Control
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Enterprise Platform Settings & Operational Rules
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Adjust live marketplace fees, commission rates, GST taxation percentages, matching algorithm parameters, and SLA thresholds.
        </p>
      </div>

      <AdminSettingsView initialSettings={settings} />
    </div>
  );
}
