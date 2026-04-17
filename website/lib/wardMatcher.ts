import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';

/**
 * Match GPS coordinates to a municipal ward using GeoJSON boundaries.
 * Uses point-in-polygon ray casting algorithm.
 */
export function matchWard(
  lat: number,
  lng: number,
  wardsGeoJSON: FeatureCollection
): string | null {
  for (const feature of wardsGeoJSON.features) {
    if (isPointInFeature(lat, lng, feature)) {
      return (
        feature.properties?.name ||
        feature.properties?.ward_name ||
        feature.properties?.WARD_NAME ||
        null
      );
    }
  }
  return null;
}

function isPointInFeature(lat: number, lng: number, feature: Feature): boolean {
  const geometry = feature.geometry;

  if (geometry.type === 'Polygon') {
    return isPointInPolygon(lat, lng, (geometry as Polygon).coordinates);
  }

  if (geometry.type === 'MultiPolygon') {
    return (geometry as MultiPolygon).coordinates.some((poly) =>
      isPointInPolygon(lat, lng, poly)
    );
  }

  return false;
}

function isPointInPolygon(
  lat: number,
  lng: number,
  coordinates: number[][][]
): boolean {
  // Use outer ring only (coordinates[0])
  const ring = coordinates[0];
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][1],
      yi = ring[i][0]; // GeoJSON is [lng, lat]
    const xj = ring[j][1],
      yj = ring[j][0];

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
