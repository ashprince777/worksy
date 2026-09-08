import { NextResponse } from "next/server";
import { ServiceService } from "@/services/service.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("q") || undefined;
  const isPopular = searchParams.get("isPopular") === "true" ? true : undefined;

  const services = await ServiceService.getServices({
    categoryId,
    search,
    isPopular,
  });

  return NextResponse.json(services);
}
