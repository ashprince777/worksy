"use client";

import { useState } from "react";
import {
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  Phone,
  FilePlus,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingEngine, BookingStatus } from "@/core/booking-engine";

interface ProfessionalDashboardViewProps {
  initialMetrics: any;
  initialJobs: any[];
}

export function ProfessionalDashboardView({
  initialMetrics,
  initialJobs,
}: ProfessionalDashboardViewProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [isOnline, setIsOnline] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [activeBookingForQuote, setActiveBookingForQuote] = useState<any>(null);

  // Quote form state
  const [labourCharge, setLabourCharge] = useState("350");
  const [materialCharge, setMaterialCharge] = useState("500");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const metrics = initialMetrics.metrics;
  const profile = initialMetrics.profile;

  const handleUpdateStatus = async (bookingId: string, nextStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          note: `Partner progressed job to ${nextStatus}`,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setJobs((prev) =>
          prev.map((j) => (j.id === bookingId ? { ...j, status: updated.status } : j))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status");
      }
    } catch (e: any) {
      alert(e.message || "Error updating status");
    }
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingForQuote) return;

    setSubmittingQuote(true);
    try {
      const res = await fetch("/api/professional/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: activeBookingForQuote.id,
          labourCharge: parseFloat(labourCharge) || 0,
          materialCharge: parseFloat(materialCharge) || 0,
          notes: quoteNotes,
          items: [
            { description: "Labor & Technical Workmanship", quantity: 1, unitPrice: parseFloat(labourCharge) || 0 },
            { description: "Spare Parts & Raw Consumables", quantity: 1, unitPrice: parseFloat(materialCharge) || 0 },
          ],
        }),
      });

      if (res.ok) {
        alert("Quote generated and sent to customer!");
        setQuoteModalOpen(false);
      }
    } finally {
      setSubmittingQuote(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner with Online Switch */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/20 px-2.5 py-0.5 rounded border border-teal-500/30">
              Partner Cockpit
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{profile?.verificationStatus}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {profile?.user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Certified Electrician & Appliance Technician • Bangalore Hub
          </p>
        </div>

        {/* Online Status Toggle */}
        <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className="text-xs font-bold text-slate-200">
              {isOnline ? "Available for New Jobs" : "Offline (Paused)"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isOnline
                ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            }`}
          >
            {isOnline ? "Go Offline" : "Go Online"}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Net Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(metrics?.lifetimeEarnings || 18450)}
          </div>
          <p className="text-[11px] text-slate-500">After 15% Worksy platform fee</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Completed Jobs</span>
            <CheckCircle className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {metrics?.completedJobs || 24}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">98.6% completion rate</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Partner Rating</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {metrics?.rating || 4.92}★
          </div>
          <p className="text-[11px] text-slate-500">Based on 140+ verified reviews</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Requests</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600">
            {jobs.filter((j) => j.status !== "COMPLETED" && j.status !== "CANCELLED").length}
          </div>
          <p className="text-[11px] text-slate-500">Ready for dispatch</p>
        </div>
      </div>

      {/* Assigned Jobs & Real-Time Action Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Job Requests & Active Work Orders
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept incoming requests, progress travel statuses, or submit itemized quotes
          </p>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => {
              const statusMeta = BookingEngine.getDisplayStatus(job.status);

              return (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        #{job.bookingNumber}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Customer: <strong className="text-slate-900">{job.customer.name}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {job.items[0]?.title || "Service Execution"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(job.scheduledDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.scheduledTimeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.address.street}, {job.address.city}</span>
                      </div>
                    </div>

                    {job.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        Customer Note: &ldquo;{job.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions & Progression Stepper */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Estimated Payout
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {formatCurrency(Math.round(job.finalAmount * 0.85))}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {job.status === "PENDING" || job.status === "CONFIRMED" ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(job.id, "PROFESSIONAL_ACCEPTED")}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
                        >
                          Accept Job Request
                        </button>
                      ) : null}

                      {job.status === "PROFESSIONAL_ACCEPTED" ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(job.id, "ON_THE_WAY")}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
                        >
                          Start Travel (On The Way)
                        </button>
                      ) : null}

                      {job.status === "ON_THE_WAY" ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(job.id, "ARRIVED")}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm"
                        >
                          Mark Arrived at Doorstep
                        </button>
                      ) : null}

                      {job.status === "ARRIVED" ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(job.id, "IN_PROGRESS")}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
                        >
                          Start Service
                        </button>
                      ) : null}

                      {job.status === "IN_PROGRESS" ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBookingForQuote(job);
                              setQuoteModalOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1"
                          >
                            <FilePlus className="w-3.5 h-3.5" />
                            <span>Add Material Quote</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(job.id, "COMPLETED")}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                          >
                            Complete & Sign Off
                          </button>
                        </div>
                      ) : null}

                      {job.status === "COMPLETED" ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Job Completed</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <h3 className="text-base font-bold text-slate-900">No jobs assigned yet</h3>
            <p className="text-xs text-slate-500">
              Keep your status online. New local orders will dispatch to your feed automatically.
            </p>
          </div>
        )}
      </div>

      {/* Quotation Builder Modal */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">
                Itemized Work Quote
              </h3>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Labour Charge (₹)</label>
                <input
                  type="number"
                  value={labourCharge}
                  onChange={(e) => setLabourCharge(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Spare Parts / Materials (₹)</label>
                <input
                  type="number"
                  value={materialCharge}
                  onChange={(e) => setMaterialCharge(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Technician Notes</label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Explain spare part replacements..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total Quote Amount:</span>
                <span className="text-teal-700">
                  {formatCurrency(
                    (parseFloat(labourCharge) || 0) + (parseFloat(materialCharge) || 0)
                  )}
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingQuote}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition-all disabled:opacity-50"
              >
                {submittingQuote ? "Sending Quote..." : "Send Quote to Customer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
