"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  FileText,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BookingEngine } from "@/core/booking-engine";

interface CustomerBookingsViewProps {
  initialBookings: any[];
}

export function CustomerBookingsView({
  initialBookings,
}: CustomerBookingsViewProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [activeTab, setActiveTab] = useState("ALL");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          note: "Cancelled by customer directly from dashboard.",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Cannot cancel booking at this stage");
      }
    } catch {
      alert("Error cancelling booking");
    }
  };

  const handleOpenReviewModal = (booking: any) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForReview.id,
          overallRating: rating,
          comment,
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        alert("Thank you! Your verified review was submitted and +50 reward points credited.");
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBookingForReview.id ? { ...b, review: newReview } : b
          )
        );
        setReviewModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit review");
      }
    } catch {
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "UPCOMING") return b.status === "CONFIRMED" || b.status === "PENDING";
    if (activeTab === "ONGOING") {
      return ["PROFESSIONAL_ASSIGNED", "PROFESSIONAL_ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"].includes(b.status);
    }
    if (activeTab === "COMPLETED") return b.status === "COMPLETED";
    if (activeTab === "CANCELLED") return b.status === "CANCELLED";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Booking History
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            My Service Bookings
          </h1>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
        >
          <span>Book New Service</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200">
        {[
          { id: "ALL", label: `All (${bookings.length})` },
          {
            id: "ONGOING",
            label: `Ongoing (${
              bookings.filter((b) =>
                ["PROFESSIONAL_ASSIGNED", "PROFESSIONAL_ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"].includes(b.status)
              ).length
            })`,
          },
          {
            id: "UPCOMING",
            label: `Upcoming (${
              bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING").length
            })`,
          },
          {
            id: "COMPLETED",
            label: `Completed (${bookings.filter((b) => b.status === "COMPLETED").length})`,
          },
          {
            id: "CANCELLED",
            label: `Cancelled (${bookings.filter((b) => b.status === "CANCELLED").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((b) => {
            const statusMeta = BookingEngine.getDisplayStatus(b.status);
            const isOngoing = [
              "CONFIRMED",
              "PROFESSIONAL_ASSIGNED",
              "PROFESSIONAL_ACCEPTED",
              "ON_THE_WAY",
              "ARRIVED",
              "IN_PROGRESS",
            ].includes(b.status);
            const canCancel = BookingEngine.canCancel(b.status as any);
            const isCompleted = b.status === "COMPLETED";

            return (
              <div
                key={b.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      #{b.bookingNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}
                    >
                      {statusMeta.label}
                    </span>
                    {b.warrantyExpiresAt && (
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-teal-600" />
                        <span>Worksy Warranty Active</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {b.items[0]?.title || "Service Execution"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(b.scheduledDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.scheduledTimeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.address.city}</span>
                    </div>
                  </div>

                  {b.professional && (
                    <p className="text-xs text-slate-600">
                      Partner: <strong className="text-slate-900">{b.professional.user.name}</strong>
                    </p>
                  )}
                </div>

                {/* Pricing & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <span className="text-lg font-black text-slate-900">
                    {formatCurrency(b.finalAmount)}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {isOngoing && (
                      <Link
                        href={`/dashboard/bookings/${b.id}/track`}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        <span>Live Track</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {isCompleted && !b.review && (
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Write Review</span>
                      </button>
                    )}

                    {isCompleted && b.review && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Reviewed ({b.review.overallRating}★)</span>
                      </span>
                    )}

                    {b.invoice && (
                      <Link
                        href={`/invoice/${b.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Invoice</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <h3 className="text-base font-bold text-slate-900">No bookings found in this category</h3>
          <p className="text-xs text-slate-500">
            Switch tabs or explore new services in our catalog.
          </p>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewModalOpen && selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Rate & Review Service
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedBookingForReview.items[0]?.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-2">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-slate-700 ml-2">
                    {rating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Detailed Feedback</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about punctuality, quality, and your overall experience..."
                  required
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold flex items-center gap-2">
                <span>🎁 Earn +50 Worksy reward points for this verified review.</span>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition-all disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Post Verified Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
