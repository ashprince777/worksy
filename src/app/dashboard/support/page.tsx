import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CustomerSupportView } from "@/components/customer/CustomerSupportView";

export default async function CustomerSupportPage() {
  const user = await getCurrentUser();
  const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

  const [tickets, warrantyClaims, completedBookings] = await Promise.all([
    db.supportTicket.findMany({
      where: { customerId: userId },
      include: { messages: true },
      orderBy: { createdAt: "desc" },
    }),
    db.warrantyClaim.findMany({
      where: { customerId: userId },
      include: { booking: { include: { items: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.booking.findMany({
      where: { customerId: userId, status: "COMPLETED" },
      include: { items: true },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CustomerSupportView
        initialTickets={tickets as any}
        initialWarrantyClaims={warrantyClaims as any}
        completedBookings={completedBookings as any}
      />
    </div>
  );
}
