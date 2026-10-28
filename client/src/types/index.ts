export type { ApiReport, ApiAlert, ApiUser, EventCategory, AlertSeverity, ReportStatus, UserRole } from '@samudra/shared';

export interface HazardAlert {
  id: string;
  _id?: string;
  title: string;
  location: {
    type: string;
    coordinates: number[]; // [lng, lat]
  };
  severity: number;
  timestamp: string;
  createdAt: string;
  reporterType?: 'Official' | 'Community';
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
  description?: string;
  category: string;
  region?: string;
  images?: string[];
  createdBy?: {
    _id: string;
    name: string;
  };
}

export interface AdminStats {
  byStatus: Record<string, number>;
  todayCount: number;
  trend: { date: string; count: number }[];
  avgVerificationMinutes: number;
  total: number;
}
