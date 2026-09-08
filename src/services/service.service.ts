import { db } from "@/lib/db";

export class ServiceService {
  static async getAllCategories() {
    return db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });
  }

  static async getCategoryBySlug(slug: string) {
    return db.category.findUnique({
      where: { slug },
      include: {
        services: {
          where: { isActive: true },
          include: {
            variants: true,
          },
        },
      },
    });
  }

  static async getServices(options?: {
    categoryId?: string;
    search?: string;
    isPopular?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const where: any = { isActive: true };

    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options?.isPopular !== undefined) {
      where.isPopular = options.isPopular;
    }

    if (options?.search) {
      const q = options.search.trim();
      const lower = q.toLowerCase();
      const cap = q.charAt(0).toUpperCase() + q.slice(1).toLowerCase();
      const upper = q.toUpperCase();

      where.OR = [
        { name: { contains: q } },
        { name: { contains: lower } },
        { name: { contains: cap } },
        { name: { contains: upper } },
        { shortDescription: { contains: q } },
        { shortDescription: { contains: lower } },
        { shortDescription: { contains: cap } },
        { description: { contains: q } },
        { description: { contains: lower } },
        { category: { name: { contains: q } } },
        { category: { name: { contains: lower } } },
        { category: { name: { contains: cap } } },
        { category: { name: { contains: upper } } },
      ];
    }

    if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
      where.startingPrice = {};
      if (options.minPrice !== undefined) where.startingPrice.gte = options.minPrice;
      if (options.maxPrice !== undefined) where.startingPrice.lte = options.maxPrice;
    }

    return db.service.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy: { isPopular: "desc" },
    });
  }

  static async getServiceBySlug(slug: string) {
    return db.service.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        professionalServices: {
          include: {
            professional: {
              include: {
                user: { select: { name: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });
  }

  static async getServiceById(id: string) {
    return db.service.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });
  }
}
