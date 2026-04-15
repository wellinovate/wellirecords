export type AppointmentStatus =
  | "booked"
  | "checked-in"
  | "cancelled"
  | "no-show"
  | "completed";

export type Appointment = {
  _id: string;
  patientId?: {
    _id: string;
    fullName?: string;
    wrId?: string;
    phone?: string;
  };
  organizationId: string;
  providerId?: {
    _id: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
  scheduledFor: string;
  reasonForVisit?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentListResponse = {
  success: boolean;
  message: string;
  items: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
