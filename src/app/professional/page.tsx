import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Calendar,
  CreditCard,
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function ProfessionalLandingPage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Join 2,500+ Top Rated Worksy Partners</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Grow your business with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Worksy.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Say goodbye to quiet days and payment chasing. Receive guaranteed daily job requests in your neighborhood with direct-to-bank weekly payouts.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/professional/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg transition-all"
              >
                <span>Go to Partner Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Professionals Choose Worksy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Built for electricians, plumbers, carpenters, technicians, and local service providers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Guaranteed Consistent Jobs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Worksy dispatches real customer bookings directly to your phone. Zero upfront marketing fees or lead-buying costs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Weekly Payouts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track your earnings per job transparently. Payouts transferred directly to your bank account with zero payment delays.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Flexible Working Hours</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You decide when you work. Toggle your availability online/offline or block calendar holidays anytime with one tap.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
