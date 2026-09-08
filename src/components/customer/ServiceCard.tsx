import Link from "next/link";
import { Star, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    startingPrice: number;
    durationMinutes: number;
    warrantyDays: number;
    isPopular?: boolean;
    category?: {
      name: string;
      slug: string;
    };
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
            {service.category?.name || "Service"}
          </span>
          {service.isPopular && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Popular
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 mb-1.5">
          {service.name}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {service.shortDescription}
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{service.durationMinutes} mins</span>
          </div>

          {service.warrantyDays > 0 && (
            <div className="flex items-center gap-1 text-teal-700">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{service.warrantyDays}d warranty</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-amber-600 ml-auto">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-800">4.9</span>
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Actions */}
      <div className="bg-slate-50/80 px-5 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Starts from</span>
          <span className="text-base sm:text-lg font-extrabold text-slate-900">
            {formatCurrency(service.startingPrice)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/services/${service.category?.slug || "general"}/${service.slug}`}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Details
          </Link>
          <Link
            href={`/book/${service.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-2 rounded-xl shadow-sm transition-all hover:scale-102 active:scale-98"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
