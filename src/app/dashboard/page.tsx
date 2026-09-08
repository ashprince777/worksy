import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  HelpCircle,
  Award,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingEngine } from "@/core/booking-engine";
import { redirect } from "next/navigation";

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const targetUser = user;

  const [bookings, reward] = await Promise.all([
    db.booking.findMany({
      where: { customerId: targetUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { service: true } },
        professional: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        address: true,
        invoice: true,
      },
    }),
    db.reward.findUnique({ where: { userId: targetUser.id } }),
  ]);

  const ongoingCount = bookings.filter((b) =>
    ["CONFIRMED", "PROFESSIONAL_ASSIGNED", "PROFESSIONAL_ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"].includes(b.status)
  ).length;

  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome & Stats Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {targetUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your service schedules, live track partners, and redeem rewards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center min-w-[100px]">
            <span className="text-xs text-slate-400 block font-medium">Ongoing</span>
            <span className="text-xl font-black text-teal-400">{ongoingCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center min-w-[100px]">
            <span className="text-xs text-slate-400 block font-medium">Completed</span>
            <span className="text-xl font-black text-white">{completedCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center min-w-[120px]">
            <div className="flex items-center justify-center gap-1 text-xs text-amber-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>Points</span>
            </div>
            <span className="text-xl font-black text-amber-400">
              {reward?.pointsBalance || 350} pts
            </span>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Bookings</h2>
            <p className="text-xs text-slate-500">Track and manage all your home services</p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl border border-teal-200 transition-colors"
          >
            <span>Book New Service</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusMeta = BookingEngine.getDisplayStatus(booking.status);
              const isTrackable = [
                "CONFIRMED",
                "PROFESSIONAL_ASSIGNED",
                "PROFESSIONAL_ACCEPTED",
                "ON_THE_WAY",
                "ARRIVED",
                "IN_PROGRESS",
              ].includes(booking.status);

              return (
                <div
                  key={booking.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-black text-slate-900">
                        #{booking.bookingNumber}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                      {booking.warrantyExpiresAt && (
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          <span>Under Worksy Warranty</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {booking.items[0]?.title || "Doorstep Service"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(booking.scheduledDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.scheduledTimeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.address.city}</span>
                      </div>
                    </div>

                    {booking.professional && (
                      <p className="text-xs text-slate-600">
                        Assigned Partner:{" "}
                        <strong className="text-slate-900">
                          {booking.professional.user.name}
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(booking.finalAmount)}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {isTrackable && (
                        <Link
                          href={`/dashboard/bookings/${booking.id}/track`}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                        >
                          <span>Track Live</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {booking.invoice && (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Invoice {booking.invoice.invoiceNumber}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <h3 className="text-base font-bold text-slate-900">No bookings yet</h3>
            <p className="text-xs text-slate-500">
              You haven&apos;t booked any services yet. Explore our verified catalog.
            </p>
            <Link
              href="/services"
              className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
