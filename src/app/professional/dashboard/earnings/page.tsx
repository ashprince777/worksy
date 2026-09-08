import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalEarningsView } from "@/components/professional/ProfessionalEarningsView";

export default async function ProfessionalEarningsPage() {
  const user = await getCurrentUser();
  let proId = user?.professionalProfileId;

  if (!proId) {
    const demoPro = await db.user.findUnique({
      where: { email: "pro@worksy.com" },
      include: { professionalProfile: true },
    });
    proId = demoPro?.professionalProfile?.id;
  }

  const [commissions, payouts, bankAccount] = await Promise.all([
    db.commission.findMany({
      where: { professionalId: proId },
      include: { booking: { include: { items: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.payout.findMany({
      where: { professionalId: proId },
      orderBy: { requestedAt: "desc" },
    }),
    db.bankAccount.findFirst({
      where: { professionalId: proId, isPrimary: true },
    }),
  ]);

  const totalGross = commissions.reduce(
    (sum, c) => sum + c.commissionAmount + c.professionalPayout,
    0
  );
  const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalNet = commissions.reduce((sum, c) => sum + c.professionalPayout, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProfessionalEarningsView
        totalGross={totalGross}
        totalCommission={totalCommission}
        totalNet={totalNet}
        commissions={commissions as any}
        initialPayouts={payouts as any}
        bankAccount={bankAccount as any}
      />
    </div>
  );
}
