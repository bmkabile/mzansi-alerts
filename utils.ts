import { Location, GeoJSONFeature, Alert } from './types';

export function haversineDistance(coords1: Location, coords2: Location): number {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  
  return d; // Distance in km
}

/**
 * Determines if a point is inside a polygon using the ray-casting algorithm.
 * @param point The point to check ({ lat, lng }).
 * @param polygon The GeoJSON feature representing the polygon.
 * @returns True if the point is inside the polygon, false otherwise.
 */
export function pointInPolygon(point: Location, polygon: GeoJSONFeature): boolean {
  // This assumes the GeoJSON polygon is not complex (e.g., no holes).
  // It uses the first coordinate array.
  const vs = polygon.geometry.coordinates[0];
  const x = point.lng;
  const y = point.lat;

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

export const timeAgo = (dateString: string, compact: boolean = false): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 10) return "Just now";

    const intervals: { label: string, labelCompact: string, seconds: number }[] = [
        { label: 'year', labelCompact: 'y', seconds: 31536000 },
        { label: 'month', labelCompact: 'mo', seconds: 2592000 },
        { label: 'day', labelCompact: 'd', seconds: 86400 },
        { label: 'hour', labelCompact: 'h', seconds: 3600 },
        { label: 'minute', labelCompact: 'm', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            if (compact) {
                return `${count}${interval.labelCompact} ago`;
            }
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    
    if (compact) return `${seconds}s ago`;

    return Math.floor(seconds) + " seconds ago";
};

// --- Offline Alert Utilities ---

const PENDING_ALERTS_KEY = 'mzansi-pending-alerts';

export const getPendingAlerts = (): Alert[] => {
  const pending = localStorage.getItem(PENDING_ALERTS_KEY);
  return pending ? JSON.parse(pending) : [];
};

export const savePendingAlert = (alert: Alert) => {
  const pending = getPendingAlerts();
  localStorage.setItem(PENDING_ALERTS_KEY, JSON.stringify([...pending, alert]));
};

export const clearPendingAlerts = () => {
  localStorage.removeItem(PENDING_ALERTS_KEY);
};