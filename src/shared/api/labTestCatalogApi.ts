import apiClient from './apiClient';

export interface LabTestCatalogItem {
  id: string;
  name: string;
  labDepartment: string;
}

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
