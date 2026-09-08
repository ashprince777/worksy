import Link from "next/link";
import { db } from "@/lib/db";
import { Tag, Sparkles, ArrowRight } from "lucide-react";
import { OffersView } from "@/components/customer/OffersView";

export default async function OffersPage() {
  const coupons = await db.coupon.findMany({
    where: { isActive: true },
    orderBy: { discountValue: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
          Exclusive Deals & Discounts
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Worksy Offers & Coupons
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Save on verified doorstep repairs, deep cleaning, and appliance services
        </p>
      </div>

      <OffersView initialCoupons={coupons as any} />
    </div>
  );
}
