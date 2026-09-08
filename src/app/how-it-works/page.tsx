import Link from "next/link";
import { CheckCircle2, ShieldCheck, Clock, CreditCard, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
          Seamless Doorstep Experience
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          How Worksy Works
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          From discovery to job completion, here is how Worksy connects you with trusted local experts in four simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center">
            1
          </div>
          <h2 className="text-lg font-bold text-slate-900">Explore & Customize Service</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Browse our verified catalog across 10 service categories. Choose transparent fixed-rate packages or request customized itemized quotes for materials.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
            2
          </div>
          <h2 className="text-lg font-bold text-slate-900">Pick Arrival Window</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose your convenient date and arrival slot. Same-day emergency response or scheduled weekend appointments are confirmed instantly.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center">
            3
          </div>
          <h2 className="text-lg font-bold text-slate-900">Live Partner Dispatch & Tracking</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Track your verified partner on an interactive live map with real-time ETA countdown, masked phone calls, and secure in-app messaging.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center">
            4
          </div>
          <h2 className="text-lg font-bold text-slate-900">Inspect, Pay & Enjoy Warranty</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verify the completed work with your technician. Pay conveniently via UPI or Card, download your tax invoice, and enjoy up to 365 days repair warranty.
          </p>
        </div>
      </div>

      <div className="text-center pt-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md"
        >
          <span>Find Services Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
