import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalProfileEditorView } from "@/components/professional/ProfessionalProfileEditorView";

export default async function ProfessionalProfileEditorPage() {
  const user = await getCurrentUser();
  let proId = user?.professionalProfileId;

  if (!proId) {
    const demoPro = await db.user.findUnique({
      where: { email: "pro@worksy.com" },
      include: { professionalProfile: true },
    });
    proId = demoPro?.professionalProfile?.id;
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
