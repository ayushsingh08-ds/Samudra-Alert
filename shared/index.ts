import { z } from 'zod';

/* ============================================================
 * Enums & constants
 * ========================================================== */

/** Event categories spanning natural disasters + daily civic incidents. */
export const EVENT_CATEGORIES = [
  // Natural hazards
  'Flood',
  'Cyclone',
  'Earthquake',
  'Landslide',
  'Heat Wave',
  'Heavy Rain',
  'Thunderstorm',
  'Tsunami',
  // Human / infrastructure incidents
  'Fire',
  'Road Accident',
  'Gas Leak',
  'Power Outage',
  'Water Supply',
  'Health Advisory',
  'Road Closure',
  'Air Quality',
] as const;

export const ALERT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const REPORT_STATUSES = ['pending', 'verified', 'rejected', 'resolved'] as const;
export const USER_ROLES = ['citizen', 'moderator', 'admin'] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type UserRole = (typeof USER_ROLES)[number];

/** Emoji icon per category — used for chips, pickers, toasts. */
export const CATEGORY_ICONS: Record<EventCategory, string> = {
  Flood: '🌊',
  Cyclone: '🌀',
  Earthquake: '🌋',
  Landslide: '⛰️',
  'Heat Wave': '🔥',
  'Heavy Rain': '🌧️',
  Thunderstorm: '⛈️',
  Tsunami: '🌊',
  Fire: '🔥',
  'Road Accident': '🚗',
  'Gas Leak': '☣️',
  'Power Outage': '🔌',
  'Water Supply': '🚰',
  'Health Advisory': '🏥',
  'Road Closure': '🚧',
  'Air Quality': '😷',
};

/** Tailwind-friendly accent per category for chips/pins. */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Flood: '#2563eb',
  Cyclone: '#7c3aed',
  Earthquake: '#92400e',
  Landslide: '#a16207',
  'Heat Wave': '#dc2626',
  'Heavy Rain': '#0284c7',
  Thunderstorm: '#6d28d9',
  Tsunami: '#1d4ed8',
  Fire: '#ea580c',
  'Road Accident': '#b91c1c',
  'Gas Leak': '#65a30d',
  'Power Outage': '#525252',
  'Water Supply': '#0891b2',
  'Health Advisory': '#be185d',
  'Road Closure': '#d97706',
  'Air Quality': '#6b7280',
};

/* ============================================================
 * Auth schemas
 * ========================================================== */

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/* ============================================================
 * Report schemas
 * ========================================================== */

export const reportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.enum(EVENT_CATEGORIES),
  severity: z.number().min(1).max(10),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  images: z.array(z.string()).max(5).default([]),
});

export const statusUpdateSchema = z.object({
  status: z.enum(REPORT_STATUSES),
  reason: z.string().max(500).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

/* ============================================================
 * Alert schemas
 * ========================================================== */

export const alertSchema = z.object({
  title: z.string().min(3).max(120),
  message: z.string().min(10).max(1000),
  severity: z.enum(ALERT_SEVERITIES),
  category: z.enum(EVENT_CATEGORIES),
  targetArea: z
    .object({
      lat: z.number(),
      lng: z.number(),
      radiusKm: z.number().min(1).max(500),
    })
    .nullable()
    .default(null),
  channels: z.array(z.enum(['inapp', 'push'])).min(1).default(['inapp']),
});

export type AlertInput = z.infer<typeof alertSchema>;

/* ============================================================
 * Device (push token) schemas
 * ========================================================== */

export const deviceSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(['android', 'ios', 'web']),
  region: z.string().optional(),
});

export type DeviceInput = z.infer<typeof deviceSchema>;

/* ============================================================
 * Regions — all Indian states & UTs bounding boxes
 * Used to map lat/lng -> region room for sockets/push.
 * Boxes are approximate; border overlaps are acceptable.
 * ========================================================== */

