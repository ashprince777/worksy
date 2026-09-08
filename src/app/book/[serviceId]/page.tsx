import { notFound, redirect } from "next/navigation";
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

  if (!user) {
    redirect(`/login?redirect=/book/${serviceId}${variantId ? `?variantId=${variantId}` : ""}`);
  }

  const [addresses, matchedPros] = await Promise.all([
    db.address.findMany({ where: { userId: user.id } }),
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
        customerId={user.id}
      />
    </div>
  );
}
