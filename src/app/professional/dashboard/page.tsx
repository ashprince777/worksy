import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalService } from "@/services/professional.service";
import { ProfessionalDashboardView } from "@/components/professional/ProfessionalDashboardView";

export default async function ProfessionalDashboardPage() {
  const user = await getCurrentUser();

  // If not signed in as pro, fallback to demo professional (Rajesh Kumar)
  let targetProId = user?.professionalProfileId;
  if (!targetProId) {
    const demoProUser = await db.user.findUnique({
      where: { email: "pro@worksy.com" },
      include: { professionalProfile: true },
    });
    targetProId = demoProUser?.professionalProfile?.id;
  }

  if (!targetProId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        Professional profile not found.
      </div>
    );
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
