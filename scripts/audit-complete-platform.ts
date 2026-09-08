import { db } from "../src/lib/db";
import { BookingEngine } from "../src/core/booking-engine";
import { PricingEngine } from "../src/core/pricing-engine";
import { MatchingEngine } from "../src/core/matching-engine";

async function runComprehensiveAudit() {
  console.log("=================================================");
  console.log("🔍 WORKSY MASTER SYSTEM AUDIT REPORT");
  console.log("=================================================\n");

  let passes = 0;
  let fails = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passes++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      fails++;
    }
  }

  // ----------------------------------------------------
  // SECTION 1: DATABASE & ENTITIES INTEGRITY
  // ----------------------------------------------------
  console.log("📁 1. DATABASE ENTITY COUNT AUDIT:");
  const categoryCount = await db.category.count();
  assert(categoryCount >= 10, `Categories count: ${categoryCount} (Expected >= 10)`);

  const serviceCount = await db.service.count();
  assert(serviceCount >= 50, `Services count: ${serviceCount} (Expected >= 50)`);

  const customerCount = await db.user.count({ where: { role: "CUSTOMER" } });
  assert(customerCount >= 30, `Customers count: ${customerCount} (Expected >= 30)`);

  const proCount = await db.professionalProfile.count();
  assert(proCount >= 20, `Professional profiles count: ${proCount} (Expected >= 20)`);

  const bookingCount = await db.booking.count();
  assert(bookingCount >= 50, `Total bookings count: ${bookingCount} (Expected >= 50)`);

  const paymentCount = await db.payment.count();
  assert(paymentCount >= 25, `Payments count: ${paymentCount} (Expected >= 25)`);

  const commissionCount = await db.commission.count();
  assert(commissionCount >= 25, `Commissions count: ${commissionCount} (Expected >= 25)`);

  const couponCount = await db.coupon.count();
  assert(couponCount >= 4, `Coupons count: ${couponCount} (Expected >= 4)`);

  const settingCount = await db.settings.count();
  assert(settingCount >= 6, `Settings count: ${settingCount} (Expected >= 6)`);

  const demoCustomer = await db.user.findUnique({ where: { email: "customer@worksy.com" } });
  assert(!!demoCustomer, "Demo account 'customer@worksy.com' exists");

  const demoPro = await db.user.findUnique({ where: { email: "pro@worksy.com" } });
  assert(!!demoPro, "Demo account 'pro@worksy.com' exists");

  const demoAdmin = await db.user.findUnique({ where: { email: "admin@worksy.com" } });
  assert(!!demoAdmin, "Demo account 'admin@worksy.com' exists");

  const demoSuperAdmin = await db.user.findUnique({ where: { email: "superadmin@worksy.com" } });
  assert(!!demoSuperAdmin, "Demo account 'superadmin@worksy.com' exists");

  // ----------------------------------------------------
  // SECTION 2: BOOKING STATE MACHINE AUDIT
  // ----------------------------------------------------
  console.log("\n🔄 2. DETERMINISTIC STATE MACHINE AUDIT:");
  assert(BookingEngine.isValidTransition("DRAFT", "PENDING"), "DRAFT -> PENDING allowed");
  assert(BookingEngine.isValidTransition("PENDING", "CONFIRMED"), "PENDING -> CONFIRMED allowed");
  assert(BookingEngine.isValidTransition("CONFIRMED", "PROFESSIONAL_ASSIGNED"), "CONFIRMED -> PROFESSIONAL_ASSIGNED allowed");
  assert(BookingEngine.isValidTransition("PROFESSIONAL_ACCEPTED", "ON_THE_WAY"), "PROFESSIONAL_ACCEPTED -> ON_THE_WAY allowed");
  assert(BookingEngine.isValidTransition("ON_THE_WAY", "ARRIVED"), "ON_THE_WAY -> ARRIVED allowed");
  assert(BookingEngine.isValidTransition("ARRIVED", "IN_PROGRESS"), "ARRIVED -> IN_PROGRESS allowed");
  assert(BookingEngine.isValidTransition("IN_PROGRESS", "COMPLETED"), "IN_PROGRESS -> COMPLETED allowed");
  assert(!BookingEngine.isValidTransition("DRAFT", "COMPLETED"), "DRAFT -> COMPLETED strictly blocked");
  assert(!BookingEngine.isValidTransition("CANCELLED", "IN_PROGRESS"), "CANCELLED -> IN_PROGRESS strictly blocked");
  assert(BookingEngine.canReview("COMPLETED"), "Reviews allowed exclusively for COMPLETED bookings");
  assert(!BookingEngine.canReview("IN_PROGRESS"), "Reviews blocked for IN_PROGRESS bookings");

  // ----------------------------------------------------
  // SECTION 3: PRICING ENGINE AUDIT
  // ----------------------------------------------------
  console.log("\n💰 3. PRICING & GST RECONCILIATION AUDIT:");
  const testPricing = PricingEngine.calculateTotals([
    { serviceId: "s1", title: "Deep Cleaning", quantity: 1, unitPrice: 1000 },
  ]);

  // Base: 1000, Tax (18% of 1000): 180, PlatformFee: 49, Final: 1000 + 180 + 49 = 1229
  assert(testPricing.subtotal === 1000, `Subtotal calculation: ${testPricing.subtotal} (Expected 1000)`);
  assert(testPricing.tax === 180, `GST 18% calculation: ${testPricing.tax} (Expected 180)`);
  assert(testPricing.platformFee === 49, `Platform fee: ${testPricing.platformFee} (Expected 49)`);
  assert(testPricing.finalTotal === 1229, `Final total: ${testPricing.finalTotal} (Expected 1229)`);
  assert(testPricing.commissionAmount === 150, `15% commission: ${testPricing.commissionAmount} (Expected 150)`);
  assert(testPricing.professionalPayout === 850, `Partner payout: ${testPricing.professionalPayout} (Expected 850)`);

  // Coupon discount cap
  const withCoupon = PricingEngine.calculateTotals(
    [{ serviceId: "s1", title: "Deep Cleaning", quantity: 1, unitPrice: 1000 }],
    {
      code: "TEST50",
      discountType: "PERCENTAGE",
      discountValue: 50,
      maxDiscountAmount: 200,
      minOrderAmount: 500,
    }
  );
  assert(withCoupon.discount === 200, `Percentage coupon capped at maxDiscountAmount: ${withCoupon.discount} (Expected 200)`);

  // ----------------------------------------------------
  // SECTION 4: MATCHING & RANKING ENGINE AUDIT
  // ----------------------------------------------------
  console.log("\n🎯 4. MATCHING ENGINE SCORING AUDIT:");
  const proA = {
    id: "pro-a",
    name: "Pro High Score",
    rating: 4.9,
    reviewCount: 120,
    completionRate: 98,
    experienceYears: 5,
    responseTimeMinutes: 10,
    hourlyRate: 500,
    isOnline: true,
    distanceKm: 2.5,
  };
  const proB = {
    id: "pro-b",
    name: "Pro Low Score",
    rating: 3.5,
    reviewCount: 5,
    completionRate: 70,
    experienceYears: 1,
    responseTimeMinutes: 60,
    hourlyRate: 350,
    isOnline: false,
    distanceKm: 18.0,
  };

  const ranked = MatchingEngine.rankProfessionals([proB, proA]);
  assert(ranked[0].professional.id === "pro-a", "Ranked list correctly places top candidate first");
  assert(ranked[0].score > ranked[1].score, `High-quality pro scores higher (${ranked[0].score.toFixed(1)} vs ${ranked[1].score.toFixed(1)})`);

  // ----------------------------------------------------
  // SECTION 5: SUMMARY
  // ----------------------------------------------------
  console.log("\n=================================================");
  console.log(`AUDIT COMPLETE: ${passes} PASSED, ${fails} FAILED`);
  console.log("=================================================");

  if (fails > 0) {
    process.exit(1);
  }
}

runComprehensiveAudit()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
