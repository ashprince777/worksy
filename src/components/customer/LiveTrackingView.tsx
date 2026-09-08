"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  FileText,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { BookingEngine } from "@/core/booking-engine";
import { formatCurrency } from "@/lib/utils";

interface LiveTrackingViewProps {
  initialBooking: any;
  currentUserId?: string;
}

export function LiveTrackingView({
  initialBooking,
  currentUserId,
}: LiveTrackingViewProps) {
  const [booking, setBooking] = useState(initialBooking);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    {
      sender: "pro",
      text: "Hello! I have reviewed your booking and will be arriving at the scheduled time.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const pro = booking.professional?.user || {
    name: "Rajesh Kumar",
    phone: "+91 98765 43211",
  };

  const statusMilestones = [
    { key: "CONFIRMED", label: "Booking Confirmed", desc: "Order schedule locked" },
    { key: "PROFESSIONAL_ASSIGNED", label: "Pro Assigned", desc: "Assigned to top rated expert" },
    { key: "ON_THE_WAY", label: "On The Way", desc: "Partner traveling to your address" },
    { key: "ARRIVED", label: "Arrived at Doorstep", desc: "Partner reached your location" },
    { key: "IN_PROGRESS", label: "Service in Progress", desc: "Diagnostic & service ongoing" },
    { key: "COMPLETED", label: "Service Completed", desc: "Verified and signed off" },
  ];

  const currentMilestoneIndex = statusMilestones.findIndex(
    (m) => m.key === booking.status
  );

  const activeIndex = currentMilestoneIndex >= 0 ? currentMilestoneIndex : 2;

  // Realtime simulation helper to advance status
  const handleAdvanceStatus = async () => {
    const nextStatuses = BookingEngine.getNextValidStatuses(booking.status);
    const candidateNext = nextStatuses.find((s) => s !== "CANCELLED" && s !== "DISPUTED");

    if (!candidateNext) {
      alert("Booking has reached terminal status or cannot advance further.");
      return;
    }

    setIsAdvancing(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: candidateNext,
          note: `Advanced to ${candidateNext} via Live Tracking simulation.`,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBooking(updated);
      }
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "customer", text: chatInput },
      { sender: "pro", text: "Got your message, thanks for the update!" },
    ]);
    setChatInput("");
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Live Dispatch Radar
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Live Map & Partner Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stylized Interactive Live Map Simulator */}
          <div className="relative h-72 sm:h-96 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

            {/* Simulated Road Route Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-teal-500/80 stroke-2 stroke-dasharray-[6,6]">
              <path d="M 120 260 Q 220 180 340 190 T 520 120" fill="none" />
            </svg>

            {/* Pro Moving Marker */}
            <div className="absolute top-[180px] left-[320px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-teal-500/30 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-teal-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-black text-sm relative z-10">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-teal-500/40 text-[10px] font-bold text-teal-300 backdrop-blur-sm">
                {pro.name}
              </span>
            </div>

            {/* Customer Location Pin */}
            <div className="absolute top-[120px] left-[520px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/90 text-[10px] font-bold text-slate-200">
                Your Doorstep
              </span>
            </div>

            {/* Floating Live ETA Pill */}
            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-700/80 rounded-2xl p-3.5 backdrop-blur-md text-white shadow-lg flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Estimated Arrival
                </span>
                <span className="text-sm font-black text-teal-400">
                  {booking.status === "COMPLETED"
                    ? "Service Completed"
                    : booking.status === "IN_PROGRESS"
                    ? "Service In Progress"
                    : "14 Minutes • 2.1 km away"}
                </span>
              </div>
            </div>

            {/* Interactive Simulation Button */}
            <div className="absolute bottom-4 right-4">
              <button
                type="button"
                onClick={handleAdvanceStatus}
                disabled={isAdvancing || booking.status === "COMPLETED"}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isAdvancing
                    ? "Simulating..."
                    : booking.status === "COMPLETED"
                    ? "Job Completed"
                    : "Simulate Next Status"}
                </span>
              </button>
            </div>
          </div>

          {/* Assigned Professional Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-teal-500/20">
                {pro.name[0]}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">{pro.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    <span>Verified Expert</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.92</span>
                  </div>
                  <span>•</span>
                  <span>140+ Jobs</span>
                  <span>•</span>
                  <span>8 yrs exp</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`tel:${pro.phone}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call Partner</span>
              </a>

              <button
                type="button"
                onClick={() => setChatOpen(!chatOpen)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{chatOpen ? "Close Chat" : "Live Chat"}</span>
              </button>
            </div>
          </div>

          {/* In-App Chat Panel */}
          {chatOpen && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Direct Chat with {pro.name}</span>
              </h4>

              <div className="h-48 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        m.sender === "customer"
                          ? "bg-teal-600 text-white"
                          : "bg-white text-slate-800 border border-slate-200"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type instructions or gate code..."
                  className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Col: Timeline & Order Receipt */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-900">
              Live Service Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {statusMilestones.map((m, idx) => {
                const isPast = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={m.key} className="relative">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                        isPast
                          ? "bg-teal-600 border-teal-600 text-white"
                          : "bg-white border-slate-300 text-slate-300"
                      }`}
                    >
                      {isPast && <CheckCircle2 className="w-3 h-3" />}
                    </div>

                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent
                            ? "text-teal-700"
                            : isPast
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {m.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Booking Summary</h3>

            <div className="space-y-2.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking ID:</span>
                <span className="font-bold text-slate-900">#{booking.bookingNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">
                  {booking.items[0]?.title}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-bold text-slate-900">
                  {booking.scheduledTimeSlot}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Service Address:</span>
                <span className="font-bold text-slate-900 text-right max-w-[180px] truncate">
                  {booking.address.street}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-teal-700">
                  {formatCurrency(booking.finalAmount)}
                </span>
              </div>
            </div>

            {booking.invoice && (
              <div className="pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="font-semibold text-slate-900">
                      Invoice #{booking.invoice.invoiceNumber}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    PAID
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
