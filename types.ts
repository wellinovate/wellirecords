export interface HealthRecord {
  id: string;
  title: string;
  date: string;
  type: 'Lab Result' | 'Prescription' | 'Imaging' | 'Clinical Note' | 'Vaccination';
  provider: string;
  summary: string;
  status: 'Verified' | 'Pending';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingSources?: Array<{
    uri: string;
    title: string;
  }>;
  isMap?: boolean;
}

export interface MapPlace {
  title: string;
  uri: string;
  rating?: number;
  snippet?: string;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface HealthMetric {
  id: string;
  label: string;
  unit: string;
  color: string;
  data: MetricDataPoint[];
  status: 'stable' | 'improving' | 'attention';
}
export enum DashboardModule {
  HOME = 'HOME',
  AI_TRIAGE = 'AI_TRIAGE',
  RECORDS = 'RECORDS',
  WALLET = 'WALLET',
  MARKET = 'MARKET',
  WELLIBIT = 'WELLIBIT',
  WELLIBIO = 'WELLIBIO',
  WELLIROOT = 'WELLIROOT',
  WELLITRACK = 'WELLITRACK'
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TIMELINE = 'TIMELINE',
  RECORDS = 'RECORDS',
  UPLOAD = 'UPLOAD',
  METRICS = 'METRICS',
  CHAT = 'CHAT',
  LIVE_ASSISTANT = 'LIVE_ASSISTANT',
  FIND_CARE = 'FIND_CARE',
  PORTABILITY = 'PORTABILITY',
  PROFILE = 'PROFILE',
  INTEGRATION = 'INTEGRATION',
  TELEMED = 'TELEMED',
  LANDING = 'LANDING',
  ABOUT_US = 'ABOUT_US'
}

export enum ViewState {
  DASHBOARD = 'dashboard',
  SYSTEMS = 'systems',
  IDENTITY = 'identity',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  CLINIC = 'clinic',
  LAB = 'lab',
  PHARMACY = 'pharmacy',
  TELEMEDICINE = 'telemedicine',
  DEVELOPER = 'developer'
}

export type Language = 'EN' | 'YOR' | 'IGB' | 'HAU';

export type UserRole = 'admin' | 'clinician' | 'lab_tech' | 'pharmacist' | 'telemedicine' | 'regulator' | 'developer' | 'patient';