import apiClient from "./apiClient";

/**
 * Create a record
 */
export const createRecord = async (module, payload) => {
  return apiClient.post(`/${module}`, payload);
};

/**
 * Get record by ID
 */
export const getRecordById = async (module, id) => {
  return apiClient.get(`/${module}/${id}`);
};

/**
 * Get records for a patient
 */
export const getPatientRecords = async (
  module,
  patientId,
  params = {},
) => {
  return apiClient.get(`/${module}/patient/${patientId}`, {
    params,
  });
};

/**
 * Update record
 */
export const updateRecord = async (module, id, payload) => {
  return apiClient.patch(`/${module}/${id}`, payload);
};