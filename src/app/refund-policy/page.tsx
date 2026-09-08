export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Refund & Cancellation Policy</h1>
        <p className="text-xs text-slate-500">Last updated: January 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900">1. Free Cancellation Window</h2>
        <p>
          Customers can cancel any booking free of charge at any time before the assigned partner begins traveling to the destination (&ldquo;On The Way&rdquo; status).
        </p>

        <h2 className="text-base font-bold text-slate-900">2. Refund Processing</h2>
        <p>
          If an eligible cancellation or dispute occurs after an upfront digital payment, refunds are automatically credited back to the original payment method within 3 to 5 business days.
        </p>

        <h2 className="text-base font-bold text-slate-900">3. Rework Guarantee</h2>
        <p>
          If a customer is unsatisfied with the craftsmanship, Worksy dispatches an independent senior partner for re-inspection within the warranty period before any refund arbitration.
        </p>
      </div>
    </div>
  );
}
