import { db } from "@/lib/db";
import { AdminCustomersView } from "@/components/admin/AdminCustomersView";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      addresses: { where: { isDefault: true } },
      bookings: { select: { id: true, finalAmount: true, status: true } },
      reward: { select: { pointsBalance: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = customers.map((c) => {
    const totalSpend = c.bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + b.finalAmount, 0);

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      status: c.status || "ACTIVE",
      city: c.addresses[0]?.city || "Bangalore",
      totalBookings: c.bookings.length,
      totalSpend,
      rewardPoints: c.reward?.pointsBalance || 0,
      createdAt: c.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          User Management
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Customer CRM & Relationship Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect registered customers, monitor booking activity and lifetime spend, manage loyalty rewards and account security status.
        </p>
      </div>

      <AdminCustomersView initialCustomers={formatted} />
    </div>
  );
}
