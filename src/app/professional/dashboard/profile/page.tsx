import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalProfileEditorView } from "@/components/professional/ProfessionalProfileEditorView";
import { redirect } from "next/navigation";

export default async function ProfessionalProfileEditorPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/professional/dashboard/profile");
  }

  const proId = user.professionalProfileId;
  if (!proId) {
    redirect("/professional/onboarding");
  }

  const profile = await db.professionalProfile.findUnique({
    where: { id: proId },
    include: {
      user: true,
      documents: true,
      services: { include: { service: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProfessionalProfileEditorView profile={profile as any} />
    </div>
  );
}
