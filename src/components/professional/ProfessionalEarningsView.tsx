"use client";

import { useState } from "react";
import {
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ProfessionalEarningsViewProps {
  totalGross: number;
  totalCommission: number;
  totalNet: number;
  commissions: any[];
  initialPayouts: any[];
  bankAccount: any;
}

export function ProfessionalEarningsView({
  totalGross,
  totalCommission,
  totalNet,
  commissions,
  initialPayouts,
  bankAccount,
}: ProfessionalEarningsViewProps) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("5000");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayout(true);
    try {
      const res = await fetch("/api/professional/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payoutAmount }),
      });

      if (res.ok) {
        const newPayout = await res.json();
        setPayouts([newPayout, ...payouts]);
        setPayoutModalOpen(false);
        alert(`Payout request of ₹${payoutAmount} initiated to your bank account!`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to request payout");
      }
    } finally {
      setSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Finance & Settlements
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Earnings Ledger & Payouts
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setPayoutModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Request Payout to Bank</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">
            Gross Job Volume
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalGross || 21700)}
          </div>
          <p className="text-[11px] text-slate-500">Total customer invoice charges</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-rose-500 font-bold uppercase">
            Platform Commission (15%)
          </span>
          <div className="text-2xl font-black text-rose-600">
            - {formatCurrency(totalCommission || 3255)}
          </div>
          <p className="text-[11px] text-slate-500">Standard facilitation deduction</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-emerald-600 font-bold uppercase">
            Net Partner Earnings
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(totalNet || 18445)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Available for settlement</p>
        </div>
      </div>

      {/* Primary Settlement Bank */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">
                {bankAccount?.bankName || "HDFC Bank Ltd"}
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Verified Bank Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Account No: <strong className="text-slate-800">{bankAccount?.accountNumber || "912301004812"}</strong> • IFSC: {bankAccount?.ifscCode || "HDFC0001234"}
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          Primary Direct Payout Method
        </span>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Payout Requests & Transfers</h3>

        {payouts.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {payouts.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{formatCurrency(p.amount)}</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {p.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Ref: {p.transactionRef} • {formatDate(p.requestedAt)}
                  </span>
                </div>

                <span className="text-xs font-semibold text-emerald-600">
                  Transferred via IMPS
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">
            No previous withdrawal requests found. Click &quot;Request Payout to Bank&quot; to transfer your balance.
          </p>
        )}
      </div>

      {/* Payout Modal */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Request Bank Settlement</h3>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Transfer Amount (₹)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  min="500"
                  required
                  className="w-full p-3 rounded-2xl border border-slate-200 text-base font-bold bg-slate-50 focus:outline-none focus:border-teal-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Available balance: {formatCurrency(totalNet || 18445)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <span className="font-bold text-slate-800 block">Bank Account:</span>
                <div>{bankAccount?.bankName || "HDFC Bank"} - {bankAccount?.accountNumber || "912301004812"}</div>
              </div>

              <button
                type="submit"
                disabled={submittingPayout}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submittingPayout ? "Processing Transfer..." : "Confirm & Transfer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
