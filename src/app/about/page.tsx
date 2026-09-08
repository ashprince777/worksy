import Link from "next/link";
import { ShieldCheck, Award, Users, HeartHandshake, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
          Our Story
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          About Worksy
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          We founded Worksy with a simple conviction: booking reliable home services shouldn&apos;t be a stressful game of phone calls and price haggling.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Trusted services. Made simple.
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Worksy is an Indian multi-service local services marketplace bridging the gap between quality-conscious urban households and verified, skilled service professionals. We operate in Bangalore, Mumbai, and Delhi NCR, setting new benchmarks in punctuality, transparent pricing, and post-service warranty.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Every technician on Worksy undergoes criminal background verification, technical aptitude screening, and customer service training before stepping into your home.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
          <span className="text-3xl font-black text-teal-600">2,500+</span>
          <h3 className="font-bold text-sm text-slate-900">Certified Partners</h3>
          <p className="text-xs text-slate-500">Rigorous 5-step background vetting</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
          <span className="text-3xl font-black text-indigo-600">50,000+</span>
          <h3 className="font-bold text-sm text-slate-900">Homes Served</h3>
          <p className="text-xs text-slate-500">Across Bangalore, Mumbai & Delhi</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
          <span className="text-3xl font-black text-amber-500">4.92★</span>
          <h3 className="font-bold text-sm text-slate-900">Average Rating</h3>
          <p className="text-xs text-slate-500">Consistently verified by customers</p>
        </div>
      </div>
    </div>
  );
}
