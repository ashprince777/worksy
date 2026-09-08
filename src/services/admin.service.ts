import { db } from "@/lib/db";

export class AdminService {
  static async getDashboardMetrics() {
    const [
      customerCount,
      professionalCount,
      bookingCount,
      completedJobs,
      pendingKycCount,
      openTickets,
      payments,
      commissions,
    ] = await Promise.all([
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.user.count({ where: { role: "PROFESSIONAL" } }),
      db.booking.count(),
      db.booking.count({ where: { status: "COMPLETED" } }),
      db.professionalProfile.count({ where: { verificationStatus: "PENDING_REVIEW" } }),
      db.supportTicket.count({ where: { status: "OPEN" } }),
      db.payment.findMany({ where: { status: "SUCCESS" } }),
      db.commission.findMany(),
    ]);

    const totalGMV = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPlatformRevenue = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    return {
      customerCount,
      professionalCount,
      bookingCount,
      completedJobs,
      pendingKycCount,
      openTickets,
      totalGMV,
      totalPlatformRevenue,
      completionRate: bookingCount > 0 ? Math.round((completedJobs / bookingCount) * 100) : 100,
    };
  }

  static async logAdminAction(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
  }) {
    return db.auditLog.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        userRole: "ADMIN",
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValueJson: data.oldValue ? JSON.stringify(data.oldValue) : null,
        newValueJson: data.newValue ? JSON.stringify(data.newValue) : null,
      },
    });
  }

  static async verifyProfessional(professionalId: string, status: "APPROVED" | "REJECTED" | "SUSPENDED", notes?: string, adminEmail?: string) {
    const pro = await db.professionalProfile.findUnique({
      where: { id: professionalId },
    });

    const updated = await db.professionalProfile.update({
      where: { id: professionalId },
      data: {
        verificationStatus: status,
        verificationNotes: notes,
        documents: {
          updateMany: {
            where: { professionalId },
            data: {
              verificationStatus: status === "APPROVED" ? "VERIFIED" : "REJECTED",
              verifiedAt: status === "APPROVED" ? new Date() : null,
            },
          },
        },
      },
    });

    await AdminService.logAdminAction({
      userEmail: adminEmail || "admin@worksy.com",
      action: `KYC_${status}`,
      entity: "ProfessionalProfile",
      entityId: professionalId,
      oldValue: { status: pro?.verificationStatus },
      newValue: { status, notes },
    });

    return updated;
  }
}
