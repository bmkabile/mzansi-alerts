export enum AlertType {
  Crime = 'CRIME',
  Pothole = 'POTHOLE',
  Weather = 'WEATHER',
  Traffic = 'TRAFFIC',
  PowerOutage = 'POWER_OUTAGE',
  WaterIssue = 'WATER_ISSUE',
  Other = 'OTHER'
}

export interface Location {
  lat: number;
  lng: number;
}

export interface User {
    name: string;
    avatarUrl?: string;
}

export interface Comment {
    id: string;
    user: User;
    text: string;
    timestamp: string;
}

export interface Alert {
  id: string;
  user: User;
  title: string;
  description: string;
  type: AlertType;
  location: Location;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isResolved?: boolean;
  isPending?: boolean;
}

export interface GeoJSONFeature {
    type: "Feature";
    properties: { [key: string]: any };
    geometry: {
        type: "Polygon";
        coordinates: any[];
    };
}

export interface GeoJSONFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

export interface Hotspot {
  id: string;
  location: Location;
  radius: number; // in meters
  level: 'Provincial' | 'Municipal';
  type: string;
  color: string; // e.g., 'rgba(255, 0, 0, 0.3)'
}

export interface Councilor {
  ward: string;
  name: string;
  party: string;
  imageUrl: string;
  contact: string;
}
