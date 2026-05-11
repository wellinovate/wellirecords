import type { AccessGrant, AccessAudit } from "@/shared/api/consentApi";

export const MOCK_ACCESS_GRANTS: AccessGrant[] = [
  {
    _id: "grant_001",
    patientId: "pat_001",
    grantedBy: "user_patient_001",
    requestedBy: null,

    granteeType: "provider",

    granteeUserId: {
      _id: "prov_001",
      fullName: "Dr. Fatima Aliyu",
      email: "fatima.aliyu@lagosgeneral.ng",
    },

    granteeOrganizationId: {
      _id: "org_hosp_001",
      organizationName: "Lagos General Hospital",
    },

    accessScope: "full-record",
    category: null,
    recordId: null,
    encounterId: null,

    permissions: {
      view: true,
      download: false,
      reshare: false,
      write: false,
    },

    purpose: "consultation",

    startsAt: "2026-02-01T10:00:00Z",
    expiresAt: "2026-06-01T10:00:00Z",

    recordFrom: null,
    recordTo: null,

    status: "active",
    reviewedAt: "2026-02-01T10:00:00Z",
    revokedAt: null,

    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
  },

  {
    _id: "grant_002",
    patientId: "pat_001",
    grantedBy: "user_patient_001",
    requestedBy: null,

    granteeType: "organization",

    granteeUserId: null,

    granteeOrganizationId: {
      _id: "org_lab_001",
      organizationName: "CityLab Diagnostics",
    },

    accessScope: "category",
    category: "lab-results",
    recordId: null,
    encounterId: null,

    permissions: {
      view: true,
      download: true,
      reshare: false,
      write: false,
    },

    purpose: "referral",

    startsAt: "2026-02-10T08:00:00Z",
    expiresAt: "2026-06-17T08:00:00Z",

    recordFrom: "2025-02-10T08:00:00Z",
    recordTo: null,

    status: "active",
    reviewedAt: "2026-02-10T08:00:00Z",
    revokedAt: null,

    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-02-10T08:00:00Z",
  },

  {
    _id: "grant_003",
    patientId: "pat_001",
    grantedBy: "user_patient_001",
    requestedBy: null,

    granteeType: "provider",

    granteeUserId: {
      _id: "prov_003",
      fullName: "Dr. Sola Martins",
      email: "sola.martins@wellirecord-gp.ng",
    },

    granteeOrganizationId: {
      _id: "org_gp_001",
      organizationName: "WelliRecord GP Network",
    },

    accessScope: "category",
    category: "medications",
    recordId: null,
    encounterId: null,

    permissions: {
      view: true,
      download: false,
      reshare: false,
      write: false,
    },

    purpose: "medication review",

    startsAt: "2026-03-01T14:30:00Z",
    expiresAt: null,

    recordFrom: null,
    recordTo: null,

    status: "active",
    reviewedAt: "2026-03-01T14:30:00Z",
    revokedAt: null,

    createdAt: "2026-03-01T14:30:00Z",
    updatedAt: "2026-03-01T14:30:00Z",
  },

  {
    _id: "grant_004",
    patientId: "pat_001",
    grantedBy: "user_patient_001",
    requestedBy: null,

    granteeType: "organization",

    granteeUserId: null,

    granteeOrganizationId: {
      _id: "org_pharm_001",
      organizationName: "Pharmalink Nigeria",
    },

    accessScope: "category",
    category: "medications",
    recordId: null,
    encounterId: null,

    permissions: {
      view: true,
      download: false,
      reshare: false,
      write: false,
    },

    purpose: "prescription fulfilment",

    startsAt: "2026-02-20T11:00:00Z",
    expiresAt: "2026-02-27T11:00:00Z",

    recordFrom: null,
    recordTo: null,

    status: "expired",
    reviewedAt: "2026-02-20T11:00:00Z",
    revokedAt: null,

    createdAt: "2026-02-20T11:00:00Z",
    updatedAt: "2026-02-27T11:00:00Z",
  },
];

export const MOCK_ACCESS_REQUESTS: AccessGrant[] = [
  {
    _id: "req_001",
    patientId: "pat_001",
    grantedBy: "user_patient_001",
    requestedBy: "prov_007",

    granteeType: "organization",

    granteeUserId: null,

    granteeOrganizationId: {
      _id: "org_ins_001",
      organizationName: "AXA Mansard Insurance",
    },

    accessScope: "full-record",
    category: null,
    recordId: null,
    encounterId: null,

    permissions: {
      view: true,
      download: false,
      reshare: false,
      write: false,
    },

    purpose:
      "We need to verify your recent hospital visit for claim #AXA-2026-1234.",

    startsAt: "2026-02-23T09:00:00Z",
    expiresAt: null,

    recordFrom: null,
    recordTo: null,

    status: "pending",
    reviewedAt: null,
    revokedAt: null,

    createdAt: "2026-02-23T09:00:00Z",
    updatedAt: "2026-02-23T09:00:00Z",
  },
];

export const MOCK_ACCESS_AUDIT: AccessAudit[] = [
  {
    _id: "log_001",
    patientId: "pat_001",

    accessedBy: {
      _id: "prov_001",
      fullName: "Dr. Fatima Aliyu",
      email: "fatima.aliyu@lagosgeneral.ng",
    },

    organizationId: {
      _id: "org_hosp_001",
      organizationName: "Lagos General Hospital",
    },

    grantId: "grant_001",
    category: "lab-results",
    action: "view",
    ipAddress: "102.89.22.10",
    userAgent: "Chrome",

    createdAt: "2026-02-10T09:15:00Z",
  },

  {
    _id: "log_002",
    patientId: "pat_001",

    accessedBy: {
      _id: "prov_001",
      fullName: "Dr. Fatima Aliyu",
      email: "fatima.aliyu@lagosgeneral.ng",
    },

    organizationId: {
      _id: "org_hosp_001",
      organizationName: "Lagos General Hospital",
    },

    grantId: "grant_001",
    category: "medications",
    action: "view",
    ipAddress: "102.89.22.10",
    userAgent: "Chrome",

    createdAt: "2026-02-15T14:30:00Z",
  },

  {
    _id: "log_003",
    patientId: "pat_001",

    accessedBy: {
      _id: "prov_002",
      fullName: "Bayo Adewale",
      email: "bayo.adewale@citylab.ng",
    },

    organizationId: {
      _id: "org_lab_001",
      organizationName: "CityLab Diagnostics",
    },

    grantId: "grant_002",
    category: "lab-results",
    action: "download",
    ipAddress: "197.210.84.3",
    userAgent: "Chrome",

    createdAt: "2026-02-10T02:00:00Z",
  },
];