export default function CancellationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Cancellation & Rescheduling Policy
        </h1>
        <p className="text-xs text-slate-500">Last updated: January 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900">1. Cancellation Timing & Zero-Fee Windows</h2>
        <p>
          You may cancel your booking without any fee or penalty as long as the assigned professional partner has not marked their status as &ldquo;On The Way&rdquo;.
        </p>

        <h2 className="text-base font-bold text-slate-900">2. Free Rescheduling</h2>
        <p>
          Need to change your date or arrival slot? You can reschedule any pending or confirmed booking up to 2 hours before the scheduled time slot at no extra charge.
        </p>

        <h2 className="text-base font-bold text-slate-900">3. Late Cancellations & Visiting Fee</h2>
        <p>
          If a booking is cancelled after the professional partner has arrived at your doorstep, a nominal travel facilitation fee of ₹149 may be deducted to compensate the partner for transit time and fuel.
        </p>
      </div>
    </div>
  );
}
