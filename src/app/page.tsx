import Link from "next/link";
import {
  Wrench,
  Tv,
  Sparkles,
  Scissors,
  HeartPulse,
  Laptop,
  Car,
  PackageCheck,
  Camera,
  Home,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  MapPin,
  Award,
  Zap,
} from "lucide-react";
import { ServiceService } from "@/services/service.service";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { HeroSearchBar } from "@/components/customer/HeroSearchBar";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";

const iconMap: Record<string, any> = {
  Wrench,
  Tv,
  Sparkles,
  Scissors,
  HeartPulse,
  Laptop,
  Car,
  PackageCheck,
  Camera,
  Home,
};

export default async function HomePage() {
  const [categories, popularServices, topReviews, prosCount] = await Promise.all([
    ServiceService.getAllCategories(),
    ServiceService.getServices({ isPopular: true }),
    db.review.findMany({
      take: 4,
      where: { isPublic: true },
      include: {
        customer: { select: { name: true } },
        professional: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    }),
    db.professionalProfile.count({ where: { verificationStatus: "APPROVED" } }),
  ]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 sm:pt-20 pb-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-teal-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Over {prosCount}+ Verified Service Professionals Onboard</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Trusted professionals. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400">
                Services at your doorstep.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Book reliable local experts for your home, health, personal, and everyday needs.
              Fixed rates, verified partners, and comprehensive Worksy warranty.
            </p>

            {/* Smart Search Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <HeroSearchBar />
            </div>

            {/* Popular Quick Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-500">Popular:</span>
              <Link href="/services?q=AC" className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">
                AC Jet Cleaning
              </Link>
              <Link href="/services?q=Electrician" className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">
                Electrician
              </Link>
              <Link href="/services?q=Cleaning" className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">
                Deep Cleaning
              </Link>
              <Link href="/services?q=Physiotherapy" className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">
                Physiotherapy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Browse by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select from our 10 verified service departments
            </p>
          </div>
          <Link
            href="/services"
            className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.iconName || "Wrench"] || Wrench;
            return (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center justify-center">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {cat._count.services} services
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 mb-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Most Booked
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Popular Doorstep Services
            </h2>
          </div>
          <Link
            href="/services"
            className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>Explore 50+ Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.slice(0, 6).map((service) => (
            <ServiceCard key={service.id} service={service as any} />
          ))}
        </div>
      </section>

      {/* 4. HOW WORKSY WORKS */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How Worksy Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Book any local service in under two minutes with complete transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-teal-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Choose Service & Time Slot
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your service, choose an upfront package or quote, pick your convenient date, and set your address.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Verified Pro Arrives
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A background-checked professional arrives on time with genuine tools and high-grade materials.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Seamless Payment & Warranty
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pay securely via UPI or Card only after job completion. Enjoy Worksy&apos;s 30-365 days repair warranty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY WORKSY TRUST PROMISE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
              The Worksy Standard
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              We vet every professional so you never have to worry.
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike unverified directory listings, every partner on Worksy undergoes a 5-step verification process before taking a single job.
            </p>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Strict KYC & Police Verification:</strong>
                  {" "}Govt ID, permanent address, and criminal record clearance.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Standardized Fair Pricing:</strong>
                  {" "}No surprise haggling at your door. Fixed rate cards and itemized quotes.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Worksy Damage Protection & Warranty:</strong>
                  {" "}Up to ₹10,000 damage coverage and hassle-free rework guarantee.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-8 rounded-3xl text-white space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
              <ShieldCheck className="w-8 h-8 text-teal-400" />
              <div>
                <h3 className="font-bold text-base">Worksy Trust Shield</h3>
                <p className="text-xs text-slate-400">Guaranteed service quality</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-2xl font-black text-teal-400">4.92★</span>
                <p className="text-xs text-slate-300 mt-1">Average Partner Rating</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-2xl font-black text-teal-400">98.6%</span>
                <p className="text-xs text-slate-300 mt-1">On-Time Arrival Rate</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-2xl font-black text-teal-400">30-365d</span>
                <p className="text-xs text-slate-300 mt-1">Service Warranty</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-2xl font-black text-teal-400">0% Cash Hassle</span>
                <p className="text-xs text-slate-300 mt-1">Direct UPI & Card Payouts</p>
              </div>
            </div>

            <Link
              href="/services"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all"
            >
              <span>Explore Verified Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Loved by Thousands of Homeowners
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real feedback from verified completed Worksy bookings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    {rev.customer.name}
                  </span>
                  <span className="text-[11px] text-teal-700">Verified Customer</span>
                </div>
                <span className="text-[10px] text-slate-400">Bangalore</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BECOME A PROFESSIONAL PARTNER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-md border border-indigo-500/30">
              For Skilled Professionals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Grow your local business with Worksy.
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Join our network of elite service experts. Get consistent daily bookings, guaranteed timely payouts, and complete control over your working hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/professional"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all shrink-0"
            >
              <span>Join as Partner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/professional/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all shrink-0"
            >
              <span>Partner Login</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