export interface RegionBox {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export const INDIAN_REGIONS: RegionBox[] = [
  // States
  { name: 'Andhra Pradesh', minLat: 12.5, maxLat: 19.2, minLng: 76.7, maxLng: 84.9 },
  { name: 'Arunachal Pradesh', minLat: 26.6, maxLat: 29.6, minLng: 91.5, maxLng: 97.5 },
  { name: 'Assam', minLat: 24.0, maxLat: 28.0, minLng: 89.6, maxLng: 96.1 },
  { name: 'Bihar', minLat: 24.3, maxLat: 27.6, minLng: 83.3, maxLng: 88.4 },
  { name: 'Chhattisgarh', minLat: 17.7, maxLat: 24.2, minLng: 80.2, maxLng: 84.4 },
  { name: 'Goa', minLat: 14.8, maxLat: 15.8, minLng: 73.6, maxLng: 74.4 },
  { name: 'Gujarat', minLat: 20.0, maxLat: 24.7, minLng: 68.1, maxLng: 74.5 },
  { name: 'Haryana', minLat: 27.6, maxLat: 30.9, minLng: 74.4, maxLng: 77.6 },
  { name: 'Himachal Pradesh', minLat: 30.3, maxLat: 33.3, minLng: 75.4, maxLng: 79.0 },
  { name: 'Jharkhand', minLat: 21.9, maxLat: 25.3, minLng: 83.3, maxLng: 87.9 },
  { name: 'Karnataka', minLat: 11.6, maxLat: 18.5, minLng: 74.0, maxLng: 78.6 },
  { name: 'Kerala', minLat: 8.2, maxLat: 12.8, minLng: 74.7, maxLng: 77.4 },
  { name: 'Madhya Pradesh', minLat: 21.0, maxLat: 26.9, minLng: 74.0, maxLng: 82.8 },
  { name: 'Maharashtra', minLat: 15.6, maxLat: 22.1, minLng: 72.6, maxLng: 80.9 },
  { name: 'Manipur', minLat: 23.8, maxLat: 25.7, minLng: 93.0, maxLng: 94.8 },
  { name: 'Meghalaya', minLat: 25.0, maxLat: 26.2, minLng: 89.8, maxLng: 92.8 },
  { name: 'Mizoram', minLat: 21.9, maxLat: 24.5, minLng: 92.1, maxLng: 93.5 },
  { name: 'Nagaland', minLat: 25.2, maxLat: 27.0, minLng: 93.5, maxLng: 95.2 },
  { name: 'Odisha', minLat: 17.5, maxLat: 22.6, minLng: 81.3, maxLng: 87.6 },
  { name: 'Punjab', minLat: 29.5, maxLat: 32.6, minLng: 73.8, maxLng: 76.9 },
  { name: 'Rajasthan', minLat: 23.0, maxLat: 30.2, minLng: 69.4, maxLng: 78.3 },
  { name: 'Sikkim', minLat: 27.1, maxLat: 28.2, minLng: 88.0, maxLng: 89.0 },
  { name: 'Tamil Nadu', minLat: 8.0, maxLat: 13.6, minLng: 76.2, maxLng: 80.5 },
  { name: 'Telangana', minLat: 15.8, maxLat: 19.9, minLng: 77.2, maxLng: 81.8 },
  { name: 'Tripura', minLat: 22.9, maxLat: 24.5, minLng: 91.1, maxLng: 92.3 },
  { name: 'Uttar Pradesh', minLat: 23.8, maxLat: 30.4, minLng: 77.0, maxLng: 84.7 },
  { name: 'Uttarakhand', minLat: 28.7, maxLat: 31.5, minLng: 77.3, maxLng: 81.1 },
  { name: 'West Bengal', minLat: 21.4, maxLat: 27.4, minLng: 85.8, maxLng: 89.2 },
  // Union Territories
  { name: 'Andaman & Nicobar', minLat: 6.7, maxLat: 14.0, minLng: 92.2, maxLng: 94.5 },
  { name: 'Chandigarh', minLat: 30.6, maxLat: 30.8, minLng: 76.6, maxLng: 76.9 },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', minLat: 20.0, maxLat: 20.3, minLng: 72.7, maxLng: 73.1 },
  { name: 'Delhi', minLat: 28.3, maxLat: 28.9, minLng: 76.8, maxLng: 77.6 },
  { name: 'Jammu & Kashmir', minLat: 32.2, maxLat: 37.1, minLng: 73.7, maxLng: 80.4 },
  { name: 'Ladakh', minLat: 32.2, maxLat: 36.0, minLng: 75.7, maxLng: 80.4 },
  { name: 'Lakshadweep', minLat: 8.2, maxLat: 12.3, minLng: 71.6, maxLng: 74.0 },
  { name: 'Puducherry', minLat: 11.8, maxLat: 12.0, minLng: 79.7, maxLng: 79.9 },
];

export const REGION_NAMES = INDIAN_REGIONS.map((r) => r.name);

/** India centroid for default map views. */
export const INDIA_MAP_CENTER: [number, number] = [22.5, 79.0];

export function regionForPoint(lat: number, lng: number): string {
  const hit = INDIAN_REGIONS.find(
    (r) => lat >= r.minLat && lat <= r.maxLat && lng >= r.minLng && lng <= r.maxLng,
  );
  return hit ? hit.name : 'Unknown';
}

/* ============================================================
 * API entity types (drift-proof client/server contracts)
 * ========================================================== */

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ApiReport {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: number;
  status: ReportStatus;
  region: string;
  images: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdBy?: { _id: string; name: string } | null;
  statusHistory: {
    status: ReportStatus;
    reason?: string;
    updatedBy?: { _id: string; name: string } | null;
    updatedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiAlert {
  _id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: EventCategory;
  targetArea: {
    center: { type: 'Point'; coordinates: [number, number] };
    radiusKm: number;
  } | null;
  channels: ('inapp' | 'push')[];
  sentBy?: { _id: string; name: string } | null;
  deliveryStats: { pushSent: number; pushFailed: number };
  createdAt: string;
}

export interface PaginatedReports {
  reports: ApiReport[];
  total: number;
  pages: number;
  page: number;
}

/* ============================================================
 * Socket event contracts
 * ========================================================== */

export interface ServerToClientEvents {
  'report:created': (report: ApiReport) => void;
  'report:updated': (report: ApiReport) => void;
  'alert:broadcast': (alert: ApiAlert) => void;
}

export interface ClientToServerEvents {
  'region:join': (region: string) => void;
  'region:leave': (region: string) => void;
}

export interface SocketData {
  userId: string;
  role: UserRole;
}
