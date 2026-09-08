"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  UserCheck,
  Tag,
  CreditCard,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BookingWizardProps {
  service: any;
  defaultVariantId?: string;
  savedAddresses: any[];
  matchedPros: any[];
  customerId: string;
}

export function BookingWizard({
  service,
  defaultVariantId,
  savedAddresses,
  matchedPros,
  customerId,
}: BookingWizardProps) {
  const router = useRouter();

  // Step state (1 to 10)
  const [step, setStep] = useState(1);

  // Form selections
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    defaultVariantId || service.variants?.[0]?.id || null
  );
  // Address state
  const [addressesList, setAddressesList] = useState<any[]>(savedAddresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses[0]?.id || ""
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(
    !savedAddresses || savedAddresses.length === 0
  );
  const [newStreet, setNewStreet] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [newCity, setNewCity] = useState("Bangalore");
  const [newPincode, setNewPincode] = useState("560034");
  const [newLabel, setNewLabel] = useState("Home");
  const [addressError, setAddressError] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Date & Slot
  const todayStr = new Date().toISOString().split("T")[0];
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledSlot, setScheduledSlot] = useState("10:00 AM - 11:30 AM");

  // Notes
  const [notes, setNotes] = useState("");

  // Professional
  const [selectedProId, setSelectedProId] = useState<string | null>(
    matchedPros[0]?.id || null
  );

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Loading & confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Calculations
  const selectedVariant = service.variants?.find((v: any) => v.id === selectedVariantId);
  const basePrice = selectedVariant ? selectedVariant.price : service.startingPrice;

  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.discount;
  }

  const taxable = Math.max(0, basePrice - discount);
  const tax = Math.round(taxable * 0.18);
  const platformFee = 49;
  const finalTotal = taxable + tax + platformFee;

  const handleNextStep = async () => {
    // Step 2 validation & automatic address creation if adding new
    if (step === 2) {
      setAddressError("");
      if (isAddingNewAddress || !selectedAddressId) {
        if (!newStreet.trim() || !newCity.trim() || !newPincode.trim()) {
          setAddressError("Please enter your street address, city, and pincode.");
          return;
        }

        setIsSavingAddress(true);
        try {
          const res = await fetch("/api/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: newLabel,
              street: newStreet.trim(),
              landmark: newLandmark.trim(),
              city: newCity.trim(),
              postalCode: newPincode.trim(),
              isDefault: addressesList.length === 0,
            }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to save address");
          }

          const saved = await res.json();
          setAddressesList((prev) => [...prev, saved]);
          setSelectedAddressId(saved.id);
          setIsAddingNewAddress(false);
          setStep(3);
          return;
        } catch (err: any) {
          setAddressError(err.message || "Failed to save address");
          return;
        } finally {
          setIsSavingAddress(false);
        }
      }
    }

    setStep((s) => s + 1);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: basePrice }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch {
      setCouponError("Could not validate coupon");
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedAddressId) {
      alert("Please select a valid service address before confirming.");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        serviceId: service.id,
        serviceVariantId: selectedVariantId,
        addressId: selectedAddressId,
        professionalId: selectedProId,
        scheduledDate,
        scheduledTimeSlot: scheduledSlot,
        notes,
        couponCode: appliedCoupon?.code,
        paymentMethod,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create booking");
        return;
      }

      const booking = await res.json();
      setCreatedBooking(booking);
      setStep(10); // Move to final confirmation
    } catch (e: any) {
      alert(e.message || "Error submitting booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    "08:30 AM - 10:00 AM",
    "10:00 AM - 11:30 AM",
    "12:00 PM - 01:30 PM",
    "02:30 PM - 04:00 PM",
    "04:30 PM - 06:00 PM",
    "06:30 PM - 08:00 PM",
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Wizard Progress Indicator */}
      <div className="bg-slate-900 text-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
              Step {step} of 10
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
              Book {service.name}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Estimated Total</span>
            <span className="text-lg font-black text-teal-400">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${(step / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Body Steps */}
      <div className="p-6 sm:p-8">
        {/* STEP 1: SELECT PACKAGE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                1. Select Service Package
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose the scope that best fits your requirements
              </p>
            </div>

            <div className="space-y-3">
              {service.variants && service.variants.length > 0 ? (
                service.variants.map((v: any) => (
                  <label
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedVariantId === v.id
                        ? "border-teal-600 bg-teal-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedVariantId === v.id
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedVariantId === v.id && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{v.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{v.description}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-sm sm:text-base">
                      {formatCurrency(v.price)}
                    </span>
                  </label>
                ))
              ) : (
                <div className="p-4 rounded-2xl border border-teal-600 bg-teal-50/50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-teal-600 bg-teal-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{service.name} (Standard)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{service.shortDescription || "Standard service care package"}</p>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 text-sm sm:text-base">
                    {formatCurrency(service.startingPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT ADDRESS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  2. Select Service Address
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Where should our verified professional arrive?
                </p>
              </div>
              {addressesList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  {isAddingNewAddress ? "Use Saved Address" : "+ Add New Address"}
                </button>
              )}
            </div>

            {addressError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {addressError}
              </div>
            )}

            {!isAddingNewAddress && addressesList.length > 0 ? (
              <div className="space-y-3">
                {addressesList.map((addr) => (
                  <label
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setAddressError("");
                    }}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? "border-teal-600 bg-teal-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
                        selectedAddressId === addr.id
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedAddressId === addr.id && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-teal-700 font-semibold">
                            Default Address
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{addr.street}</p>
                      <p className="text-xs text-slate-400">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Enter Service Location Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Street / Flat / Society / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="e.g. Flat 402, Green Glen Layout, Bellandur"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={newLandmark}
                      onChange={(e) => setNewLandmark(e.target.value)}
                      placeholder="e.g. Near EcoSpace Tech Park"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Postal Code (Pincode) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="e.g. 560103"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Bangalore"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Address Label
                    </label>
                    <select
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CHOOSE DATE */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                3. Choose Service Date
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Same-day and next-day slots available
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map((offset) => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const iso = d.toISOString().split("T")[0];
                const dayName = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
                const formatted = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

                return (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => setScheduledDate(iso)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      scheduledDate === iso
                        ? "border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span className="block text-xs uppercase font-semibold text-slate-400">
                      {dayName}
                    </span>
                    <span className="block text-base font-extrabold mt-1">
                      {formatted}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: CHOOSE TIME SLOT */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                4. Select Preferred Arrival Window
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Technician arrives within the chosen window
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setScheduledSlot(slot)}
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    scheduledSlot === slot
                      ? "border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{slot}</span>
                  </div>
                  {scheduledSlot === slot && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: DESCRIBE REQUIREMENT */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                5. Requirement Details & Gate Instructions
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Help the professional arrive prepared
              </p>
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please bring an extended ladder, AC is installed on the 2nd-floor balcony. Call before entering security gate."
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        )}

        {/* STEP 6: CHOOSE PROFESSIONAL */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                6. Choose Your Professional
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Top rated partners matched for your area & service
              </p>
            </div>

            <div className="space-y-3">
              {matchedPros.map((pro, index) => (
                <label
                  key={pro.id}
                  onClick={() => setSelectedProId(pro.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedProId === pro.id
                      ? "border-teal-600 bg-teal-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedProId === pro.id
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedProId === pro.id && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {pro.user.name[0]}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                          {pro.user.name}
                        </h4>
                        {index === 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            Best Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pro.rating}★ rating • {pro.experienceYears} yrs experience • 2.4 km away
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-teal-700 hidden sm:inline">
                    Verified Partner
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: PRICE SUMMARY */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                7. Transparent Price Summary
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Zero hidden charges guaranteed by Worksy
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Item Subtotal ({selectedVariant?.name || "Standard"})</span>
                <span className="font-semibold text-slate-900">{formatCurrency(basePrice)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>GST Tax (18%)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Worksy Platform & Safety Fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(platformFee)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-black text-slate-900">
                <span>Payable Total</span>
                <span className="text-teal-700">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: COUPON */}
        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                8. Apply Coupon & Offers
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Use your promotional promo code
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code e.g. WORKSY50"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm uppercase font-bold focus:outline-none focus:border-teal-600"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Apply
              </button>
            </div>

            {couponError && (
              <p className="text-xs text-rose-600 font-medium">{couponError}</p>
            )}

            {appliedCoupon && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{appliedCoupon.message}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700">Available Promo Codes:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCouponCode("WORKSY50")}
                  className="px-2.5 py-1 rounded bg-teal-100 text-teal-800 font-bold border border-teal-200"
                >
                  WORKSY50 (50% off up to ₹200)
                </button>
                <button
                  type="button"
                  onClick={() => setCouponCode("FIRST100")}
                  className="px-2.5 py-1 rounded bg-teal-100 text-teal-800 font-bold border border-teal-200"
                >
                  FIRST100 (₹100 flat off)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: PAYMENT METHOD */}
        {step === 9 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                9. Select Payment Method
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Payment held securely until service is completed to your satisfaction
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: "UPI", label: "Instant UPI (GPay, PhonePe, Paytm)", badge: "Instant Confirmation" },
                { id: "CARD", label: "Credit / Debit Card (Visa, Mastercard, RuPay)" },
                { id: "NETBANKING", label: "Net Banking (All Indian banks)" },
                { id: "CASH", label: "Cash on Delivery (Pay after service)" },
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? "border-teal-600 bg-teal-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === m.id
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {paymentMethod === m.id && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {m.label}
                    </span>
                  </div>
                  {m.badge && (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                      {m.badge}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 10: CONFIRMATION */}
        {step === 10 && createdBooking && (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
                Booking Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                We have received your booking!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Your booking ID is{" "}
                <strong className="text-slate-900">{createdBooking.bookingNumber}</strong>.
                A confirmation SMS and email have been dispatched.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-bold text-slate-900">{scheduledDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Arrival Slot:</span>
                <span className="font-bold text-slate-900">{scheduledSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-teal-700">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/bookings/${createdBooking.id}/track`)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                Track Partner in Real-Time
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Bottom Wizard Navigation Buttons (Steps 1 to 9) */}
        {step < 10 && (
          <div className="mt-8 pt-4 pb-2 border-t border-slate-200 flex items-center justify-between gap-4 sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-6 px-6 sm:-mx-8 sm:px-8 z-20">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 9 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isSavingAddress}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                <span>{isSavingAddress ? "Saving Address..." : "Continue"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateBooking}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                <span>{isSubmitting ? "Confirming..." : `Pay & Confirm ${formatCurrency(finalTotal)}`}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
