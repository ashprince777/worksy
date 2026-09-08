import { notFound } from "next/navigation";
import { ServiceService } from "@/services/service.service";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { BookingWizard } from "@/components/customer/BookingWizard";

export default async function BookServicePage(props: {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ variantId?: string }>;
}) {
  const { serviceId } = await props.params;
  const { variantId } = await props.searchParams;

  const [service, user] = await Promise.all([
    ServiceService.getServiceById(serviceId),
    getCurrentUser(),
  ]);

  if (!service) {
    notFound();
  }

  // Fetch addresses for logged in user, or demo customer addresses
  const targetUserId = user ? user.id : (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

  const [addresses, matchedPros] = await Promise.all([
    targetUserId
      ? db.address.findMany({ where: { userId: targetUserId } })
      : [],
    db.professionalProfile.findMany({
      where: {
        services: { some: { serviceId: service.id } },
        verificationStatus: "APPROVED",
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
      take: 5,
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <BookingWizard
        service={service as any}
        defaultVariantId={variantId}
        savedAddresses={addresses}
        matchedPros={matchedPros}
        customerId={targetUserId || ""}
      />
    </div>
  );
}
