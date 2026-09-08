"use client";

import { useState } from "react";
import {
  HelpCircle,
  ShieldCheck,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CustomerSupportViewProps {
  initialTickets: any[];
  initialWarrantyClaims: any[];
  completedBookings: any[];
}

export function CustomerSupportView({
  initialTickets,
  initialWarrantyClaims,
  completedBookings,
}: CustomerSupportViewProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [warrantyClaims, setWarrantyClaims] = useState(initialWarrantyClaims);
  const [activeTab, setActiveTab] = useState<"TICKETS" | "WARRANTY">("TICKETS");

  // Ticket Form State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("BILLING");
  const [ticketPriority, setTicketPriority] = useState("MEDIUM");
  const [ticketDesc, setTicketDesc] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Warranty Form State
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyBookingId, setWarrantyBookingId] = useState(completedBookings[0]?.id || "");
  const [warrantyTitle, setWarrantyTitle] = useState("");
  const [warrantyDesc, setWarrantyDesc] = useState("");
  const [submittingWarranty, setSubmittingWarranty] = useState(false);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject,
          description: ticketDesc,
          category: ticketCategory,
          priority: ticketPriority,
        }),
      });

      if (res.ok) {
        const newTicket = await res.json();
        setTickets([newTicket, ...tickets]);
        setShowTicketModal(false);
        setTicketSubject("");
        setTicketDesc("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create ticket");
      }
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleCreateWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWarranty(true);
    try {
      const res = await fetch("/api/warranty/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: warrantyBookingId,
          issueTitle: warrantyTitle,
          issueDescription: warrantyDesc,
        }),
      });

      if (res.ok) {
        const newClaim = await res.json();
        setWarrantyClaims([newClaim, ...warrantyClaims]);
        setShowWarrantyModal(false);
        setWarrantyTitle("");
        setWarrantyDesc("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register warranty claim");
      }
    } finally {
      setSubmittingWarranty(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Resolution Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Support Desk & Warranty Claims
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTicketModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Ticket</span>
          </button>

          {completedBookings.length > 0 && (
            <button
              type="button"
              onClick={() => setShowWarrantyModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Claim Warranty</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("TICKETS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "TICKETS" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Support Tickets ({tickets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("WARRANTY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "WARRANTY" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Warranty Claims ({warrantyClaims.length})
        </button>
      </div>

      {/* Content: Tickets */}
      {activeTab === "TICKETS" && (
        <div className="space-y-4">
          {tickets.length > 0 ? (
            tickets.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      #{t.ticketNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.status === "OPEN"
                          ? "bg-amber-100 text-amber-800"
                          : t.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(t.createdAt)}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{t.subject}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>

                {t.messages && t.messages.length > 1 && (
                  <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
                    <span className="font-bold block text-[11px] text-teal-700">Support Agent Response:</span>
                    <p>{t.messages[t.messages.length - 1].message}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">No support tickets</h3>
              <p className="text-xs text-slate-500">
                Need help with a booking or invoice? Click &quot;Open Ticket&quot; above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content: Warranty Claims */}
      {activeTab === "WARRANTY" && (
        <div className="space-y-4">
          {warrantyClaims.length > 0 ? (
            warrantyClaims.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      #{c.claimNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      {c.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(c.createdAt)}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{c.issueTitle}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{c.issueDescription}</p>

                {c.booking && (
                  <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    Claimed against Booking:{" "}
                    <strong className="text-slate-700">#{c.booking.bookingNumber}</strong>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">No active warranty claims</h3>
              <p className="text-xs text-slate-500">
                All Worksy repairs are backed by our 30-365 days guarantee.
              </p>
            </div>
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Open Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="BILLING">Billing & Payment</option>
                  <option value="QUALITY">Service Quality</option>
                  <option value="DELAY">Arrival Delay</option>
                  <option value="CANCELLATION">Cancellation / Refund</option>
                  <option value="GENERAL">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief summary of your inquiry"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={4}
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Provide all relevant details..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition-all disabled:opacity-50"
              >
                {submittingTicket ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Warranty Claim Modal */}
      {showWarrantyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">File Warranty Claim</h3>
              <button
                type="button"
                onClick={() => setShowWarrantyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarranty} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Completed Booking</label>
                <select
                  value={warrantyBookingId}
                  onChange={(e) => setWarrantyBookingId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {completedBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.bookingNumber} - {b.items[0]?.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Title</label>
                <input
                  type="text"
                  value={warrantyTitle}
                  onChange={(e) => setWarrantyTitle(e.target.value)}
                  placeholder="e.g. AC cooling dropped after 10 days"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Description</label>
                <textarea
                  rows={4}
                  value={warrantyDesc}
                  onChange={(e) => setWarrantyDesc(e.target.value)}
                  placeholder="Describe what occurred since the service completion..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={submittingWarranty}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all disabled:opacity-50"
              >
                {submittingWarranty ? "Registering..." : "Submit Warranty Claim"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
