"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Send,
  RefreshCw,
  X,
  User,
  ShieldCheck,
} from "lucide-react";

interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

interface TicketRecord {
  id: string;
  ticketNumber: string;
  customerId: string;
  bookingId?: string | null;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  customer: { id: string; name: string; email: string; phone: string };
  booking?: { bookingNumber: string; status: string } | null;
  messages: SupportMessage[];
}

export function AdminSupportView({
  initialTickets,
}: {
  initialTickets: TicketRecord[];
}) {
  const [tickets, setTickets] = useState<TicketRecord[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTicket, setActiveTicket] = useState<TicketRecord | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenTicket = (t: TicketRecord) => {
    setActiveTicket(t);
    setNewStatus(t.status);
    setReplyMessage("");
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          status: newStatus,
          replyMessage: replyMessage.trim() || undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets((prev) =>
          prev.map((t) =>
            t.id === updated.id
              ? {
                  ...t,
                  status: updated.status,
                  messages: updated.messages || t.messages,
                }
              : t
          )
        );
        setActiveTicket(null);
      } else {
        alert("Failed to update ticket");
      }
    } catch {
      alert("Error updating ticket");
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
              Total Inquiries
            </span>
            <LifeBuoy className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {tickets.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Open Tickets
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">
            {tickets.filter((t) => t.status === "OPEN").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <AlertCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-600 mt-2">
            {tickets.filter((t) => t.status === "IN_PROGRESS").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resolved & Closed
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search ticket #, subject, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((st) => (
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

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Subject & Issue</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No support tickets match the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.ticketNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.customer.name}</div>
                      <div className="text-[11px] text-slate-500">{t.customer.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {t.description}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.priority === "URGENT"
                            ? "bg-rose-100 text-rose-800"
                            : t.priority === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === "OPEN"
                            ? "bg-blue-100 text-blue-800"
                            : t.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(t.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenTicket(t)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
                      >
                        Reply / Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Reply Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    {activeTicket.ticketNumber}
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {activeTicket.subject}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Raised by {activeTicket.customer.name} ({activeTicket.customer.email})
                </p>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Log */}
            <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                  <span>{activeTicket.customer.name} (Original Request)</span>
                  <span>{formatDate(activeTicket.createdAt)}</span>
                </div>
                <p className="text-slate-800">{activeTicket.description}</p>
              </div>

              {activeTicket.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs ${
                    msg.senderRole === "ADMIN"
                      ? "bg-amber-50/60 border-amber-200 ml-4"
                      : "bg-white border-slate-200 mr-4"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span className={msg.senderRole === "ADMIN" ? "text-amber-800 font-bold" : ""}>
                      {msg.senderRole === "ADMIN" ? "Worksy Support Specialist" : activeTicket.customer.name}
                    </span>
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-slate-800">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSendReply} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Dispatch Official Response to Customer
                </label>
                <textarea
                  rows={3}
                  placeholder="Type official response message to resolve customer dispute..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
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
                  Save & Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
