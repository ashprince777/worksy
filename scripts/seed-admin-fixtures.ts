import { db } from "../src/lib/db";

async function seedAdminFixtures() {
  console.log("Seeding realistic admin operations fixtures...");

  // 1. Get a professional with a bank account or create one
  const pro = await db.professionalProfile.findFirst({
    include: { bankAccounts: true, user: true },
  });

  if (pro) {
    let bank = pro.bankAccounts[0];
    if (!bank) {
      bank = await db.bankAccount.create({
        data: {
          professionalId: pro.id,
          accountHolderName: pro.user.name,
          accountNumber: "918273645012",
          ifscCode: "HDFC0001234",
          bankName: "HDFC Bank",
          isVerified: true,
          isPrimary: true,
        },
      });
    }

    // Create 2 demo payouts
    const existingPayout = await db.payout.findFirst();
    if (!existingPayout) {
      await db.payout.create({
        data: {
          professionalId: pro.id,
          bankAccountId: bank.id,
          amount: 8450.0,
          status: "REQUESTED",
          requestedAt: new Date(),
        },
      });

      await db.payout.create({
        data: {
          professionalId: pro.id,
          bankAccountId: bank.id,
          amount: 14200.0,
          status: "PROCESSED",
          transactionRef: "UTR98765432101",
          requestedAt: new Date(Date.now() - 3 * 86400000),
          processedAt: new Date(Date.now() - 2 * 86400000),
        },
      });
      console.log("✓ Seeded demo payout requests");
    }
  }

  // 2. Warranty Claims: Get a completed booking
  const completedBooking = await db.booking.findFirst({
    where: { status: "COMPLETED" },
    include: { customer: true },
  });

  if (completedBooking) {
    const existingClaim = await db.warrantyClaim.findFirst();
    if (!existingClaim) {
      await db.warrantyClaim.create({
        data: {
          claimNumber: `WAR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          bookingId: completedBooking.id,
          customerId: completedBooking.customerId,
          issueTitle: "AC Water Leakage Post Deep Cleaning",
          issueDescription: "The technician cleaned the indoor evaporator unit 4 days ago, but water started dripping down the wall from the drain pipe yesterday evening.",
          status: "SUBMITTED",
        },
      });
      console.log("✓ Seeded demo warranty claim");
    }
  }

  // 3. Audit Logs: Create initial system configuration audit log
  const existingAudit = await db.auditLog.findFirst();
  if (!existingAudit) {
    await db.auditLog.create({
      data: {
        userEmail: "superadmin@worksy.com",
        userRole: "SUPER_ADMIN",
        action: "INITIALIZE_PLATFORM_V1",
        entity: "System",
        entityId: "worksy-core",
        newValueJson: JSON.stringify({ version: "1.0.0", environment: "production" }),
      },
    });
    console.log("✓ Seeded demo audit log");
  }

  console.log("Admin fixtures successfully populated!");
}

seedAdminFixtures()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
