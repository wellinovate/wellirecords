export type QueueSource = "appointment" | "walk-in";
export type VisitType = "consultation" | "follow-up" | "review" | "emergency";
export type WorkflowStatus =
  | "checked-in"
  | "triage"
  | "waiting"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

export type QueuePriority = "normal" | "urgent" | "emergency";

export type QueueVitals = {
  temperature?: number | null;
  pulse?: number | null;
  bloodPressure?: string | null;
  respiratoryRate?: number | null;
  spo2?: number | null;
  weight?: number | null;
  height?: number | null;
};

export type QueueItem = {
  _id: string;
  patientId?: {
    _id: string;
    fullName?: string;
    wrId?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
  };
  organizationId: string;
  appointmentId?: {
    _id: string;
    scheduledFor?: string;
    status?: string;
    reasonForVisit?: string;
  } | null;
  providerId?: {
    _id: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
  encounterId?: {
    _id: string;
    encounterCode?: string;
    encounterTitle?: string;
    status?: string;
    startedAt?: string;
    endedAt?: string;
  } | null;
  source: QueueSource;
  visitType: VisitType;
  workflowStatus: WorkflowStatus;
  priority: QueuePriority;
  chiefComplaint?: string | null;
  triageNotes?: string | null;
  vitals?: QueueVitals;
  checkedInAt?: string | null;
  triagedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QueueListResponse = {
  success: boolean;
  message: string;
  items: QueueItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StartEncounterResponse = {
  success: boolean;
  message: string;
  data: {
    queueItem: QueueItem;
    encounter: {
      _id: string;
      encounterCode?: string;
      encounterTitle?: string;
      status?: string;
    };
  };
};
