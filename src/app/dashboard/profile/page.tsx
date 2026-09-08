import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CustomerProfileView } from "@/components/customer/CustomerProfileView";

export default async function CustomerProfilePage() {
  const user = await getCurrentUser();
  const userId = user?.id || (await db.user.findUnique({ where: { email: "customer@worksy.com" } }))?.id;

  const [customer, addresses] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: { customerProfile: true },
    }),
    db.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CustomerProfileView customer={customer} initialAddresses={addresses} />
    </div>
  );
}
