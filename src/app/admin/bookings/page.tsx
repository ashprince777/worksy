import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingEngine } from "@/core/booking-engine";

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, phone: true } },
      professional: {
        include: { user: { select: { name: true, phone: true } } },
      },
      items: { include: { service: true } },
      address: true,
      payments: true,
    },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Operations & Dispatch
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Global Bookings Supervisor
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor real-time status progressions, investigate customer disputes, and manage order assignments.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Service & Customer</th>
                <th className="py-3 px-4">Assigned Partner</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => {
                const statusMeta = BookingEngine.getDisplayStatus(b.status);

                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      #{b.bookingNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {b.items[0]?.title || "Service"}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {b.customer.name} • {b.address.city}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {b.professional ? (
                        <div>
                          <span className="font-bold text-slate-800">
                            {b.professional.user.name}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {b.professional.user.phone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {new Date(b.scheduledDate).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {b.scheduledTimeSlot}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatCurrency(b.finalAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
