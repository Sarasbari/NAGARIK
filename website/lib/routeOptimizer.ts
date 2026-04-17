interface Point {
  lat: number;
  lng: number;
  id: string;
}

/**
 * Greedy nearest-neighbor route optimizer.
 * Given a depot and a list of waypoints, returns an ordered route
 * that minimizes total travel distance (approximate).
 */
export function optimizeRoute(depot: Point, waypoints: Point[]): Point[] {
  if (waypoints.length <= 1) return waypoints;

  const visited: Point[] = [];
  const remaining = [...waypoints];
  let current = depot;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    current = remaining[nearestIdx];
    visited.push(current);
    remaining.splice(nearestIdx, 1);
  }

  return visited;
}

/**
 * Haversine distance between two GPS coordinates (in km).
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
