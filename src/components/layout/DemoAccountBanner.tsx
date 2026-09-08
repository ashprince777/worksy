"use client";

import { useState, useEffect } from "react";
import { UserCheck, ShieldCheck, Briefcase, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function DemoAccountBanner() {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated) {
        setCurrentRole(data.user.role);
        setUserName(data.user.name);
      } else {
        setCurrentRole(null);
        setUserName(null);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const switchRole = async (role: string, targetUrl: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        await fetchSession();
        router.push(targetUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            DEMO MODE
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Switch test personas instantly:
          </span>
          {userName && (
            <span className="text-teal-400 font-medium">
              Signed in as: {userName} ({currentRole})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => switchRole("CUSTOMER", "/dashboard")}
            disabled={loading}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              currentRole === "CUSTOMER"
                ? "bg-teal-600 text-white font-semibold"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => switchRole("PROFESSIONAL", "/professional/dashboard")}
            disabled={loading}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              currentRole === "PROFESSIONAL"
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>Professional</span>
          </button>

          <button
            onClick={() => switchRole("ADMIN", "/admin/dashboard")}
            disabled={loading}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              currentRole === "ADMIN" || currentRole === "SUPER_ADMIN"
                ? "bg-amber-600 text-white font-semibold"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </button>

          {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400 ml-1" />}
        </div>
      </div>
    </div>
  );
}
