import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      phone,
      bio,
      experienceYears,
      hourlyRate,
      categorySlug,
      documentType,
      documentNumber,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
    } = await request.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 });
    }

    // Check if email or phone already exists
    const existing = await db.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email or phone already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash("password123", 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "PROFESSIONAL",
        professionalProfile: {
          create: {
            bio: bio || "Certified service professional on Worksy.",
            experienceYears: parseInt(experienceYears) || 3,
            hourlyRate: parseFloat(hourlyRate) || 399,
            verificationStatus: "PENDING_REVIEW",
            documents: {
              create: [
                {
                  documentType: documentType || "AADHAAR",
                  documentNumber: documentNumber || "XXXX-XXXX-1234",
                  documentUrl: "/docs/kyc_uploaded_id.pdf",
                  verificationStatus: "PENDING",
                },
              ],
            },
            bankAccounts: {
              create: [
                {
                  accountHolderName: accountHolderName || name,
                  accountNumber: accountNumber || "987654321000",
                  ifscCode: ifscCode || "HDFC0001234",
                  bankName: bankName || "HDFC Bank",
                  isVerified: true,
                },
              ],
            },
            availabilities: {
              create: [
                { dayOfWeek: 1, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
                { dayOfWeek: 2, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
                { dayOfWeek: 3, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
                { dayOfWeek: 4, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
                { dayOfWeek: 5, startTime: "08:30", endTime: "19:00", isWorkingDay: true },
                { dayOfWeek: 6, startTime: "09:00", endTime: "18:00", isWorkingDay: true },
                { dayOfWeek: 0, startTime: "09:00", endTime: "14:00", isWorkingDay: false },
              ],
            },
          },
        },
      },
      include: {
        professionalProfile: true,
      },
    });

    // Auto assign services matching selected category
    if (categorySlug && user.professionalProfile) {
      const category = await db.category.findUnique({
        where: { slug: categorySlug },
        include: { services: true },
      });

      if (category && category.services.length > 0) {
        for (const s of category.services) {
          await db.professionalService.create({
            data: {
              professionalId: user.professionalProfile.id,
              serviceId: s.id,
              isAvailable: true,
            },
          });
        }
      }
    }

    // Set authenticated session for newly registered partner
    await setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: "PROFESSIONAL",
      professionalProfileId: user.professionalProfile?.id,
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        userRole: "PROFESSIONAL",
        action: "PARTNER_SIGNUP",
        entity: "ProfessionalProfile",
        entityId: user.professionalProfile?.id,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register partner" }, { status: 500 });
  }
}
