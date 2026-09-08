import Link from "next/link";
import { db } from "@/lib/db";
import { Star, ShieldCheck, Clock, Award, ArrowRight, UserCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function ProfessionalsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const professionals = await db.professionalProfile.findMany({
    where: {
      verificationStatus: "APPROVED",
      ...(q
        ? {
            OR: [
              { user: { name: { contains: q } } },
              { bio: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
      services: { include: { service: true } },
      _count: { select: { reviews: true, assignedJobs: true } },
    },
    orderBy: { rating: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
          Certified Partner Network
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Verified Service Professionals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Meet our 100% background-checked, top-rated local experts
        </p>

        {/* Search input for professionals */}
        <div className="pt-2 max-w-md mx-auto">
          <form method="GET" action="/professionals" className="relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search professional by name or specialty..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="absolute left-3.5 top-3 text-slate-400">🔍</div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((pro) => (
          <div
            key={pro.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-teal-500/20">
                  {pro.user.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{pro.user.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Verified Partner</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {pro.bio || "Certified technician specializing in reliable home repairs."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{pro.rating}★</span>
                  <span className="text-slate-400 font-normal">({pro._count.reviews} reviews)</span>
                </div>
                <span>•</span>
                <span>{pro.experienceYears} yrs exp</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Hourly Rate
                </span>
                <span className="text-base font-black text-slate-900">
                  {formatCurrency(pro.hourlyRate)}/hr
                </span>
              </div>

              <Link
                href={`/professionals/${pro.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
              >
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
