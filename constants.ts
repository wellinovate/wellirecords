import { HealthRecord } from './types';
import { Globe, Lock, Smartphone } from "lucide-react";


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


export const FEATURES = [
  {
    id: "universal",
    icon: Globe,
    color: "bg-blue-100 text-blue-600",
    modalColor: "bg-blue-600",
    title: "Universal Access",
    desc: "Access your records from anywhere in the world. Whether you are switching doctors or traveling abroad, your history travels with you.",
    details:
      "WelliRecord is built on the HL7 FHIR standard, ensuring your health data speaks the global language of healthcare. Whether you are seeing a specialist in London or an emergency room in Lagos, your critical health information is instantly available and readable.",
    benefits: [
      "Global Interoperability (FHIR Compliant)",
      "Instant Emergency Profile Access",
      "Multi-language Translation via Gemini AI",
    ],
  },
  {
    id: "control",
    icon: Lock,
    color: "bg-emerald-100 text-emerald-600",
    modalColor: "bg-emerald-600",
    title: "You Control Access",
    desc: "Share specific records with a specialist for 24 hours, then revoke access instantly. No more faxing sensitive forms.",
    details:
      'Our "Smart Consent" protocol puts you in the driver’s seat. Grant granular permissions—share just your latest MRI with a radiologist or your full history with a new GP. Set automatic expiration timers so you never have to remember to revoke access.',
    benefits: [
      "Granular Permission Settings",
      "Time-Limited Access Grants",
      "Immutable Access Logs on Blockchain",
    ],
  },
  {
    id: "sync",
    icon: Smartphone,
    color: "bg-purple-100 text-purple-600",
    modalColor: "bg-purple-600",
    title: "Wearable Sync",
    desc: "Connect Apple Health, Fitbit, and more. Our AI correlates your daily vitals with your clinical records for deeper insights.",
    details:
      "WelliRecord doesn’t just store clinical data; it brings it to life with real-world context. Sync data from Apple Health, Google Fit, and Oura. Our Gemini 2.5 AI engine analyzes your sleep, heart rate variability, and activity alongside your lab results to find hidden correlations.",
    benefits: [
      "Real-time Vitals Dashboard",
      "AI-Driven Health Correlations",
      "Automatic Anomaly Detection",
    ],
  }, 
];
