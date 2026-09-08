import { db } from "@/lib/db";
import { AdminPaymentsView } from "@/components/admin/AdminPaymentsView";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const [payments, commissions, payouts] = await Promise.all([
    db.payment.findMany({
      include: {
        booking: {
          include: {
            customer: { select: { name: true, email: true, phone: true } },
            professional: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.commission.findMany({
      include: {
        professional: { include: { user: { select: { name: true, email: true } } } },
        booking: { select: { bookingNumber: true, totalAmount: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.payout.findMany({
      include: {
        professional: { include: { user: { select: { name: true, email: true } } } },
        bankAccount: true,
      },
      orderBy: { requestedAt: "desc" },
    }),
  ]);

  const totalVolume = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  const pendingPayoutsAmount = payouts
    .filter((p) => p.status === "REQUESTED" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + p.amount, 0);

  const metrics = {
    totalVolume,
    totalCommission,
    pendingPayoutsAmount,
    successfulPaymentsCount: payments.filter((p) => p.status === "SUCCESS").length,
    pendingPayoutsCount: payouts.filter((p) => p.status === "REQUESTED").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Financial Operations
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Payments, Ledger & Commission Settlement
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor platform GMV transaction volumes, manage partner payout disbursements, and settle commission splits.
        </p>
      </div>

      <AdminPaymentsView
        initialData={{
          metrics,
          payments: payments as any,
          commissions: commissions as any,
          payouts: payouts as any,
        }}
      />
    </div>
  );
}
