import apiClient from './apiClient';

export interface CreateDependantPayload {
  fullName: string;
  dateOfBirth: string;
  gender?: 'Male' | 'Female' | 'Other';
}

export interface UpdateDependantPayload {
  fullName?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  avatar?: string | null;
  bloodGroup?: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'Unknown' | null;
  genotype?: 'AA' | 'AS' | 'AC' | 'SS' | 'SC' | 'Unknown' | null;
}

export interface DependantResponseData {
  dependantId: string;
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  avatar?: string;
  bloodGroup?: string;
  genotype?: string;
  patientId: string;
  wrId?: string;
}

export const dependantApi = {
  listDependants: async (): Promise<DependantResponseData[]> => {
    const res: any = await apiClient.get('/dependants');
    return res?.data || [];
  },

  createDependant: async (payload: CreateDependantPayload): Promise<DependantResponseData> => {
    const res: any = await apiClient.post('/dependants', payload);
    return res?.data;
  },

  getDependant: async (dependantId: string): Promise<DependantResponseData> => {
    const res: any = await apiClient.get(`/dependants/${dependantId}`);
    return res?.data;
  },

  updateDependant: async (dependantId: string, payload: UpdateDependantPayload): Promise<DependantResponseData> => {
    const res: any = await apiClient.patch(`/dependants/${dependantId}`, payload);
    return res?.data;
  },
};
