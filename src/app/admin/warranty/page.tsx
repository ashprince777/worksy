import { db } from "@/lib/db";
import { AdminWarrantyView } from "@/components/admin/AdminWarrantyView";

export const dynamic = "force-dynamic";

export default async function AdminWarrantyPage() {
  const claims = await db.warrantyClaim.findMany({
    include: {
      customer: {
        select: { name: true, email: true, phone: true },
      },
      booking: {
        include: {
          items: true,
          professional: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = claims.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          Guarantee & Trust Program
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Worksy 30-Day Warranty Claims Arbitration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review defect claims, schedule free partner re-inspections, approve warranty fixes, and safeguard the Worksy satisfaction promise.
        </p>
      </div>

      <AdminWarrantyView initialClaims={formatted as any} />
    </div>
  );
}
