"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function ProfessionalsSearchBar({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/professionals?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/professionals");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search professional by name or specialty..."
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </form>
  );
}
