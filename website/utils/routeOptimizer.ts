/**
 * Route Optimization Utilities
 * - Haversine distance calculation
 * - Nearest-neighbor TSP for route optimization
 * - ETA estimation based on avg city speed
 * - Ward fairness scoring
 */

export interface GeoPoint {
  id: string;
  latitude: number;
  longitude: number;
  city?: string;
  area?: string;
  title?: string;
  category?: string;
  upvotes?: number;
}

// ─── Haversine Distance (km) ────────────────────────────────────────

export function haversineDistance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── Nearest-Neighbor TSP ───────────────────────────────────────────

export interface RouteResult {
  orderedStops: GeoPoint[];
  totalDistanceKm: number;
  estimatedTimeMin: number;
  legs: { from: GeoPoint; to: GeoPoint; distanceKm: number }[];
}

/**
 * Greedy nearest-neighbor route through all points.
 * Starts from `depot` (or first point) and visits the nearest unvisited each step.
 */
export function nearestNeighborRoute(
  points: GeoPoint[],
  depot?: { latitude: number; longitude: number }
): RouteResult {
  if (points.length === 0) {
    return { orderedStops: [], totalDistanceKm: 0, estimatedTimeMin: 0, legs: [] };
  }

  const remaining = [...points];
  const ordered: GeoPoint[] = [];
  const legs: RouteResult['legs'] = [];
  let totalDist = 0;

  // Start from depot or first point
  let current: { latitude: number; longitude: number } = depot || remaining[0];

  if (!depot) {
    ordered.push(remaining.shift()!);
    current = ordered[0];
  }

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = haversineDistance(current, remaining[i]);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    const fromPoint = ordered.length > 0 ? ordered[ordered.length - 1] : { id: 'depot', ...current } as GeoPoint;

    legs.push({ from: fromPoint, to: nearest, distanceKm: nearestDist });
    totalDist += nearestDist;
    ordered.push(nearest);
    current = nearest;
  }

  return {
    orderedStops: ordered,
    totalDistanceKm: Math.round(totalDist * 10) / 10,
    estimatedTimeMin: estimateTime(totalDist),
    legs,
  };
}

// ─── Time Estimation ────────────────────────────────────────────────

/** Estimate travel time assuming avg 25 km/h in city + 3 min per stop */
export function estimateTime(distanceKm: number, numStops = 0): number {
  const travelMin = (distanceKm / 25) * 60;
  const stopTime = numStops * 3;
  return Math.round(travelMin + stopTime);
}

// ─── Ward Fairness Score ────────────────────────────────────────────

export interface WardStats {
  ward: string;
  issueCount: number;
  assignedCount: number;
  fairnessScore: number; // 0-100, higher = more fair
}

/**
 * Compute how evenly work is distributed across wards/areas.
 * Returns per-ward stats + overall fairness (100 = perfectly even).
 */
export function wardFairness(issues: GeoPoint[]): {
  wards: WardStats[];
  overallScore: number;
} {
  const wardMap = new Map<string, number>();

  for (const issue of issues) {
    const ward = issue.area || issue.city || 'Unknown';
    wardMap.set(ward, (wardMap.get(ward) || 0) + 1);
  }

  const counts = Array.from(wardMap.values());
  const mean = counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
  const variance = counts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / (counts.length || 1);
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0; // coefficient of variation

  // Convert CV to 0-100 score (lower CV = higher fairness)
  const overallScore = Math.max(0, Math.round((1 - Math.min(cv, 1)) * 100));

  const wards: WardStats[] = Array.from(wardMap.entries()).map(([ward, count]) => ({
    ward,
    issueCount: count,
    assignedCount: count,
    fairnessScore: Math.round(Math.max(0, 100 - Math.abs(count - mean) * 20)),
  }));

  return { wards: wards.sort((a, b) => b.issueCount - a.issueCount), overallScore };
}

// ─── Heat Weight Calculation ────────────────────────────────────────

/**
 * Calculate heatmap intensity weight for a complaint.
 * Combines upvotes + recency (more recent = higher weight).
 */
export function heatWeight(upvotes: number, submittedAt: string): number {
  const daysSince = (Date.now() - new Date(submittedAt).getTime()) / 86400000;
  const recencyFactor = Math.max(0.1, 1 - daysSince / 365); // decay over 1 year
  const upvoteFactor = Math.min(upvotes / 100, 1);
  return Math.max(0.1, (upvoteFactor * 0.6 + recencyFactor * 0.4));
}
