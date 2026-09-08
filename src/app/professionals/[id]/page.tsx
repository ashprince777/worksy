import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Star, ShieldCheck, Clock, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProfessionalProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const pro = await db.professionalProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, phone: true, email: true } },
      services: { include: { service: true } },
      reviews: {
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!pro) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-teal-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            {pro.user.name[0]}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900">{pro.user.name}</h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Verified Partner</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{pro.rating}★</span>
                <span className="text-slate-400 font-normal">({pro.reviews.length} reviews)</span>
              </div>
              <span>•</span>
              <span>{pro.experienceYears} Years Experience</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{pro.completionRate}% Completion</span>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-slate-400 uppercase font-bold block">Base Rate</span>
          <span className="text-2xl font-black text-slate-900">
            {formatCurrency(pro.hourlyRate)}/hr
          </span>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900">About the Professional</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {pro.bio || "Certified technician with verified background checks, specialized tools, and transparent pricing."}
        </p>
      </div>

      {/* Services Offered */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Services Offered by {pro.user.name}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pro.services.map((ps) => (
            <div
              key={ps.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  {ps.service.name}
                </h3>
                <span className="text-xs text-teal-700 font-bold">
                  Starts at {formatCurrency(ps.service.startingPrice)}
                </span>
              </div>

              <Link
                href={`/book/${ps.service.id}`}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Customer Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Verified Customer Reviews ({pro.reviews.length})
        </h2>

        {pro.reviews.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {pro.reviews.map((rev) => (
              <div key={rev.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.customer.name}</span>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      Verified Booking
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rev.overallRating}★</span>
                  </div>
                </div>

                <p className="text-slate-600 italic">&ldquo;{rev.comment}&rdquo;</p>
                <span className="text-[10px] text-slate-400 block">{formatDate(rev.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-2">
            No reviews submitted yet for this professional.
          </p>
        )}
      </div>
    </div>
  );
}
