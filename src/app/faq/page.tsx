import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "How does Worksy verify service professionals?",
      a: "Every partner submits government identity documents (Aadhaar, PAN), residential address verification, trade licenses, and undergoes police background clearance. They also complete practical technical evaluations before joining.",
    },
    {
      q: "What does the Worksy Service Warranty cover?",
      a: "Most repairs include a 30 to 365-day warranty depending on the service category. If the same issue recurs within the warranty window, a technician will re-inspect and fix it at zero additional labor cost.",
    },
    {
      q: "Can I reschedule or cancel my booking?",
      a: "Yes! You can reschedule or cancel for free directly from your dashboard anytime before the professional dispatches for your address.",
    },
    {
      q: "How does quote-based pricing work?",
      a: "For large projects (e.g. modular woodwork, whole-home painting, custom fabrication), our professional conducts an onsite assessment and generates an itemized quote detailing labor and materials. You can approve or decline before work begins.",
    },
    {
      q: "What payment methods are supported?",
      a: "We accept all major UPI apps (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
          Frequently Asked Questions
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Got Questions? We&apos;ve Got Answers.
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
          >
            <h3 className="font-bold text-base text-slate-900 flex items-start gap-2">
              <span className="text-teal-600 font-black">Q:</span>
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-5 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
