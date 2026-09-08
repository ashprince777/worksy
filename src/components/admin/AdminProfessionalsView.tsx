"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileText,
  Star,
  Check,
  Ban,
  Search,
} from "lucide-react";

interface AdminProfessionalsViewProps {
  initialProfessionals: any[];
}

export function AdminProfessionalsView({
  initialProfessionals,
}: AdminProfessionalsViewProps) {
  const [professionals, setProfessionals] = useState(initialProfessionals);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (
    professionalId: string,
    status: "APPROVED" | "REJECTED" | "SUSPENDED"
  ) => {
    setLoadingId(professionalId);
    try {
      const res = await fetch("/api/admin/professionals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          status,
          notes: `Updated status to ${status} via Admin Desk`,
        }),
      });

      if (res.ok) {
        setProfessionals((prev) =>
          prev.map((p) =>
            p.id === professionalId ? { ...p, verificationStatus: status } : p
          )
        );
      } else {
        alert("Failed to update status");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = professionals.filter((p) => {
    if (filter !== "ALL" && p.verificationStatus !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.user.name.toLowerCase().includes(q) ||
        p.user.email.toLowerCase().includes(q) ||
        p.user.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Partners" },
            { id: "PENDING_REVIEW", label: "Pending Review" },
            { id: "APPROVED", label: "Approved" },
            { id: "SUSPENDED", label: "Suspended" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Professional</th>
              <th className="py-3 px-4">Rating & Exp</th>
              <th className="py-3 px-4">KYC Documents</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((pro) => {
              const isPending = pro.verificationStatus === "PENDING_REVIEW";
              const isApproved = pro.verificationStatus === "APPROVED";

              return (
                <tr key={pro.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{pro.user.name}</div>
                    <div className="text-slate-400 text-[11px]">{pro.user.phone} • {pro.user.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{pro.rating}★</span>
                      <span className="text-slate-400 font-normal">({pro._count.assignedJobs} jobs)</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">{pro.experienceYears} Years Exp</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>Aadhaar / Govt ID</span>
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : isPending
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {pro.verificationStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {!isApproved && (
                        <button
                          type="button"
                          disabled={loadingId === pro.id}
                          onClick={() => handleAction(pro.id, "APPROVED")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                        >
                          Approve
                        </button>
                      )}

                      {isApproved && (
                        <button
                          type="button"
                          disabled={loadingId === pro.id}
                          onClick={() => handleAction(pro.id, "SUSPENDED")}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
