"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  X,
  TrendingUp,
} from "lucide-react";

interface CouponRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
  expiryDate: string;
  usedCount: number;
  isActive: boolean;
}

export function AdminCouponsView({
  initialCoupons,
}: {
  initialCoupons: CouponRecord[];
}) {
  const [coupons, setCoupons] = useState<CouponRecord[]>(initialCoupons);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "15",
    maxDiscountAmount: "250",
    minOrderAmount: "500",
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
  });

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsed = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.title || !form.discountValue) {
      alert("Please fill in code, title, and discount value");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const created = await res.json();
        setCoupons((prev) => [created, ...prev]);
        setIsCreating(false);
        setForm({
          code: "",
          title: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: "15",
          maxDiscountAmount: "250",
          minOrderAmount: "500",
          expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
        });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create coupon");
      }
    } catch {
      alert("Error creating coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Campaigns
            </span>
            <Tag className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {coupons.length}
          </p>
          <span className="text-xs text-violet-600 font-semibold mt-1 inline-block">
            Configured vouchers
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cumulative Redemptions
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {totalUsed}
          </p>
          <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">
            Applied in customer booking checkout
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Promo Codes
            </span>
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-600 mt-2">
            {coupons.filter((c) => c.isActive).length}
          </p>
          <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">
            Valid & live
          </span>
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search coupon code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Promo Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Campaign Title</th>
                <th className="py-3.5 px-4">Benefit</th>
                <th className="py-3.5 px-4">Min Spend</th>
                <th className="py-3.5 px-4">Max Cap</th>
                <th className="py-3.5 px-4">Times Redeemed</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                      {c.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <div className="text-[11px] text-slate-500">{c.description}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">
                    {c.discountType === "PERCENTAGE"
                      ? `${c.discountValue}% OFF`
                      : `${formatCurrency(c.discountValue)} FLAT OFF`}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {c.minOrderAmount ? formatCurrency(c.minOrderAmount) : "None"}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {c.maxDiscountAmount ? formatCurrency(c.maxDiscountAmount) : "No Cap"}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {c.usedCount}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {formatDate(c.expiryDate)}
                  </td>
                  <td className="py-3.5 px-4">
                    {c.isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        EXPIRED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Launch Promo Campaign
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure discounts for booking funnel checkout
                </p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MONSOON25"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Home Maintenance Special"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({ ...form, discountType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({ ...form, discountValue: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Min Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm({ ...form, minOrderAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) =>
                      setForm({ ...form, maxDiscountAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm({ ...form, expiryDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Publish Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
