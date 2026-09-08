import { NextResponse } from "next/server";
import { ServiceService } from "@/services/service.service";

export async function GET() {
  const categories = await ServiceService.getAllCategories();
  return NextResponse.json(categories);
}
