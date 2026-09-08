"use client";

import { useState } from "react";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Home,
  Briefcase,
  Shield,
  Phone,
  Mail,
} from "lucide-react";

interface CustomerProfileViewProps {
  customer: any;
  initialAddresses: any[];
}

export function CustomerProfileView({
  customer,
  initialAddresses,
}: CustomerProfileViewProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);

  // Address form fields
  const [label, setLabel] = useState("Home");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          street,
          landmark,
          city,
          state,
          postalCode,
          isDefault,
        }),
      });

      if (res.ok) {
        const newAddr = await res.json();
        setAddresses((prev) =>
          isDefault
            ? [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))]
            : [...prev, newAddr]
        );
        setShowAddForm(false);
        setStreet("");
        setLandmark("");
        setPostalCode("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add address");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "PATCH" });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
      }
    } catch {
      alert("Error setting default address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this saved address?")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      alert("Error deleting address");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
          Account Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Profile & Saved Addresses
        </h1>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-teal-500/20">
            {customer?.name ? customer.name[0] : "U"}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{customer?.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer?.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer?.phone}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 uppercase font-bold block mb-1">
              Emergency Contact
            </span>
            <span className="font-semibold text-slate-800">
              {customer?.customerProfile?.emergencyContact || "+91 98450 11223"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 uppercase font-bold block mb-1">
              Account Status
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Active Verified Customer</span>
            </span>
          </div>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage locations for quick 1-click doorstep service bookings
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Add Address Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddAddress}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs"
          >
            <h3 className="font-bold text-slate-900 text-sm">Add Service Address</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Label</label>
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi NCR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Flat / Building / Street name"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Metro / Mall"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Postal PIN Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 560034"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="defaultAddr"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="defaultAddr" className="text-slate-700 font-semibold cursor-pointer">
                Set as default delivery address
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                {submitting ? "Saving..." : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Addresses List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                addr.isDefault
                  ? "border-teal-600 bg-teal-50/40 shadow-sm"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {addr.label === "Home" ? (
                      <Home className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                    )}
                    <span className="font-bold text-slate-900 text-sm">{addr.label}</span>
                  </div>

                  {addr.isDefault ? (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                      Default
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-teal-700"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 mt-2 leading-relaxed">{addr.street}</p>
                {addr.landmark && (
                  <p className="text-[11px] text-slate-400">Landmark: {addr.landmark}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
