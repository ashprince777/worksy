import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin, ArrowRight, ShieldCheck } from "lucide-react";

export default async function LocationsPage() {
  const cities = await db.city.findMany({
    where: { isActive: true },
    include: { zones: true },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
          Metro Service Coverage
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Where Worksy Operates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Serving thousands of households across India&apos;s leading metropolitan hubs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cities.map((city) => (
          <div
            key={city.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-600">
                <MapPin className="w-5 h-5" />
                <span className="font-mono text-xs font-bold bg-teal-50 px-2 py-0.5 rounded">
                  {city.code}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">{city.name}</h3>
                <span className="text-xs text-slate-500">{city.state}, India</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Active Delivery Zones:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {city.zones.map((z) => (
                    <span
                      key={z.id}
                      className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {z.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href={`/services`}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1 transition-colors"
            >
              <span>Explore {city.name} Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
