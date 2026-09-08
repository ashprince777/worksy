"use client";

import { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Save,
  CheckCircle2,
  RefreshCw,
  Percent,
  DollarSign,
  Gift,
  Clock,
  Zap,
} from "lucide-react";

interface SettingItem {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  category: string;
}

export function AdminSettingsView({
  initialSettings,
}: {
  initialSettings: SettingItem[];
}) {
  const [settings, setSettings] = useState<SettingItem[]>(initialSettings);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        setSuccessKey(key);
        setTimeout(() => setSuccessKey(null), 3000);
      } else {
        alert("Failed to update setting");
      }
    } catch {
      alert("Error saving setting");
    } finally {
      setSavingKey(null);
    }
  };

  const handleValueChange = (key: string, newVal: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: newVal } : s))
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Category Groups */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Financial & Monetization Parameters
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Define pricing rules, platform commission splits, and tax calculations applied by the Pricing Engine.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {settings
            .filter((s) => s.category === "COMMISSION" || s.category === "TAX")
            .map((s) => (
              <div
                key={s.key}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="max-w-md">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {s.key}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleValueChange(s.key, e.target.value)}
                    className="w-32 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleUpdate(s.key, s.value)}
                    disabled={savingKey === s.key}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    {savingKey === s.key ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : successKey === s.key ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{successKey === s.key ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            Dispatch & Matching Engine Rules
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated partner matching weights, radius constraints, and emergency job surcharges.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {settings
            .filter((s) => s.category === "MATCHING" || s.key.includes("emergency"))
            .map((s) => (
              <div
                key={s.key}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="max-w-md">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {s.key}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleValueChange(s.key, e.target.value)}
                    className="w-32 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleUpdate(s.key, s.value)}
                    disabled={savingKey === s.key}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    {savingKey === s.key ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : successKey === s.key ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{successKey === s.key ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            General Operations, Warranty & Rewards
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Default Worksy guarantee periods, support ticket SLAs, and viral customer referral incentives.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {settings
            .filter(
              (s) =>
                s.category === "GENERAL" && !s.key.includes("emergency")
            )
            .map((s) => (
              <div
                key={s.key}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="max-w-md">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {s.key}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleValueChange(s.key, e.target.value)}
                    className="w-32 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleUpdate(s.key, s.value)}
                    disabled={savingKey === s.key}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    {savingKey === s.key ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : successKey === s.key ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{successKey === s.key ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
