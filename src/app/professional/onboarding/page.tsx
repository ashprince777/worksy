import { db } from "@/lib/db";
import { ProfessionalOnboardingWizard } from "@/components/professional/ProfessionalOnboardingWizard";

export default async function ProfessionalOnboardingPage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProfessionalOnboardingWizard categories={categories} />
    </div>
  );
}
