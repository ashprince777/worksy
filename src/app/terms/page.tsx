export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: January 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900">1. Platform Services</h2>
        <p>
          Worksy provides an online marketplace platform connecting customers with independent, verified service professionals. Worksy establishes transparent standard rate cards and facilitates secure payment processing.
        </p>

        <h2 className="text-base font-bold text-slate-900">2. Service Warranty</h2>
        <p>
          Eligible repair services booked through the Worksy platform include a warranty ranging from 30 to 365 days. Warranties cover technical defects arising from the specific repair work executed.
        </p>

        <h2 className="text-base font-bold text-slate-900">3. Partner Conduct</h2>
        <p>
          All partners agree to adhere to Worksy&apos;s code of conduct, punctuality benchmarks, and ethical pricing guidelines. Worksy reserves the right to suspend any partner failing compliance audits.
        </p>
      </div>
    </div>
  );
}
