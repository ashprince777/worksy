import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalService } from "@/services/professional.service";
import { ProfessionalDashboardView } from "@/components/professional/ProfessionalDashboardView";
import { redirect } from "next/navigation";

export default async function ProfessionalDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/professional/dashboard");
  }

  let targetProId = user.professionalProfileId;

  // If user is not yet a professional, redirect them to onboarding wizard
  if (!targetProId) {
    redirect("/professional/onboarding");
  }

  const [metricsData, jobs] = await Promise.all([
    ProfessionalService.getProfessionalDashboardMetrics(targetProId),
    ProfessionalService.getAssignedJobs(targetProId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProfessionalDashboardView
        initialMetrics={metricsData}
        initialJobs={jobs as any}
      />
    </div>
  );
}
