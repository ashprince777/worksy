import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AdminService } from "@/services/admin.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 403 });
  }

  const metrics = await AdminService.getDashboardMetrics();
  return NextResponse.json(metrics);
}
