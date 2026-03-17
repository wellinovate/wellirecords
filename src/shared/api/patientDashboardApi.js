import apiClient from "./apiClient";
import { CLINICAL_MODULES } from "../../../constants";
import { getPatientRecords } from "./clinicalApi";

export const patientDashboardApi = {
  getVitals(patientId, params = {}) {
    return getPatientRecords(CLINICAL_MODULES.VITALS, patientId, params);
  },

  getRecords(patientId, params = {}) {
    // if your "vault" is a separate endpoint, use that instead
    return apiClient.get(`vitals/patient/${patientId}`, { params });
  },

  getGrants(patientId) {
    return apiClient.get(`/consents/grants/patient/${patientId}`);
  },

  getRequests(patientId) {
    return apiClient.get(`/consents/requests/patient/${patientId}`);
  },
};