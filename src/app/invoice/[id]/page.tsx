import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, ArrowLeft, ShieldCheck } from "lucide-react";

export default async function InvoicePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const invoice = await db.invoice.findFirst({
    where: {
      OR: [{ id }, { bookingId: id }],
    },
    include: {
      booking: {
        include: {
          customer: { select: { name: true, phone: true, email: true } },
          professional: {
            include: { user: { select: { name: true, phone: true } } },
          },
          address: true,
          items: { include: { service: true } },
          payments: true,
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const booking = invoice.booking;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Navigation & Print Action */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Invoice Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white text-base">
                W
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                WORKSY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Trusted services. Made simple.
            </p>
            <p className="text-[11px] text-slate-500">
              GSTIN: 29AAACW9988Z1ZP • Bangalore Central Hub
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs font-black uppercase text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
              Tax Invoice
            </span>
            <div className="font-mono text-sm font-black text-slate-900 mt-2">
              #{invoice.invoiceNumber}
            </div>
            <div className="text-xs text-slate-500">
              Date: {formatDate(invoice.issuedDate)}
            </div>
          </div>
        </div>

        {/* Bill To & Service Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">
              Billed To (Customer):
            </span>
            <div className="font-bold text-slate-900 text-sm">{booking.customer.name}</div>
            <div className="text-slate-600">{booking.customer.phone}</div>
            <div className="text-slate-600">{booking.address.street}</div>
            <div className="text-slate-600">
              {booking.address.city}, {booking.address.state} - {booking.address.postalCode}
            </div>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">
              Service Execution:
            </span>
            <div className="font-bold text-slate-900">
              Partner: {booking.professional?.user.name || "Worksy Certified Partner"}
            </div>
            <div className="text-slate-600">Booking Ref: #{booking.bookingNumber}</div>
            <div className="text-slate-600">Time: {booking.scheduledTimeSlot}</div>
            <div className="text-emerald-600 font-bold">
              Payment Status: PAID ({booking.payments[0]?.paymentMethod || "UPI"})
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Service Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {booking.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{it.title}</div>
                    <div className="text-slate-400 text-[11px]">
                      Doorstep labor, technical equipment and workmanship
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                    {it.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-700">
                    {formatCurrency(it.unitPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(it.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount:</span>
                <span>- {formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>GST Tax (18%):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(invoice.taxAmount)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Platform Facilitation Fee:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(invoice.platformFee)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="text-teal-700">{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Backed by Worksy 30-365 Days Service Warranty</span>
          </div>
          <span>Computer generated invoice. No signature required.</span>
        </div>
      </div>
    </div>
  );
}
