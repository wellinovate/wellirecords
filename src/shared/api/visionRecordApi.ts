import apiClient from "./apiClient";

export interface Refraction {
  sphere: number | null;
  cylinder: number | null;
  axis: number | null;
  add: number | null;
}

export interface VisionAcuity {
  distance: { right: string | null; left: string | null };
  near: { right: string | null; left: string | null };
}

export interface VisionVisit {
  _id: string;
  date: string;
  clinicName: string;
  providerName: string;
  acuity: VisionAcuity;
  colorVision: "normal" | "deficient" | "not_tested";
  lensPrescription: { right: Refraction; left: Refraction };
  diagnosis: string;
  treatment: string;
  photos: { url: string; publicId: string; caption: string }[];
  provenance: { clinic: string; enteredAt: string; source: "provider-entered" };
}

export interface VisionRecord {
  patientId: string;
  visits: VisionVisit[];
}

export const getVisionRecord = async (patientId: string): Promise<VisionRecord> => {
  const response = await apiClient.get(`/records/vision/${patientId}`);
  // apiClient's response interceptor already unwraps response.data, so
  // `response` here is the parsed JSON body itself — .data is the
  // actual payload. .data.data was one level too deep and resolved
  // to undefined, which crashed the page on render.
  return response.data;
};

// One flattened visit as returned by the org-wide list — same shape as
// a VisionVisit but with patientId included, since these visits span
// every patient in the provider's organization rather than one patient.
export interface VisionVisitListItem extends Omit<VisionVisit, "_id" | "provenance"> {
  id: string;
  patientId: string;
}

export interface VisionVisitListResponse {
  items: VisionVisitListItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const getAllPatientVision = async (
  page = 1,
  limit = 10,
): Promise<VisionVisitListResponse> => {
  const response = await apiClient.get(`/records/vision/patients`, {
    params: { page, limit },
  });
  // See getVisionRecord above — same interceptor unwrap applies here.
  return response.data;
};

export interface CreateVisionVisitInput {
  patientId: string;
  clinicName: string;
  acuity: VisionAcuity;
  colorVision: VisionVisit["colorVision"];
  lensPrescription: VisionVisit["lensPrescription"];
  diagnosis: string;
  treatment: string;
  photos: File[];
}

export const createVisionVisit = async (input: CreateVisionVisitInput): Promise<VisionRecord> => {
  const formData = new FormData();
  formData.append("clinicName", input.clinicName);
  formData.append("acuity", JSON.stringify(input.acuity));
  formData.append("colorVision", input.colorVision);
  formData.append("lensPrescription", JSON.stringify(input.lensPrescription));
  formData.append("diagnosis", input.diagnosis);
  formData.append("treatment", input.treatment);
  input.photos.forEach((file) => formData.append("photos", file));

  const response = await apiClient.post(`/records/vision/${input.patientId}/visits`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
