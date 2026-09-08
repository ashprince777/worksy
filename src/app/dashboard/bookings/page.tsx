import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CustomerBookingsView } from "@/components/customer/CustomerBookingsView";

export default async function CustomerBookingsPage() {
  const user = await getCurrentUser();
  const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

  const bookings = await db.booking.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { service: true } },
      professional: {
        include: { user: { select: { name: true, phone: true, avatarUrl: true } } },
      },
      address: true,
      payments: true,
      invoice: true,
      review: true,
      warrantyClaim: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CustomerBookingsView initialBookings={bookings as any} />
    </div>
  );
}
