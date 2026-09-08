import { db } from "@/lib/db";
import { AdminCategoriesView } from "@/components/admin/AdminCategoriesView";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { services: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
          Marketplace Taxonomy
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Service Categories & Hierarchies
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define core service verticals, assign visual iconography, and oversee catalog depth across all 10 platform sectors.
        </p>
      </div>

      <AdminCategoriesView initialCategories={categories as any} />
    </div>
  );
}
