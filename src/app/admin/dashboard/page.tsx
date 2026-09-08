import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { AdminService } from "@/services/admin.service";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const metrics = await AdminService.getDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Cockpit Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Enterprise Operations Cockpit
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Platform Overview & Performance
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/professionals"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Review KYC ({metrics.pendingKycCount})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Gross GMV */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Gross GMV (Payments)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(metrics.totalGMV)}
          </div>
          <p className="text-[11px] text-slate-500">Cumulative transaction volume</p>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Worksy Platform Fee</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-700">
            {formatCurrency(metrics.totalPlatformRevenue)}
          </div>
          <p className="text-[11px] text-teal-600 font-semibold">15% commission revenue</p>
        </div>

        {/* Bookings & Completion */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {metrics.bookingCount}
          </div>
          <p className="text-[11px] text-slate-500">
            {metrics.completedJobs} completed ({metrics.completionRate}%)
          </p>
        </div>

        {/* Registered Ecosystem Users */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Ecosystem</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {metrics.customerCount + metrics.professionalCount}
          </div>
          <p className="text-[11px] text-slate-500">
            {metrics.customerCount} Customers • {metrics.professionalCount} Pros
          </p>
        </div>
      </div>

      {/* Operational Queues Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending KYC Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-slate-900">
                Pending KYC Verification
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {metrics.pendingKycCount} Awaiting Review
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Professional documents require identity and police clearance validation before partners can receive customer dispatch requests.
          </p>

          <Link
            href="/admin/professionals"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            <span>Open Partner Verification Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Support & Dispute Resolution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">
                Customer Support & Disputes
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
              {metrics.openTickets} Open Tickets
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Investigate reported delays, billing inquiries, invoice GST downloads, and Worksy warranty rework requests.
          </p>

          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-800"
          >
            <span>Inspect Global Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
