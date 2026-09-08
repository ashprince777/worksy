import { db } from "@/lib/db";
import { AdminProfessionalsView } from "@/components/admin/AdminProfessionalsView";

export default async function AdminProfessionalsPage() {
  const pros = await db.professionalProfile.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      documents: true,
      bankAccounts: true,
      _count: { select: { assignedJobs: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Compliance & Verification
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Professional Partner Management & KYC
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review government documents, approve new partner applications, or suspend non-compliant accounts.
        </p>
      </div>

      <AdminProfessionalsView initialProfessionals={pros as any} />
    </div>
  );
}
