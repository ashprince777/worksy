"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Building2,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";

interface Metrics {
  totalVolume: number;
  totalCommission: number;
  pendingPayoutsAmount: number;
  successfulPaymentsCount: number;
  pendingPayoutsCount: number;
}

interface PaymentRecord {
  id: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  booking: {
    bookingNumber: string;
    customer: { name: string; email: string };
    professional?: { user: { name: string } } | null;
  };
}

interface CommissionRecord {
  id: string;
  bookingId: string;
  ratePercent: number;
  commissionAmount: number;
  professionalPayout: number;
  status: string;
  createdAt: string;
  booking: { bookingNumber: string; totalAmount: number };
  professional: { user: { name: string; email: string } };
}

interface PayoutRecord {
  id: string;
  amount: number;
  status: string;
  requestedAt: string;
  transactionRef?: string | null;
  professional: { user: { name: string; email: string } };
  bankAccount: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export function AdminPaymentsView({
  initialData,
}: {
  initialData: {
    metrics: Metrics;
    payments: PaymentRecord[];
    commissions: CommissionRecord[];
    payouts: PayoutRecord[];
  };
}) {
  const [tab, setTab] = useState<"PAYMENTS" | "COMMISSIONS" | "PAYOUTS">("PAYMENTS");
  const [payments, setPayments] = useState(initialData.payments);
  const [commissions, setCommissions] = useState(initialData.commissions);
  const [payouts, setPayouts] = useState(initialData.payouts);
  const [metrics, setMetrics] = useState(initialData.metrics);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleSettleCommission = async (commId: string) => {
    setActionLoadingId(commId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "COMMISSION",
          id: commId,
          status: "SETTLED",
        }),
      });

      if (res.ok) {
        setCommissions((prev) =>
          prev.map((c) => (c.id === commId ? { ...c, status: "SETTLED" } : c))
        );
      } else {
        alert("Failed to settle commission");
      }
    } catch {
      alert("Error settling commission");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    const ref = prompt("Enter bank transfer / UTR reference number:");
    if (!ref) return;

    setActionLoadingId(payoutId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PAYOUT",
          id: payoutId,
          status: "PROCESSED",
          transactionRef: ref,
        }),
      });

      if (res.ok) {
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId ? { ...p, status: "PROCESSED", transactionRef: ref } : p
          )
        );
      } else {
        alert("Failed to process payout");
      }
    } catch {
      alert("Error processing payout");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Processed Volume (GMV)
            </span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {formatCurrency(metrics.totalVolume)}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
            {metrics.successfulPaymentsCount} successful transactions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Platform Take Rate Revenue
            </span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-600 mt-2">
            {formatCurrency(metrics.totalCommission)}
          </p>
          <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">
            Standard 15% marketplace commission
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Partner Payouts
            </span>
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">
            {formatCurrency(metrics.pendingPayoutsAmount)}
          </p>
          <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">
            {metrics.pendingPayoutsCount} requests queued for RTGS/NEFT
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setTab("PAYMENTS")}
          className={`pb-3 transition-colors ${
            tab === "PAYMENTS"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Customer Transactions ({payments.length})
        </button>
        <button
          onClick={() => setTab("COMMISSIONS")}
          className={`pb-3 transition-colors ${
            tab === "COMMISSIONS"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Platform Commissions ({commissions.length})
        </button>
        <button
          onClick={() => setTab("PAYOUTS")}
          className={`pb-3 transition-colors ${
            tab === "PAYOUTS"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Bank Payout Requests ({payouts.length})
        </button>
      </div>

      {/* Tab 1: Customer Transactions */}
      {tab === "PAYMENTS" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Payment Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {p.booking?.customer?.name || "Customer"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.booking?.customer?.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {p.booking?.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(p.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Commissions */}
      {tab === "COMMISSIONS" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Professional Partner</th>
                  <th className="py-3.5 px-4">Commission %</th>
                  <th className="py-3.5 px-4">Platform Fee</th>
                  <th className="py-3.5 px-4">Partner Payout</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {c.booking.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {c.professional.user.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.professional.user.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-600">
                      {c.ratePercent}%
                    </td>
                    <td className="py-3.5 px-4 font-black text-indigo-600">
                      {formatCurrency(c.commissionAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-600">
                      {formatCurrency(c.professionalPayout)}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.status === "SETTLED" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          SETTLED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.status === "PENDING" && (
                        <button
                          onClick={() => handleSettleCommission(c.id)}
                          disabled={actionLoadingId === c.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors"
                        >
                          {actionLoadingId === c.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Mark Settled"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Partner Payout Requests */}
      {tab === "PAYOUTS" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Professional</th>
                  <th className="py-3.5 px-4">Bank & Account Details</th>
                  <th className="py-3.5 px-4">Payout Amount</th>
                  <th className="py-3.5 px-4">Requested At</th>
                  <th className="py-3.5 px-4">Status & Ref</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No payout requests found in the ledger.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {p.professional.user.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.professional.user.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {p.bankAccount.bankName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          A/C: {p.bankAccount.accountNumber} • IFSC: {p.bankAccount.ifscCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(p.requestedAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.status === "PROCESSED" ? (
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              PROCESSED
                            </span>
                            {p.transactionRef && (
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Ref: {p.transactionRef}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {p.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {p.status !== "PROCESSED" && (
                          <button
                            onClick={() => handleProcessPayout(p.id)}
                            disabled={actionLoadingId === p.id}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors"
                          >
                            {actionLoadingId === p.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "Disburse Payout"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
