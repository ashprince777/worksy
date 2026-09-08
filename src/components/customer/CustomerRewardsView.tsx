"use client";

import { useState } from "react";
import { Award, Gift, Copy, Check, TrendingUp, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CustomerRewardsViewProps {
  reward: any;
}

export function CustomerRewardsView({ reward }: CustomerRewardsViewProps) {
  const [copied, setCopied] = useState(false);

  const referralCode = reward?.referralCode || "ARUN-WORKSY";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const transactions = reward?.transactions || [];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Loyalty & Referrals
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Worksy Rewards & Points
        </h1>
      </div>

      {/* Hero Points Card */}
      <div className="bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Available Points Balance
            </span>
          </div>
          <div className="text-4xl sm:text-5xl font-black tracking-tight">
            {reward?.pointsBalance || 0}{" "}
            <span className="text-lg font-bold text-amber-200">Points</span>
          </div>
          <p className="text-xs text-amber-100">
            1 Worksy Point = ₹1.00 Discount on any future service booking.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-1 text-xs text-amber-50">
          <div className="flex justify-between gap-4">
            <span>Lifetime Earned:</span>
            <span className="font-bold text-white">{reward?.lifetimeEarned || 0} pts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Lifetime Redeemed:</span>
            <span className="font-bold text-white">{reward?.lifetimeRedeemed || 0} pts</span>
          </div>
        </div>
      </div>

      {/* Refer a Friend Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1 max-w-md">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase">
            <Gift className="w-4 h-4" />
            <span>Refer a Neighbor & Earn</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Give ₹100, Get ₹100
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Share your unique invite code. Your friend gets ₹100 off their first booking, and you receive 100 Worksy points upon job completion!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="font-mono font-black text-sm px-3 text-slate-800">
            {referralCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* Points Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Points History</h3>

        {transactions.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">{tx.description}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(tx.createdAt)}</span>
                </div>

                <span
                  className={`font-black text-sm ${
                    tx.type === "REDEEMED" ? "text-slate-500" : "text-emerald-600"
                  }`}
                >
                  {tx.type === "REDEEMED" ? `-${tx.points}` : `+${tx.points}`} pts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            No points transactions recorded yet. Complete bookings to earn points!
          </p>
        )}
      </div>
    </div>
  );
}
