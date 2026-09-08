import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck,
  Award,
  ChevronRight,
} from "lucide-react";
import { ServiceService } from "@/services/service.service";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";

export default async function ServiceDetailPage(props: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await props.params;
  const service = await ServiceService.getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const includedItems: string[] = service.includedItems
    ? JSON.parse(service.includedItems)
    : [];
  const excludedItems: string[] = service.excludedItems
    ? JSON.parse(service.excludedItems)
    : [];

  // Fetch verified professionals offering this service
  const matchedPros = await db.professionalProfile.findMany({
    where: {
      services: { some: { serviceId: service.id } },
      verificationStatus: "APPROVED",
    },
    include: {
      user: { select: { name: true, avatarUrl: true } },
    },
    take: 3,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-teal-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/services" className="hover:text-teal-600 transition-colors">
          Services
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          href={`/services?category=${service.category.slug}`}
          className="hover:text-teal-600 transition-colors"
        >
          {service.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">
          {service.name}
        </span>
      </nav>

      {/* Main Hero & Pricing Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Details & Scope */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
              {service.category.name}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {service.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.92</span>
                <span className="font-normal text-slate-400">(140+ reviews)</span>
              </div>

              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{service.durationMinutes} mins service</span>
              </div>

              {service.warrantyDays > 0 && (
                <div className="flex items-center gap-1 text-teal-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>{service.warrantyDays} Days Worksy Warranty</span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              {service.description}
            </p>
          </div>

          {/* Included vs Excluded Scope Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Service Scope & Standards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What is Included */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>What is Included</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  {includedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What is Excluded */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>What is Excluded</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  {excludedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Available Packages / Variants */}
          {service.variants.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Available Service Packages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.variants.map((v) => (
                  <div
                    key={v.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900">{v.name}</h3>
                        {v.isDefault && (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {v.description || "Standard comprehensive care protocol."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-extrabold text-slate-900">
                        {formatCurrency(v.price)}
                      </span>
                      <Link
                        href={`/book/${service.id}?variantId=${v.id}`}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800"
                      >
                        Select & Book →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Matched Pros Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Verified Professionals in Your Area</span>
              </h3>
              <span className="text-xs text-slate-400">Available Today</span>
            </div>

            <div className="divide-y divide-slate-100">
              {matchedPros.map((pro) => (
                <div key={pro.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {pro.user.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {pro.user.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="text-amber-600 font-semibold">{pro.rating}★</span>
                        <span>•</span>
                        <span>{pro.experienceYears} yrs exp</span>
                        <span>•</span>
                        <span>{pro.reviewCount}+ jobs</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                    Active & Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Card */}
        <div className="lg:sticky lg:top-24 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-lg space-y-6">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">
              Standard Package Starting at
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {formatCurrency(service.startingPrice)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inclusive of standard technician labor and safety inspection.
            </p>
          </div>

          <div className="space-y-3 border-y border-slate-100 py-4 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pricing Model:</span>
              <span className="font-semibold text-slate-900">{service.pricingType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Service Duration:</span>
              <span className="font-semibold text-slate-900">{service.durationMinutes} Minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Service Warranty:</span>
              <span className="font-semibold text-teal-700">{service.warrantyDays} Days Guaranteed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cancellation Policy:</span>
              <span className="font-semibold text-slate-900">Free until partner dispatches</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <Link
              href={`/book/${service.id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg"
            >
              <span>Book This Service</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[11px] text-center text-slate-400">
              ⚡ Instant slot confirmation • Verified background-checked technician
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
