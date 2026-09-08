"use client";

import { useState } from "react";
import { User, ShieldCheck, Save, CheckCircle2, FileText } from "lucide-react";

interface ProfessionalProfileEditorViewProps {
  profile: any;
}

export function ProfessionalProfileEditorView({
  profile,
}: ProfessionalProfileEditorViewProps) {
  const [bio, setBio] = useState(profile?.bio || "");
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears?.toString() || "8");
  const [hourlyRate, setHourlyRate] = useState(profile?.hourlyRate?.toString() || "349");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/professional/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          experienceYears,
          hourlyRate,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Partner Profile
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Public Profile & KYC Credentials
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-teal-500/20">
            {profile?.user?.name ? profile.user.name[0] : "P"}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profile?.user?.name}</h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                {profile?.verificationStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile?.user?.phone} • {profile?.user?.email}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Years of Professional Experience
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Base Hourly Rate (₹)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Professional Biography & Skill Highlights
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : saved ? "Profile Updated!" : "Save Profile"}</span>
          </button>
        </form>
      </div>

      {/* KYC Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Submitted KYC Identification</h3>

        <div className="divide-y divide-slate-100 text-xs">
          {profile?.documents?.map((doc: any) => (
            <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="font-bold text-slate-900 block">{doc.documentType}</span>
                  <span className="text-slate-400 text-[11px]">{doc.documentNumber}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {doc.verificationStatus}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
