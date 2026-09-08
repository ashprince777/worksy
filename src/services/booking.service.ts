import { db } from "@/lib/db";
import { BookingEngine, BookingStatus } from "@/core/booking-engine";
import { PricingEngine, LineItem } from "@/core/pricing-engine";

export interface CreateBookingDTO {
  customerId: string;
  serviceId: string;
  serviceVariantId?: string;
  addressId: string;
  professionalId?: string | null;
  scheduledDate: string | Date;
  scheduledTimeSlot: string;
  notes?: string;
  couponCode?: string;
  paymentMethod?: string;
}

export class BookingService {
  static async createBooking(dto: CreateBookingDTO) {
    const service = await db.service.findUnique({
      where: { id: dto.serviceId },
      include: { variants: true },
    });

    if (!service) {
      throw new Error("Service not found");
    }

    let unitPrice = service.startingPrice;
    let itemTitle = service.name;

    if (dto.serviceVariantId) {
      const variant = service.variants.find((v) => v.id === dto.serviceVariantId);
      if (variant) {
        unitPrice = variant.price;
        itemTitle = `${service.name} (${variant.name})`;
      }
    }

    const lineItems: LineItem[] = [
      {
        serviceId: service.id,
        title: itemTitle,
        unitPrice,
        quantity: 1,
      },
    ];

    // Check Coupon if provided
    let couponRule = null;
    if (dto.couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive && new Date(coupon.expiryDate) > new Date()) {
        couponRule = {
          code: coupon.code,
          discountType: coupon.discountType as any,
          discountValue: coupon.discountValue,
          maxDiscountAmount: coupon.maxDiscountAmount,
          minOrderAmount: coupon.minOrderAmount,
        };
        // Increment coupon usage
        await db.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const pricing = PricingEngine.calculateTotals(lineItems, couponRule);
    const bookingCount = await db.booking.count();
    const bookingNumber = `WRK-2026-${(1000 + bookingCount + 1).toString()}`;

    const booking = await db.booking.create({
      data: {
        bookingNumber,
        customerId: dto.customerId,
        professionalId: dto.professionalId || null,
        addressId: dto.addressId,
        status: dto.professionalId ? "CONFIRMED" : "PENDING",
        scheduledDate: new Date(dto.scheduledDate),
        scheduledTimeSlot: dto.scheduledTimeSlot,
        notes: dto.notes,
        totalAmount: pricing.subtotal,
        discountAmount: pricing.discount,
        taxAmount: pricing.tax,
        platformFee: pricing.platformFee,
        finalAmount: pricing.finalTotal,
        items: {
          create: [
            {
              serviceId: service.id,
              serviceVariantId: dto.serviceVariantId || null,
              title: itemTitle,
              quantity: 1,
              unitPrice,
              totalPrice: unitPrice,
            },
          ],
        },
        statusHistory: {
          create: [
            {
              status: "PENDING",
              note: "Booking submitted by customer.",
              changedById: dto.customerId,
            },
            ...(dto.professionalId
              ? [
                  {
                    status: "CONFIRMED",
                    note: "Assigned to professional and confirmed.",
                    changedById: dto.customerId,
                  },
                ]
              : []),
          ],
        },
        payments: {
          create: [
            {
              paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
              amount: pricing.finalTotal,
              currency: "INR",
              status: "SUCCESS",
              paymentMethod: dto.paymentMethod || "UPI",
              paidAt: new Date(),
              transactions: {
                create: [
                  {
                    transactionType: "CHARGE",
                    amount: pricing.finalTotal,
                    status: "SUCCESS",
                  },
                ],
              },
            },
          ],
        },
        invoice: {
          create: {
            invoiceNumber: `INV-2026-${(1000 + bookingCount + 1).toString()}`,
            subtotal: pricing.subtotal,
            taxAmount: pricing.tax,
            discountAmount: pricing.discount,
            platformFee: pricing.platformFee,
            totalAmount: pricing.finalTotal,
            issuedDate: new Date(),
          },
        },
      },
      include: {
        items: true,
        address: true,
        customer: { select: { id: true, name: true, phone: true, email: true } },
        professional: {
          include: {
            user: { select: { name: true, phone: true, avatarUrl: true } },
          },
        },
        payments: true,
        invoice: true,
      },
    });

    // Credit reward points for booking
    await db.reward.upsert({
      where: { userId: dto.customerId },
      update: {
        pointsBalance: { increment: 25 },
        lifetimeEarned: { increment: 25 },
        transactions: {
          create: {
            points: 25,
            type: "EARNED",
            referenceId: booking.id,
            description: `Earned for booking #${booking.bookingNumber}`,
          },
        },
      },
      create: {
        userId: dto.customerId,
        pointsBalance: 25,
        lifetimeEarned: 25,
        referralCode: `WRK-${dto.customerId.slice(-4).toUpperCase()}`,
        transactions: {
          create: {
            points: 25,
            type: "EARNED",
            referenceId: booking.id,
            description: `Earned for booking #${booking.bookingNumber}`,
          },
        },
      },
    });

    return booking;
  }

  static async updateStatus(
    bookingId: string,
    newStatus: BookingStatus,
    changedById?: string,
    note?: string
  ) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const currentStatus = booking.status as BookingStatus;

    if (!BookingEngine.isValidTransition(currentStatus, newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    const updatePayload: any = { status: newStatus };
    if (newStatus === "COMPLETED") {
      updatePayload.warrantyExpiresAt = new Date(Date.now() + 30 * 86400000);
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        ...updatePayload,
        statusHistory: {
          create: {
            status: newStatus,
            note: note || `Status changed to ${newStatus}`,
            changedById,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: "desc" } },
        items: true,
        address: true,
        professional: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
      },
    });

    return updated;
  }

  static async getBookingById(id: string) {
    return db.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        professional: {
          include: {
            user: { select: { name: true, phone: true, avatarUrl: true } },
          },
        },
        address: true,
        items: { include: { service: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
        payments: { include: { transactions: true } },
        invoice: true,
        quotes: { include: { items: true } },
        review: true,
      },
    });
  }

  static async getCustomerBookings(customerId: string) {
    return db.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { service: true } },
        professional: {
          include: {
            user: { select: { name: true, phone: true, avatarUrl: true } },
          },
        },
        address: true,
        payments: true,
        invoice: true,
        review: true,
      },
    });
  }
}
