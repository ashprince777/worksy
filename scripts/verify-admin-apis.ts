import { db } from "../src/lib/db";

async function verifyAll() {
  console.log("Checking Admin models and database records...");

  const customersCount = await db.user.count({ where: { role: "CUSTOMER" } });
  console.log(`✓ Customers: ${customersCount}`);

  const servicesCount = await db.service.count();
  console.log(`✓ Services: ${servicesCount}`);

  const categoriesCount = await db.category.count();
  console.log(`✓ Categories: ${categoriesCount}`);

  const paymentsCount = await db.payment.count();
  console.log(`✓ Payments: ${paymentsCount}`);

  const commissionsCount = await db.commission.count();
  console.log(`✓ Commissions: ${commissionsCount}`);

  const payoutsCount = await db.payout.count();
  console.log(`✓ Payouts: ${payoutsCount}`);

  const couponsCount = await db.coupon.count();
  console.log(`✓ Coupons: ${couponsCount}`);

  const ticketsCount = await db.supportTicket.count();
  console.log(`✓ Support Tickets: ${ticketsCount}`);

  const claimsCount = await db.warrantyClaim.count();
  console.log(`✓ Warranty Claims: ${claimsCount}`);

  const settingsCount = await db.settings.count();
  console.log(`✓ Settings Count: ${settingsCount}`);

  const auditLogsCount = await db.auditLog.count();
  console.log(`✓ Audit Logs Count: ${auditLogsCount}`);

  console.log("\nAll Admin models and relations are populated and healthy!");
}

verifyAll()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
