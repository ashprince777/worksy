import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const services = await db.service.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      categoryId,
      name,
      slug,
      shortDescription,
      description,
      startingPrice,
      pricingType,
      durationMinutes,
      warrantyDays,
    } = await request.json();

    if (!categoryId || !name || !slug || !startingPrice) {
      return NextResponse.json({ error: "Category, name, slug, and starting price are required" }, { status: 400 });
    }

    const service = await db.service.create({
      data: {
        categoryId,
        name,
        slug,
        shortDescription: shortDescription || name,
        description: description || name,
        startingPrice: parseFloat(startingPrice),
        pricingType: pricingType || "FIXED",
        durationMinutes: parseInt(durationMinutes) || 60,
        warrantyDays: parseInt(warrantyDays) || 30,
        variants: {
          create: [
            {
              name: "Standard Pack",
              price: parseFloat(startingPrice),
              durationMinutes: parseInt(durationMinutes) || 60,
              isDefault: true,
            },
          ],
        },
      },
    });

    // Log admin action
    await db.auditLog.create({
      data: {
        userEmail: user.email,
        userRole: "ADMIN",
        action: "CREATE_SERVICE",
        entity: "Service",
        entityId: service.id,
        newValueJson: JSON.stringify(service),
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create service" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { serviceId, startingPrice, durationMinutes, warrantyDays, isActive } = await request.json();

    const oldService = await db.service.findUnique({ where: { id: serviceId } });

    const updated = await db.service.update({
      where: { id: serviceId },
      data: {
        startingPrice: startingPrice !== undefined ? parseFloat(startingPrice) : undefined,
        durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes) : undefined,
        warrantyDays: warrantyDays !== undefined ? parseInt(warrantyDays) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userEmail: user.email,
        userRole: "ADMIN",
        action: "UPDATE_SERVICE_PRICE",
        entity: "Service",
        entityId: serviceId,
        oldValueJson: JSON.stringify({ price: oldService?.startingPrice }),
        newValueJson: JSON.stringify({ price: updated.startingPrice }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update service" }, { status: 500 });
  }
}
