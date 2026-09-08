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

  static readonly SYNONYMS: Record<string, string[]> = {
    ac: ["air conditioner", "air conditioning", "aircon", "split ac", "window ac"],
    "a/c": ["ac", "air conditioner", "air conditioning"],
    aircon: ["ac", "air conditioner"],
    "air conditioner": ["ac", "aircon"],
    "air conditioning": ["ac", "aircon"],
    tv: ["television", "smart tv"],
    television: ["tv"],
    pc: ["computer", "desktop"],
    laptop: ["computer", "notebook"],
    fridge: ["refrigerator"],
    refrigerator: ["fridge"],
    ro: ["water purifier", "purifier"],
    "water purifier": ["ro", "purifier"],
    sofa: ["couch", "upholstery"],
    couch: ["sofa"],
    car: ["automobile", "vehicle"],
    bike: ["two-wheeler", "motorcycle", "scooter"],
    "two-wheeler": ["bike", "scooter"],
    plumber: ["plumbing"],
    plumbing: ["plumber"],
    electrician: ["electrical", "electric", "wiring"],
    painter: ["painting"],
    painting: ["painter"],
    carpenter: ["carpentry", "furniture", "door repair"],
    geyser: ["water heater"],
    "water heater": ["geyser"],
    salon: ["parlour", "haircut", "facial", "grooming"],
  };

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

    if (options?.isPopular !== undefined && !options?.search) {
      where.isPopular = options.isPopular;
    }

    if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
      where.startingPrice = {};
      if (options.minPrice !== undefined) where.startingPrice.gte = options.minPrice;
      if (options.maxPrice !== undefined) where.startingPrice.lte = options.maxPrice;
    }

    const services = await db.service.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy: { isPopular: "desc" },
    });

    const rawQuery = options?.search?.trim();
    if (!rawQuery) {
      return services;
    }

    const query = rawQuery.toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordRegex = (term: string) =>
      new RegExp("(^|[^a-z0-9])" + escapeRegex(term) + "([^a-z0-9]|$)", "i");

    // Gather synonyms
    const querySynonyms = ServiceService.SYNONYMS[query] || [];
    const tokenSynonyms = tokens.flatMap((t) => ServiceService.SYNONYMS[t] || []);
    const allAliases = Array.from(new Set([...querySynonyms, ...tokenSynonyms]));

    const isShortQuery = query.length <= 3;

    return services
      .map((s) => {
        let score = 0;
        const name = s.name.toLowerCase();
        const catName = s.category.name.toLowerCase();
        const shortDesc = (s.shortDescription || "").toLowerCase();
        const variantNames = s.variants.map((v) => v.name.toLowerCase()).join(" ");

        // 1. Exact Name match or full query word-boundary
        if (name === query) {
          score += 300;
        } else if (wordRegex(query).test(name)) {
          score += 180;
        } else if (!isShortQuery && name.includes(query)) {
          score += 80;
        }

        // Name starts with query as a distinct word
        const startsWithWord =
          name.startsWith(query) &&
          (name.length === query.length || /[^a-z0-9]/.test(name[query.length]));
        if (startsWithWord) {
          score += 60;
        }

        // 2. Category match
        if (catName === query) {
          score += 100;
        } else if (wordRegex(query).test(catName)) {
          score += 50;
        } else if (!isShortQuery && catName.includes(query)) {
          score += 25;
        }

        // 3. Multi-token evaluation
        if (tokens.length > 1) {
          let matchedCount = 0;
          let missedShortToken = false;

          for (const token of tokens) {
            const isShortToken = token.length <= 3;
            const inName =
              wordRegex(token).test(name) || (!isShortToken && name.includes(token));
            const inCat =
              wordRegex(token).test(catName) || (!isShortToken && catName.includes(token));
            const inDesc =
              wordRegex(token).test(shortDesc) || (!isShortToken && shortDesc.includes(token));

            const syns = ServiceService.SYNONYMS[token] || [];
            const inSyns = syns.some(
              (syn) => wordRegex(syn).test(name) || wordRegex(syn).test(catName)
            );

            if (inName || inSyns) {
              matchedCount++;
              score += 60;
            } else if (inCat) {
              matchedCount++;
              score += 30;
            } else if (inDesc) {
              matchedCount++;
              score += 15;
            } else if (isShortToken) {
              missedShortToken = true;
            }
          }

          // Vital short anchor token (e.g. "ac" in "ac repair") was missed
          if (missedShortToken) {
            score = 0;
          } else if (matchedCount === tokens.length) {
            score += 100; // All tokens matched
          }
        }

        // 4. Variant match
        if (wordRegex(query).test(variantNames)) {
          score += 30;
        }

        // 5. Short Description match
        // For short 1-2 char acronyms (like "ac"), do not match descriptions loosely
        if (query.length > 2) {
          if (wordRegex(query).test(shortDesc)) {
            score += 25;
          } else if (!isShortQuery && shortDesc.includes(query)) {
            score += 10;
          }
        }

        // 6. Synonym expansion matches
        for (const alias of allAliases) {
          const isShortAlias = alias.length <= 3;
          if (wordRegex(alias).test(name)) {
            score += 120;
          } else if (!isShortAlias && name.includes(alias)) {
            score += 60;
          } else if (wordRegex(alias).test(catName)) {
            score += 40;
          } else if (!isShortAlias && wordRegex(alias).test(shortDesc)) {
            score += 20;
          }
        }

        // Popularity slight tie-breaker
        if (score > 0 && s.isPopular) {
          score += 2;
        }

        return { service: s, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.service);
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
