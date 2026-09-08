import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { services: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, slug, description, iconName } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || name,
        iconName: iconName || "Wrench",
      },
    });

    await db.auditLog.create({
      data: {
        userEmail: user.email,
        userRole: "ADMIN",
        action: "CREATE_CATEGORY",
        entity: "Category",
        entityId: category.id,
        newValueJson: JSON.stringify(category),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
