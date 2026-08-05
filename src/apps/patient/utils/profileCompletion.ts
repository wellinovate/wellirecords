import type { DashboardAlertItem } from "@/apps/components/DashboardAlerts";

// Deliberately a minimal local shape rather than importing PatientOverview's
// RecordsResponse type — this module only ever reads recordCount, and
// importing from the page component would create a circular dependency.
type RecordsResponse = Record<string, { recordCount?: number } | undefined>;

// Checklist-based completion score.
// Blood group and genotype are self-reported during the onboarding wizard
// (the one acceptable self-report path — see MedicalProfileWizard.tsx).
// They are marked as missing until the patient fills them in.
const CHECKLIST_ITEMS = [
  "bloodGroup",
  "genotype",
  "emergencyContact",
  "allergies",
  "medications",
  "diagnoses",
] as const;

type ChecklistKey = (typeof CHECKLIST_ITEMS)[number];

export type CompletionTier = "empty" | "started" | "almost" | "complete";

export type ProfileCompletionResult = {
  percent: number;
  tier: CompletionTier;
  missing: Record<ChecklistKey, boolean>;
};

export function computeProfileCompletion(
  records: RecordsResponse | null | undefined,
  emergencyContacts: unknown[] | null | undefined,
  bloodGroup?: string | null,
  genotype?: string | null,
  confirmedNone?: {
    allergies?: boolean;
    medications?: boolean;
    diagnoses?: boolean;
  } | null,
): ProfileCompletionResult {
  const hasEmergencyContact =
    Array.isArray(emergencyContacts) && emergencyContacts.length > 0;
  const hasAllergyRecord = (records?.allergies?.recordCount ?? 0) > 0;
  const hasMedicationRecord = (records?.medications?.recordCount ?? 0) > 0;
  const hasDiagnosisRecord = (records?.diagnoses?.recordCount ?? 0) > 0;

  const missing: Record<ChecklistKey, boolean> = {
    bloodGroup: !bloodGroup || bloodGroup === "Unknown",
    genotype: !genotype || genotype === "Unknown",
    emergencyContact: !hasEmergencyContact,
    allergies: !hasAllergyRecord && !confirmedNone?.allergies,
    medications: !hasMedicationRecord && !confirmedNone?.medications,
    diagnoses: !hasDiagnosisRecord && !confirmedNone?.diagnoses,
  };

  const completedCount = CHECKLIST_ITEMS.length - Object.values(missing).filter(Boolean).length;
  const percent = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  let tier: CompletionTier = "empty";
  if (percent >= 100) tier = "complete";
  else if (percent >= 71) tier = "almost";
  else if (percent >= 31) tier = "started";

  return { percent, tier, missing };
}

type MissingItemConfig = {
  key: ChecklistKey;
  label: string;
  ctaLabel: string;
  // "record:<type>" is handled by PatientOverview by opening RecordModal
  // directly with that record type, instead of navigating to a route.
  ctaLink: string;
};

const MISSING_ITEM_ORDER: MissingItemConfig[] = [
  {
    key: "bloodGroup",
    label: "add your blood group",
    ctaLabel: "Add blood group",
    ctaLink: "/patient/settings",
  },
  {
    key: "genotype",
    label: "add your genotype",
    ctaLabel: "Add genotype",
    ctaLink: "/patient/settings",
  },
  {
    key: "allergies",
    label: "add your allergies",
    ctaLabel: "Add allergy",
    ctaLink: "record:Allergy",
  },
  {
    key: "medications",
    label: "add your current medications",
    ctaLabel: "Add medication",
    ctaLink: "record:Prescription",
  },
  {
    key: "diagnoses",
    label: "add any existing conditions",
    ctaLabel: "Add condition",
    ctaLink: "record:Dianosis",
  },
  {
    key: "emergencyContact",
    label: "add an emergency contact",
    ctaLabel: "Add contact",
    ctaLink: "/patient/settings",
  },
];

const TIER_COPY: Record<
  Exclude<CompletionTier, "complete">,
  { type: DashboardAlertItem["type"]; title: string }
> = {
  empty: {
    type: "critical",
    title: "Complete your health profile",
  },
  started: {
    type: "warning",
    title: "Your health profile is almost ready",
  },
  almost: {
    type: "info",
    title: "Almost complete",
  },
};

// Returns at most one alert: the highest-priority missing item, with
// copy and severity set by the current tier. Priority order matches the
// project's allergy-first principle — allergies surface before
// medications, conditions, or the emergency contact.
export function buildProfileCompletionAlerts(
  result: ProfileCompletionResult,
): DashboardAlertItem[] {
  if (result.tier === "complete") return [];

  const missingItems = MISSING_ITEM_ORDER.filter((item) => result.missing[item.key]);
  if (missingItems.length === 0) return [];

  const [first, ...rest] = missingItems;
  const { type, title } = TIER_COPY[result.tier];

  const restLabels = rest.map((item) => item.label.replace(/^add /, ""));
  const message =
    restLabels.length > 0
      ? `Please ${first.label}. Also missing: ${restLabels.join(", ")}.`
      : `Please ${first.label} to finish your profile.`;

  return [
    {
      id: `profile-completion-${first.key}`,
      type,
      title,
      message,
      ctaLabel: first.ctaLabel,
      ctaLink: first.ctaLink,
    },
  ];
}
