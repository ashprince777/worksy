import { PrismaClient } from "@prisma/client";
import { PricingEngine, LineItem, CouponDiscountRule } from "../src/core/pricing-engine";
import { BookingEngine, BookingStatus } from "../src/core/booking-engine";
import { MatchingEngine, CandidateProfessional } from "../src/core/matching-engine";
import assert from "assert";

const db = new PrismaClient();

async function runTests() {
  console.log("🚀 Starting Worksy Automated Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ✗ ${name}:`, e.message);
      failed++;
    }
  }

  async function testAsync(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ✗ ${name}:`, e.message);
      failed++;
    }
  }

  // ----------------------------------------------------
  // 1. Database Integrity Tests
  // ----------------------------------------------------
  console.log("📦 1. Database & Seed Verification:");

  await testAsync("Database contains 10 categories", async () => {
    const count = await db.category.count();
    assert.strictEqual(count, 10, `Expected 10 categories, found ${count}`);
  });

  await testAsync("Database contains 50 services", async () => {
    const count = await db.service.count();
    assert.strictEqual(count, 50, `Expected 50 services, found ${count}`);
  });

  await testAsync("Database contains at least 20 professional profiles", async () => {
    const count = await db.professionalProfile.count();
    assert.ok(count >= 20, `Expected >= 20 professionals, found ${count}`);
  });

  await testAsync("Database contains at least 30 customers", async () => {
    const count = await db.user.count({ where: { role: "CUSTOMER" } });
    assert.ok(count >= 30, `Expected >= 30 customers, found ${count}`);
  });

  await testAsync("Database contains at least 50 bookings across statuses", async () => {
    const count = await db.booking.count();
    assert.ok(count >= 50, `Expected >= 50 bookings, found ${count}`);
  });

  await testAsync("Database contains active coupons", async () => {
    const count = await db.coupon.count({ where: { isActive: true } });
    assert.ok(count >= 4, `Expected >= 4 active coupons, found ${count}`);
  });

  // ----------------------------------------------------
  // 2. Pricing Engine Unit Tests
  // ----------------------------------------------------
  console.log("\n💰 2. Pricing & Commission Engine Tests:");

  test("Calculates standard totals without coupon", () => {
    const items: LineItem[] = [{ serviceId: "1", title: "AC Service", unitPrice: 1000, quantity: 1 }];
    const res = PricingEngine.calculateTotals(items);

    assert.strictEqual(res.subtotal, 1000);
    assert.strictEqual(res.discount, 0);
    assert.strictEqual(res.tax, 180); // 18% of 1000
    assert.strictEqual(res.platformFee, 49);
    assert.strictEqual(res.finalTotal, 1229); // 1000 + 180 + 49
    assert.strictEqual(res.commissionAmount, 150); // 15% of 1000
    assert.strictEqual(res.professionalPayout, 850); // 1000 - 150
  });

  test("Applies percentage coupon with maximum discount cap", () => {
    const items: LineItem[] = [{ serviceId: "1", title: "Full Cleaning", unitPrice: 2000, quantity: 1 }];
    const coupon: CouponDiscountRule = {
      code: "WORKSY50",
      discountType: "PERCENTAGE",
      discountValue: 50,
      maxDiscountAmount: 200,
      minOrderAmount: 399,
    };
    const res = PricingEngine.calculateTotals(items, coupon);

    // 50% of 2000 is 1000, but capped at 200
    assert.strictEqual(res.discount, 200);
    assert.strictEqual(res.taxableAmount, 1800);
    assert.strictEqual(res.tax, 324); // 18% of 1800
    assert.strictEqual(res.finalTotal, 1800 + 324 + 49);
  });

  test("Rejects coupon if below minimum order amount", () => {
    const items: LineItem[] = [{ serviceId: "1", title: "Tap Repair", unitPrice: 299, quantity: 1 }];
    const coupon: CouponDiscountRule = {
      code: "MIN500",
      discountType: "FIXED",
      discountValue: 100,
      minOrderAmount: 500,
    };
    const res = PricingEngine.calculateTotals(items, coupon);
    assert.strictEqual(res.discount, 0);
  });

  // ----------------------------------------------------
  // 3. Booking Engine State Machine Tests
  // ----------------------------------------------------
  console.log("\n🔄 3. Booking State Machine Tests:");

  test("Validates proper sequential booking lifecycle", () => {
    assert.ok(BookingEngine.isValidTransition("PENDING", "CONFIRMED"));
    assert.ok(BookingEngine.isValidTransition("CONFIRMED", "PROFESSIONAL_ACCEPTED"));
    assert.ok(BookingEngine.isValidTransition("PROFESSIONAL_ACCEPTED", "ON_THE_WAY"));
    assert.ok(BookingEngine.isValidTransition("ON_THE_WAY", "ARRIVED"));
    assert.ok(BookingEngine.isValidTransition("ARRIVED", "IN_PROGRESS"));
    assert.ok(BookingEngine.isValidTransition("IN_PROGRESS", "COMPLETED"));
  });

  test("Strictly blocks illegal arbitrary status jumps", () => {
    // Cannot jump from DRAFT directly to COMPLETED
    assert.strictEqual(BookingEngine.isValidTransition("DRAFT", "COMPLETED"), false);
    // Cannot jump from PENDING directly to COMPLETED
    assert.strictEqual(BookingEngine.isValidTransition("PENDING", "COMPLETED"), false);
    // Cannot jump from REFUNDED to IN_PROGRESS
    assert.strictEqual(BookingEngine.isValidTransition("REFUNDED", "IN_PROGRESS"), false);
  });

  test("Review permission only allowed for COMPLETED bookings", () => {
    assert.strictEqual(BookingEngine.canReview("IN_PROGRESS"), false);
    assert.strictEqual(BookingEngine.canReview("CANCELLED"), false);
    assert.strictEqual(BookingEngine.canReview("COMPLETED"), true);
  });

  // ----------------------------------------------------
  // 4. Professional Matching Engine Tests
  // ----------------------------------------------------
  console.log("\n🎯 4. Professional Matching & Ranking Tests:");

  test("Ranks candidate professionals by multi-factor score", () => {
    const candidates: CandidateProfessional[] = [
      {
        id: "pro-1",
        name: "Average Pro",
        experienceYears: 2,
        rating: 4.2,
        reviewCount: 15,
        completionRate: 90,
        responseTimeMinutes: 30,
        hourlyRate: 400,
        isOnline: true,
        distanceKm: 8,
      },
      {
        id: "pro-2",
        name: "Star Pro",
        experienceYears: 9,
        rating: 4.96,
        reviewCount: 180,
        completionRate: 99,
        responseTimeMinutes: 8,
        hourlyRate: 350,
        isOnline: true,
        distanceKm: 2.1,
      },
    ];

    const ranked = MatchingEngine.rankProfessionals(candidates);
    assert.strictEqual(ranked[0].professional.id, "pro-2", "Star Pro should rank higher than Average Pro");
    assert.strictEqual(ranked[0].badge, "Top Rated");
    assert.ok(ranked[0].matchReason.includes("4.96★"));
  });

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log(`\n========================================`);
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("Test execution aborted:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
