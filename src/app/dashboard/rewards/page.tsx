import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Award, Gift, Copy, ArrowRight, CheckCircle2 } from "lucide-react";
import { CustomerRewardsView } from "@/components/customer/CustomerRewardsView";

export default async function CustomerRewardsPage() {
  const user = await getCurrentUser();
  const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

  let reward = await db.reward.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
  });

  if (!reward && userId) {
    reward = await db.reward.create({
      data: {
        userId,
        pointsBalance: 350,
        lifetimeEarned: 500,
        lifetimeRedeemed: 150,
        referralCode: `WRK-${userId.slice(-4).toUpperCase()}`,
        transactions: {
          create: [
            { points: 100, type: "REFERRAL_BONUS", description: "Welcome joining bonus points" },
            { points: 250, type: "EARNED", description: "Points earned from completed bookings" },
          ],
        },
      },
      include: { transactions: true },
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CustomerRewardsView reward={reward as any} />
    </div>
  );
}
