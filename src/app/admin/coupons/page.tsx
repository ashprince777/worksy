import { db } from "@/lib/db";
import { AdminCouponsView } from "@/components/admin/AdminCouponsView";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formatted = coupons.map((c) => ({
    ...c,
    expiryDate: c.expiryDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
          Growth & Promotions
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Coupons & Marketing Vouchers
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create promotional discount codes, enforce minimum order spends, apply percentage and flat deductions, and track redemption metrics.
        </p>
      </div>

      <AdminCouponsView initialCoupons={formatted} />
    </div>
  );
}
