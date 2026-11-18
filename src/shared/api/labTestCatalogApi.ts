import apiClient from './apiClient';

export interface LabTestCatalogItem {
  id: string;
  name: string;
  labDepartment: string;
  key?: string | null;
  structured?: boolean;
  specimen?: string;
  fastingRequired?: boolean;
}

export interface LabAnalyte {
  code: string;
  name: string;
  type: 'numeric' | 'choice' | 'text' | 'calculated' | 'sensitivity';
  unit?: string;
  dp?: number;
  options?: string[];
  altUnits?: { unit: string; factor: number }[];
  refNote?: string;
}

export interface LabCatalogTest {
  key: string;
  name: string;
  specimen?: string;
  container?: string;
  fastingRequired?: boolean;
  notes?: string;
  reviewStatus?: string;
  analytes: LabAnalyte[];
}

export const getLabCatalogTest = async (keyOrId: string): Promise<LabCatalogTest | null> => {
  const res: any = await apiClient.get(`/lab-tests-catalog/${encodeURIComponent(keyOrId)}`);
  return res?.data ?? null;
};

export interface LabTestCatalogGroup {
  category: string;
  tests: LabTestCatalogItem[];
}

export const getLabTestCatalog = async (): Promise<LabTestCatalogGroup[]> => {
  // apiClient's response interceptor already unwraps response.data, so
  // the resolved value here is the body ({ success, message, data }),
  // not a full axios response. One unwrap, not two.
  const res: any = await apiClient.get('/lab-tests-catalog');
  return res?.data ?? [];
};
