import Link from "next/link";
import { Search, Filter, Sparkles, Layers } from "lucide-react";
import { ServiceService } from "@/services/service.service";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { CatalogSearchBar } from "@/components/customer/CatalogSearchBar";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}) {
  const { category: categorySlug, q, sort } = await searchParams;

  const [categories, allServices] = await Promise.all([
    ServiceService.getAllCategories(),
    ServiceService.getServices({ search: q }),
  ]);

  let filteredServices = allServices;

  if (categorySlug) {
    const selectedCat = categories.find((c) => c.slug === categorySlug);
    if (selectedCat) {
      filteredServices = filteredServices.filter(
        (s) => s.categoryId === selectedCat.id
      );
    }
  }

  if (sort === "price-asc") {
    filteredServices.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (sort === "price-desc") {
    filteredServices.sort((a, b) => b.startingPrice - a.startingPrice);
  }

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Worksy Service Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {activeCategory ? activeCategory.name : "All Verified Services"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeCategory?.description ||
              "Explore all 50+ standardized doorstep services with transparent prices and certified professionals."}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl text-xs font-semibold text-teal-300 shrink-0">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{filteredServices.length} Services Available</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <Link
            href={q ? `/services?q=${encodeURIComponent(q)}` : "/services"}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              !categorySlug
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services?category=${cat.slug}${q ? `&q=${q}` : ""}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categorySlug === cat.slug
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <CatalogSearchBar initialQuery={q} categorySlug={categorySlug} />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service as any} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Filter className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No services matched your query</h3>
          <p className="text-xs text-slate-500">
            Try clearing your search query or selecting a different service category.
          </p>
          <Link
            href="/services"
            className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
          >
            Clear Filters
          </Link>
        </div>
      )}
    </div>
  );
}
