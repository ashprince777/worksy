import { db } from "@/lib/db";
import { AdminServicesView } from "@/components/admin/AdminServicesView";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    db.service.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
          Marketplace Catalog
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Services & Dynamic Pricing Manager
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Adjust base pricing, estimated durations, Worksy warranties, and toggle availability across the live customer catalog.
        </p>
      </div>

      <AdminServicesView
        initialServices={services as any}
        categories={categories}
      />
    </div>
  );
}
