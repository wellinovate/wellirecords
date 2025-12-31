import { HealthRecord } from './types';

export const MOCK_RECORDS: HealthRecord[] = [
  {
    id: 'rec_001',
    title: 'Comprehensive Metabolic Panel',
    date: '2024-05-12',
    type: 'Lab Result',
    provider: 'Central City Lab',
    summary: 'Glucose slightly elevated. Other metrics within normal range.',
    status: 'Verified',
  },
  {
    id: 'rec_002',
    title: 'Amoxicillin 500mg',
    date: '2024-05-10',
    type: 'Prescription',
    provider: 'Dr. Sarah Chen',
    summary: 'Prescribed for acute sinusitis. Take 3 times daily.',
    status: 'Verified',
  },
  {
    id: 'rec_003',
    title: 'Chest X-Ray (PA/Lat)',
    date: '2024-04-22',
    type: 'Imaging',
    provider: 'Valley Imaging Center',
    summary: 'No acute cardiopulmonary process. Normal heart size.',
    status: 'Verified',
  },
  {
    id: 'rec_004',
    title: 'Annual Wellness Visit',
    date: '2024-04-20',
    type: 'Clinical Note',
    provider: 'Dr. Sarah Chen',
    summary: 'Patient in good health. Recommended increase in Vitamin D.',
    status: 'Verified',
  },
];

export const VITALS = [
  { label: 'Heart Rate', value: '72', unit: 'bpm', trend: 'stable' },
  { label: 'Blood Pressure', value: '118/78', unit: 'mmHg', trend: 'good' },
  { label: 'Weight', value: '70.5', unit: 'kg', trend: 'stable' },
  { label: 'Sleep Avg', value: '7.2', unit: 'hrs', trend: 'up' },
];
