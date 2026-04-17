interface WardStats {
  ward: string;
  totalIssues: number;
  resolvedIssues: number;
  avgResolutionHours: number;
}

interface EquityScore {
  ward: string;
  score: number; // 0.0 to 1.0
  totalIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
}

/**
 * Calculate 30-day rolling equity score per ward.
 * Higher score = better service equity.
 *
 * Factors:
 * - Resolution rate (weight: 0.5)
 * - Average resolution time vs city average (weight: 0.3)
 * - Issue volume fairness (weight: 0.2)
 */
export function calculateEquityScores(
  wardStats: WardStats[],
  cityAvgResolutionHours: number
): EquityScore[] {
  return wardStats.map((ward) => {
    const resolutionRate =
      ward.totalIssues > 0 ? ward.resolvedIssues / ward.totalIssues : 0;

    const timeScore =
      cityAvgResolutionHours > 0
        ? Math.max(0, 1 - ward.avgResolutionHours / (cityAvgResolutionHours * 2))
        : 0.5;

    const avgIssues =
      wardStats.reduce((sum, w) => sum + w.totalIssues, 0) / wardStats.length;
    const volumeFairness =
      avgIssues > 0
        ? Math.max(0, 1 - Math.abs(ward.totalIssues - avgIssues) / avgIssues)
        : 0.5;

    const score =
      resolutionRate * 0.5 + timeScore * 0.3 + volumeFairness * 0.2;

    return {
      ward: ward.ward,
      score: Math.min(1, Math.max(0, score)),
      totalIssues: ward.totalIssues,
      resolvedIssues: ward.resolvedIssues,
      resolutionRate,
    };
  });
}
