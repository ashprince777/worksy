import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarCheck,
  FileSpreadsheet,
  Settings,
  History,
  ArrowLeft,
  Briefcase,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?redirect=/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Enterprise Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm">
                A
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">
                  WORKSY OPS
                </span>
                <span className="block text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  Enterprise Admin
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-140px)]">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-400" />
              <span>Cockpit Dashboard</span>
            </Link>

            <Link
              href="/admin/professionals"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>KYC & Professionals</span>
            </Link>

            <Link
              href="/admin/bookings"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Bookings Supervisor</span>
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Customer CRM</span>
            </Link>

            <Link
              href="/admin/services"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span>Services Manager</span>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Categories</span>
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Payments & Ledger</span>
            </Link>

            <Link
              href="/admin/coupons"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-violet-400" />
              <span>Coupons & Deals</span>
            </Link>

            <Link
              href="/admin/support"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Support Desk</span>
            </Link>

            <Link
              href="/admin/warranty"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Warranty Claims</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Platform Settings</span>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              <History className="w-4 h-4 text-rose-400" />
              <span>Immutable Audit Logs</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
