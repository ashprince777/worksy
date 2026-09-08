import { db } from "@/lib/db";
import { BookingEngine, BookingStatus } from "@/core/booking-engine";

export class ProfessionalService {
  static async getProfessionalDashboardMetrics(professionalId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Jobs count
    const [todayJobs, pendingRequests, upcomingBookings, completedJobs] = await Promise.all([
      db.booking.count({
        where: {
          professionalId,
          scheduledDate: { gte: today },
        },
      }),
      db.booking.count({
        where: {
          professionalId,
          status: "PROFESSIONAL_ASSIGNED",
        },
      }),
      db.booking.count({
        where: {
          professionalId,
          status: { in: ["CONFIRMED", "PROFESSIONAL_ACCEPTED", "ON_THE_WAY", "ARRIVED"] },
        },
      }),
      db.booking.count({
        where: {
          professionalId,
          status: "COMPLETED",
        },
      }),
    ]);

    // Commissions & Earnings
    const commissions = await db.commission.findMany({
      where: { professionalId },
    });

    const lifetimeEarnings = commissions.reduce((sum, c) => sum + c.professionalPayout, 0);
    const totalPlatformCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    const profile = await db.professionalProfile.findUnique({
      where: { id: professionalId },
      include: { user: { select: { name: true, email: true, phone: true, avatarUrl: true } } },
    });

    return {
      profile,
      metrics: {
        todayJobs,
        pendingRequests,
        upcomingBookings,
        completedJobs,
        lifetimeEarnings,
        totalPlatformCommission,
        rating: profile?.rating || 5.0,
        completionRate: profile?.completionRate || 100,
        reviewCount: profile?.reviewCount || 0,
      },
    };
  }

  static async getAssignedJobs(professionalId: string) {
    return db.booking.findMany({
      where: { professionalId },
      orderBy: { scheduledDate: "asc" },
      include: {
        customer: { select: { name: true, phone: true } },
        address: true,
        items: { include: { service: true } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  static async createQuote(data: {
    bookingId: string;
    professionalId: string;
    labourCharge: number;
    materialCharge: number;
    additionalCharge?: number;
    notes?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
  }) {
    const subtotal = data.labourCharge + data.materialCharge + (data.additionalCharge || 0);
    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + tax;

    const quoteCount = await db.quote.count();
    const quoteNumber = `QTE-2026-${(100 + quoteCount + 1).toString()}`;

    const quote = await db.quote.create({
      data: {
        quoteNumber,
        bookingId: data.bookingId,
        professionalId: data.professionalId,
        labourCharge: data.labourCharge,
        materialCharge: data.materialCharge,
        additionalCharge: data.additionalCharge || 0,
        tax,
        totalAmount,
        notes: data.notes,
        status: "SENT",
        items: {
          create: data.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            amount: it.quantity * it.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    // Update booking amount with quote
    await db.booking.update({
      where: { id: data.bookingId },
      data: {
        totalAmount: subtotal,
        taxAmount: tax,
        finalAmount: totalAmount + 49,
      },
    });

    return quote;
  }
}
