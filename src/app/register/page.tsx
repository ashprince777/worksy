"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Briefcase,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { WorksyLogo } from "@/components/layout/WorksyLogo";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<"CUSTOMER" | "PROFESSIONAL">("CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account. Please check your inputs.");
      }

      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <WorksyLogo variant="light" height={42} showLink />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create your Worksy Account
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Join thousands of happy homeowners and verified professionals
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="mb-6 p-1 rounded-2xl bg-slate-100 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              role === "CUSTOMER"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>I want to Book Services</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("PROFESSIONAL")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              role === "PROFESSIONAL"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>I am a Professional</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>
          </div>

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
                placeholder="ramesh@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mobile Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
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
            className={`w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
              role === "PROFESSIONAL"
                ? "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20"
                : "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-teal-600/20"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {role === "PROFESSIONAL" ? "Register as Service Pro" : "Create Customer Account"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
            >
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
