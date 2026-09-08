import { db } from "@/lib/db";
import { AdminSupportView } from "@/components/admin/AdminSupportView";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const tickets = await db.supportTicket.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = tickets.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    messages: t.messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Customer Service & Disputes
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Support Desk & Ticket Resolution
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer inquiries, investigate booking complaints, reply directly to clients, and maintain enterprise SLAs.
        </p>
      </div>

      <AdminSupportView initialTickets={formatted as any} />
    </div>
  );
}
