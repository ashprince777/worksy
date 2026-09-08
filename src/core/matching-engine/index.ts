export interface CandidateProfessional {
  id: string;
  name: string;
  avatarUrl?: string | null;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  completionRate: number;
  responseTimeMinutes: number;
  hourlyRate: number;
  isOnline: boolean;
  distanceKm?: number;
  activeJobsCount?: number;
}

export interface MatchScoreResult {
  professional: CandidateProfessional;
  score: number;
  badge: "Best Match" | "Top Rated" | "Fastest Arrival" | "Value Choice";
  matchReason: string;
}

export class MatchingEngine {
  /**
   * Ranks candidates based on multi-factor weighted scoring:
   * - Rating (weight 35%)
   * - Completion rate (weight 20%)
   * - Distance proximity (weight 20%)
   * - Experience years (weight 15%)
   * - Responsiveness (weight 10%)
   * Penalizes offline status or high concurrent active workload.
   */
  static rankProfessionals(
    candidates: CandidateProfessional[],
    preferredDistanceKm = 10
  ): MatchScoreResult[] {
    const scored = candidates.map((pro) => {
      const distance = pro.distanceKm ?? 3.5;
      const ratingNormalized = (pro.rating / 5.0) * 100;
      const completionNormalized = Math.min(100, pro.completionRate);
      const distanceScore = Math.max(0, 100 - (distance / preferredDistanceKm) * 50);
      const experienceScore = Math.min(100, pro.experienceYears * 10);
      const responseScore = Math.max(0, 100 - pro.responseTimeMinutes * 2);

      let totalScore =
        ratingNormalized * 0.35 +
        completionNormalized * 0.2 +
        distanceScore * 0.2 +
        experienceScore * 0.15 +
        responseScore * 0.1;

      if (!pro.isOnline) {
        totalScore *= 0.5; // Penalize offline
      }

      if ((pro.activeJobsCount ?? 0) > 3) {
        totalScore *= 0.8; // Penalize heavy workload
      }

      let badge: MatchScoreResult["badge"] = "Best Match";
      if (pro.rating >= 4.9) badge = "Top Rated";
      else if (distance <= 2.5) badge = "Fastest Arrival";
      else if (pro.hourlyRate <= 349) badge = "Value Choice";

      const matchReason = `${pro.rating}★ rating • ${pro.reviewCount}+ reviews • ${distance.toFixed(1)} km away`;

      return {
        professional: pro,
        score: Math.round(totalScore),
        badge,
        matchReason,
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  }
}
