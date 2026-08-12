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
  const res = await apiClient.get('/lab-tests-catalog');
  return res.data.data;
};
