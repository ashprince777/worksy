"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in. Please verify your credentials.");
      }

      // Route to requested destination or user's default dashboard
      const targetUrl = redirect !== "/dashboard" ? redirect : data.redirectUrl || "/dashboard";
      router.push(targetUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 items-center justify-center text-white font-black text-2xl shadow-lg shadow-teal-500/30 mb-4">
          W
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome back to Worksy
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          Sign in to access your bookings, service jobs, or manage the platform
        </p>
      </div>

      {/* Quick-fill Test Accounts */}
      <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
          One-Click Test Credentials
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickFill("customer@worksy.com")}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-center group"
          >
            <UserCheck className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform mb-0.5" />
            <span className="text-[10px] font-bold text-slate-700">Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("pro@worksy.com")}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-center group"
          >
            <Briefcase className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform mb-0.5" />
            <span className="text-[10px] font-bold text-slate-700">Pro</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("admin@worksy.com")}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-center group"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform mb-0.5" />
            <span className="text-[10px] font-bold text-slate-700">Admin</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-8 text-center pt-6 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
