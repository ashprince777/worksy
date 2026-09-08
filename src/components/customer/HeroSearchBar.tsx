"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";

export function HeroSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/services?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/services");
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-slate-950/40 border border-slate-700/50 flex flex-col sm:flex-row items-center gap-2 text-slate-900"
    >
      <div className="flex items-center gap-2.5 px-3 py-2 w-full sm:w-auto sm:border-r border-slate-200 text-xs text-slate-600">
        <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
        <span className="font-semibold text-slate-800">Bangalore (BLR)</span>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What service do you need? (e.g. AC, plumbing, cleaning)"
          className="w-full text-xs sm:text-sm bg-transparent placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
      >
        <span>Find Services</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
