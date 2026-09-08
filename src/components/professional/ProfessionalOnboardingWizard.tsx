"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  User,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
} from "lucide-react";

interface ProfessionalOnboardingWizardProps {
  categories: any[];
}

export function ProfessionalOnboardingWizard({
  categories,
}: ProfessionalOnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Basic Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Step 2: Category & Services
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug || "home-maintenance");

  // Step 3: Experience
  const [experienceYears, setExperienceYears] = useState("5");
  const [hourlyRate, setHourlyRate] = useState("399");
  const [bio, setBio] = useState("");

  // Step 4: KYC
  const [documentType, setDocumentType] = useState("AADHAAR");
  const [documentNumber, setDocumentNumber] = useState("");

  // Step 5: Bank Details
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("HDFC Bank");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/professional/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          categorySlug,
          experienceYears,
          hourlyRate,
          bio,
          documentType,
          documentNumber,
          accountHolderName: accountHolderName || name,
          accountNumber,
          ifscCode,
          bankName,
        }),
      });

      if (res.ok) {
        alert("Registration complete! Welcome to Worksy Partner Network.");
        router.push("/professional/dashboard");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to complete onboarding");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Steps Progress */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Partner Registration • Step {step} of 5
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
              Join as a Certified Partner
            </h1>
          </div>
          <span className="text-xs text-slate-400">Takes 2 minutes</span>
        </div>

        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1. Personal & Contact Details
              </h2>
              <p className="text-slate-500">How customers and Worksy can reach you</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="As per your Government ID"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                2. Select Primary Trade Category
              </h2>
              <p className="text-slate-500">Choose the field where you have proven expertise</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((c) => (
                <label
                  key={c.id}
                  onClick={() => setCategorySlug(c.slug)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    categorySlug === c.slug
                      ? "border-teal-600 bg-teal-50 text-teal-900 font-bold"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <span>{c.name}</span>
                  {categorySlug === c.slug && <CheckCircle className="w-4 h-4 text-teal-600" />}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                3. Experience & Base Rate
              </h2>
              <p className="text-slate-500">Showcase your background to clients</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Hourly Rate (₹)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Professional Bio / Summary</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mention certifications, equipment used, and specialties..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                4. KYC Government Identification
              </h2>
              <p className="text-slate-500">Required for background clearance and verified badge</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="AADHAAR">Aadhaar Card (12 Digits)</option>
                <option value="PAN">PAN Card</option>
                <option value="TRADE_LICENSE">Trade / ITI License</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Document Number</label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Enter document identification number"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-1">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <span className="font-bold text-slate-700 block">Uploaded Identification Document</span>
              <span className="text-[11px] text-teal-600 font-semibold">kyc_document_verified.pdf (Attached)</span>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                5. Direct Settlement Bank Account
              </h2>
              <p className="text-slate-500">Where you will receive weekly payouts</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Account Holder Name</label>
              <input
                type="text"
                value={accountHolderName || name}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 501002341234"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Stepper Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && (!name || !phone || !email)) {
                  alert("Please fill in your name, phone, and email.");
                  return;
                }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting Application..." : "Complete Registration"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
