"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function CatalogSearchBar({
  initialQuery = "",
  categorySlug,
}: {
  initialQuery?: string;
  categorySlug?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (query.trim()) params.set("q", query.trim());

    const qs = params.toString();
    router.push(`/services${qs ? `?${qs}` : ""}`);
  };

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    const qs = params.toString();
    router.push(`/services${qs ? `?${qs}` : ""}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search in services..."
        className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-500"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
}
