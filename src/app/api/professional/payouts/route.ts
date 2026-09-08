import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    let proProfileId = user?.professionalProfileId;

    if (!proProfileId) {
      const demoPro = await db.user.findUnique({
        where: { email: "pro@worksy.com" },
        include: { professionalProfile: true },
      });
      proProfileId = demoPro?.professionalProfile?.id;
    }

    if (!proProfileId) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    const { amount } = await request.json();
    const payoutAmount = parseFloat(amount);

    if (!payoutAmount || payoutAmount <= 0) {
      return NextResponse.json({ error: "Valid payout amount is required" }, { status: 400 });
    }

    const bankAccount = await db.bankAccount.findFirst({
      where: { professionalId: proProfileId, isPrimary: true },
    });

    if (!bankAccount) {
      return NextResponse.json({ error: "No primary bank account found for settlement" }, { status: 400 });
    }

    const payout = await db.payout.create({
      data: {
        professionalId: proProfileId,
        bankAccountId: bankAccount.id,
        amount: payoutAmount,
        status: "PROCESSING",
        transactionRef: `UTR-${Date.now().toString().slice(-8)}`,
      },
    });

    return NextResponse.json(payout, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to request payout" }, { status: 500 });
  }
}
