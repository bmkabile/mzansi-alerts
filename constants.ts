import { AlertType, Alert, GeoJSONFeatureCollection, Hotspot, Councilor } from './types';
import { MapPinIcon, ShieldAlertIcon, CarCrashIcon, CloudRainIcon, ZapOffIcon, WrenchIcon, AlertCircleIcon } from './components/Icons';

export const ALERT_TYPE_DETAILS = {
  [AlertType.Crime]: { label: 'Crime', icon: ShieldAlertIcon, color: 'alert-crime' },
  [AlertType.Pothole]: { label: 'Pothole', icon: CarCrashIcon, color: 'alert-pothole' },
  [AlertType.Weather]: { label: 'Weather', icon: CloudRainIcon, color: 'alert-weather' },
  [AlertType.Traffic]: { label: 'Traffic', icon: CarCrashIcon, color: 'alert-traffic' },
  [AlertType.PowerOutage]: { label: 'Power Outage', icon: ZapOffIcon, color: 'alert-power' },
  [AlertType.WaterIssue]: { label: 'Water Issue', icon: WrenchIcon, color: 'alert-water' },
  [AlertType.Other]: { label: 'Other', icon: AlertCircleIcon, color: 'alert-other' },
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    user: { name: 'Anonymous' },
    title: 'Attempted Robbery on Main Rd',
    description: 'Two individuals attempted to snatch a bag near the corner cafe. Be cautious in this area, especially at night.',
    type: AlertType.Crime,
    location: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
    imageUrl: 'https://picsum.photos/seed/crime1/400/300',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    likes: 15,
    comments: [
      { id: 'c1', user: { name: 'Sarah J.' }, text: 'Thanks for the warning! I walk there every day.', timestamp: new Date().toISOString() },
      { id: 'c2', user: { name: 'Local Resident' }, text: 'Police were patrolling earlier, hope they catch them.', timestamp: new Date().toISOString() },
    ],
    isResolved: false,
  },
  {
    id: 'alert-2',
    user: { name: 'JP du Plessis' },
    title: 'Massive Pothole on M1 Highway',
    description: 'A huge pothole near the Grayston drive off-ramp is causing major traffic. I almost lost a tyre. Avoid left lane.',
    type: AlertType.Pothole,
    location: { lat: -26.1076, lng: 28.0567 }, // Sandton
    imageUrl: 'https://picsum.photos/seed/pothole1/400/300',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    likes: 42,
    comments: [],
    isResolved: false,
  },
  {
    id: 'alert-3',
    user: { name: 'Anonymous' },
    title: 'Power Outage in Rosebank',
    description: 'The whole block seems to be out. City Power has not provided an ETA for restoration yet.',
    type: AlertType.PowerOutage,
    location: { lat: -26.1426, lng: 28.0419 }, // Rosebank
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    likes: 22,
    comments: [
        { id: 'c3', user: { name: 'Mark' }, text: 'Eskom loadshedding stage 4', timestamp: new Date().toISOString() },
    ],
    isResolved: false,
  },
  {
    id: 'alert-4',
    user: { name: 'City Works Dept.' },
    title: 'Water Main Repaired in Parkhurst',
    description: 'The burst water pipe on 4th Avenue has been repaired and water supply is being restored to the area.',
    type: AlertType.WaterIssue,
    location: { lat: -26.1350, lng: 28.0350 }, // Parkhurst
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    likes: 5,
    comments: [],
    isResolved: true,
  },
  {
    id: 'alert-5',
    user: { name: 'Anonymous' },
    title: 'Deep pothole corner Jan Smuts and Walters',
    description: 'This has been here for weeks, getting dangerous.',
    type: AlertType.Pothole,
    location: { lat: -26.148, lng: 28.038 }, // Near Rosebank
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    likes: 18,
    comments: [],
    isResolved: false,
  },
];

export const SA_WARDS_GEOJSON: GeoJSONFeatureCollection = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "WARD_NO": "117" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [28.02, -26.15], [28.05, -26.15], [28.05, -26.13], [28.02, -26.13], [28.02, -26.15]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "WARD_NO": "90" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [28.05, -26.15], [28.08, -26.15], [28.08, -26.13], [28.05, -26.13], [28.05, -26.15]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "WARD_NO": "74" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
             [28.03, -26.17], [28.06, -26.17], [28.06, -26.15], [28.03, -26.15], [28.03, -26.17]
          ]
        ]
      }
    }
  ]
};

export const MOCK_HOTSPOTS: Hotspot[] = [
  {
    id: 'hotspot-1',
    location: { lat: -26.20, lng: 28.04 },
    radius: 3000,
    level: 'Provincial',
    type: 'Crime Hotspot',
    color: 'rgba(239, 68, 68, 0.25)' // Red
  },
  {
    id: 'hotspot-2',
    location: { lat: -26.11, lng: 28.05 },
    radius: 2000,
    level: 'Municipal',
    type: 'Pothole & Road Issues',
    color: 'rgba(107, 114, 128, 0.3)' // Gray
  },
  {
    id: 'hotspot-3',
    location: { lat: -26.14, lng: 28.03 },
    radius: 2500,
    level: 'Municipal',
    type: 'Frequent Power Outages',
    color: 'rgba(245, 158, 11, 0.3)' // Amber
  }
];

export const MOCK_COUNCILORS: Councilor[] = [
  {
    ward: '117',
    name: 'Jane Doe',
    party: 'Democratic Alliance (DA)',
    imageUrl: 'https://i.pravatar.cc/150?u=ward117',
    contact: '082 123 4567',
  },
  {
    ward: '90',
    name: 'John Smith',
    party: 'African National Congress (ANC)',
    imageUrl: 'https://i.pravatar.cc/150?u=ward90',
    contact: '083 987 6543',
  },
  {
    ward: '74',
    name: 'Peter Jones',
    party: 'ActionSA',
    imageUrl: 'https://i.pravatar.cc/150?u=ward74',
    contact: '071 555 1234',
  },
];