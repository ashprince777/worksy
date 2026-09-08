import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LiveTrackingView } from "@/components/customer/LiveTrackingView";

export default async function TrackingPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await getCurrentUser();

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      items: { include: { service: true } },
      professional: {
        include: {
          user: { select: { name: true, phone: true, avatarUrl: true } },
        },
      },
      address: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      invoice: true,
    },
  });

  if (!booking) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <LiveTrackingView initialBooking={booking as any} currentUserId={user?.id} />
    </div>
  );
}
