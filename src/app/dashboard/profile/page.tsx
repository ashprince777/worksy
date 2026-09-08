import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CustomerProfileView } from "@/components/customer/CustomerProfileView";
import { redirect } from "next/navigation";

export default async function CustomerProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/profile");
  }

  const userId = user.id;

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
