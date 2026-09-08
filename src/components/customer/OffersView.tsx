"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, Copy, Check, ArrowRight } from "lucide-react";

interface OffersViewProps {
  initialCoupons: any[];
}

export function OffersView({ initialCoupons }: OffersViewProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {initialCoupons.map((c) => (
        <div
          key={c.id}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-teal-500/50 transition-all"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
              </span>
              <span className="text-[11px] text-slate-400">
                Min. Order ₹{c.minOrderAmount}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{c.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="bg-slate-50 border border-slate-200 border-dashed px-3 py-2 rounded-xl font-mono font-black text-sm text-slate-900 tracking-wider">
              {c.code}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(c.code)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === c.code ? "Copied" : "Copy Code"}</span>
              </button>

              <Link
                href="/services"
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
              >
                <span>Use Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
