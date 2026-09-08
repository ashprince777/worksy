import Link from "next/link";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

export default function BlogPage() {
  const articles = [
    {
      id: "ac-maintenance-tips",
      title: "5 Signs Your Split AC Needs Deep Jet Cleaning Before Summer",
      desc: "Learn why foam cleaning your indoor cooling coils increases airflow by 40% and reduces monthly electricity bills.",
      category: "Appliance Care",
      readTime: "4 min read",
    },
    {
      id: "prevent-plumbing-blocks",
      title: "How to Prevent Kitchen Sink Clogs and Drain Odors Naturally",
      desc: "Master plumbers share simple weekly preventative maintenance tips without harsh corrosive drain chemicals.",
      category: "Home Maintenance",
      readTime: "3 min read",
    },
    {
      id: "sofa-cleaning-guide",
      title: "Fabric vs Leather Sofas: How to Clean Stains Without Fading",
      desc: "The dos and don'ts of deep foam shampoo extraction for residential living room upholstery.",
      category: "Deep Cleaning",
      readTime: "5 min read",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
          Worksy Home Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Home Care Tips & Guides
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Expert maintenance advice from certified technicians
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition-all"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {art.category}
              </span>
              <h3 className="font-bold text-base text-slate-900 leading-snug">
                {art.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{art.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{art.readTime}</span>
              </div>
              <Link
                href="/services"
                className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>Read More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
