import apiClient from './apiClient';

export interface ApiKeySummary {
  id: string;
  label: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKeySummary {
  key: string; // full raw key — only ever present in this create response
}

export interface CreateApiKeyPayload {
  label: string;
  scopes: string[];
}

export const apiKeysApi = {
  list: async (): Promise<ApiKeySummary[]> => {
    const res: any = await apiClient.get('/api-keys');
    return res?.data || [];
  },

  create: async (payload: CreateApiKeyPayload): Promise<ApiKeyCreated> => {
    const res: any = await apiClient.post('/api-keys', payload);
    return res?.data;
  },

  revoke: async (keyId: string) => {
    const res: any = await apiClient.delete(`/api-keys/${keyId}`);
    return res?.data;
  },
};
