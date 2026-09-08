import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalCalendarView } from "@/components/professional/ProfessionalCalendarView";
import { redirect } from "next/navigation";

export default async function ProfessionalCalendarPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/professional/dashboard/calendar");
  }

  const proId = user.professionalProfileId;
  if (!proId) {
    redirect("/professional/onboarding");
  }

  const availabilities = await db.professionalAvailability.findMany({
    where: { professionalId: proId },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProfessionalCalendarView initialAvailabilities={availabilities} />
    </div>
  );
}
