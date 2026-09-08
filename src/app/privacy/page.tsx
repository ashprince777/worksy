export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: January 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
        <p>
          Worksy collects information necessary to facilitate local service delivery, including customer contact details (phone, email), service delivery addresses, booking notes, and transaction records. Professional partners provide government identification (Aadhaar, PAN) and banking credentials solely for KYC compliance and direct payout settlement.
        </p>

        <h2 className="text-base font-bold text-slate-900">2. Phone Number Masking & User Privacy</h2>
        <p>
          We protect user privacy by employing masked calling abstractions where available, preventing unnecessary direct exposure of personal phone numbers between customers and technicians.
        </p>

        <h2 className="text-base font-bold text-slate-900">3. Data Security & Storage</h2>
        <p>
          All sensitive partner documents are stored securely with restricted access. Administrative personnel can access KYC documents strictly for compliance review, and every document access is audited.
        </p>
      </div>
    </div>
  );
}
