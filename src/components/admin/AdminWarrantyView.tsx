"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  X,
  FileText,
  User,
} from "lucide-react";

interface ClaimRecord {
  id: string;
  claimNumber: string;
  bookingId: string;
  customerId: string;
  issueTitle: string;
  issueDescription: string;
  status: string;
  resolutionNotes?: string | null;
  createdAt: string;
  customer: { name: string; email: string; phone: string };
  booking: {
    bookingNumber: string;
    items: Array<{ title: string }>;
    professional?: { user: { name: string; phone: string } } | null;
  };
}

export function AdminWarrantyView({
  initialClaims,
}: {
  initialClaims: ClaimRecord[];
}) {
  const [claims, setClaims] = useState<ClaimRecord[]>(initialClaims);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeClaim, setActiveClaim] = useState<ClaimRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = claims.filter((c) => {
    const matchesSearch =
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.issueTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      c.booking.bookingNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenArbitration = (c: ClaimRecord) => {
    setActiveClaim(c);
    setTargetStatus(c.status);
    setResolutionNotes(c.resolutionNotes || "");
  };

  const handleUpdateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/warranty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: activeClaim.id,
          status: targetStatus,
          resolutionNotes: resolutionNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setClaims((prev) =>
          prev.map((c) =>
            c.id === updated.id
              ? {
                  ...c,
                  status: updated.status,
                  resolutionNotes: updated.resolutionNotes,
                }
              : c
          )
        );
        setActiveClaim(null);
      } else {
        alert("Failed to update warranty claim");
      }
    } catch {
      alert("Error updating claim");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Claims Filed
            </span>
            <ShieldCheck className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {claims.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">
            {claims.filter((c) => c.status === "SUBMITTED").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inspection Scheduled
            </span>
            <AlertTriangle className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-600 mt-2">
            {claims.filter((c) => c.status === "INSPECTION_SCHEDULED").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved / Re-serviced
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {claims.filter((c) => c.status === "APPROVED" || c.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search claim #, booking #, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "SUBMITTED", "INSPECTION_SCHEDULED", "APPROVED", "REJECTED", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Claim Ref</th>
                <th className="py-3.5 px-4">Booking Ref & Service</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Assigned Partner</th>
                <th className="py-3.5 px-4">Reported Issue</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Arbitration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No warranty claims match the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {c.claimNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {c.booking.bookingNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {c.booking.items[0]?.title || "Service item"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.customer.name}</div>
                      <div className="text-[11px] text-slate-500">{c.customer.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {c.booking.professional?.user?.name || "Unassigned"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.booking.professional?.user?.phone || ""}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">
                        {c.issueTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {c.issueDescription}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "SUBMITTED"
                            ? "bg-amber-100 text-amber-800"
                            : c.status === "APPROVED" || c.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenArbitration(c)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors"
                      >
                        Arbitrate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arbitration Modal */}
      {activeClaim && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    {activeClaim.claimNumber}
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Warranty Claim Arbitration
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Booking #{activeClaim.booking.bookingNumber} • Filed {formatDate(activeClaim.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setActiveClaim(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-600">Issue Reported:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{activeClaim.issueTitle}</p>
                <p className="text-slate-600 mt-1">{activeClaim.issueDescription}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Customer: {activeClaim.customer.name} ({activeClaim.customer.phone})</span>
                <span>Pro: {activeClaim.booking.professional?.user?.name || "Unassigned"}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateClaim} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Arbitration Decision / Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="SUBMITTED">SUBMITTED (Under Review)</option>
                  <option value="INSPECTION_SCHEDULED">INSPECTION_SCHEDULED (Free Re-visit)</option>
                  <option value="APPROVED">APPROVED (Re-service Authorized)</option>
                  <option value="REJECTED">REJECTED (Outside Warranty Coverage)</option>
                  <option value="COMPLETED">COMPLETED (Defect Rectified)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Resolution Notes & Audit Rationale
                </label>
                <textarea
                  rows={3}
                  placeholder="State the technical inspection outcome, partner accountability, or resolution details..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveClaim(null)}
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
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
