import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

function authHeaders() {
  const token = Cookies.get("accessToken");
  return { Authorization: `Bearer ${token}` };
}

export type PharmacyInventorySummary = {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  expiringSoon: number;
  expired: number;
  stockValue: number;
};

export type PharmacyProduct = {
  id: string;
  organizationId: string;
  name: string;
  genericName?: string;
  brandName?: string;
  drugClass?: string;
  strength?: string;
  dosageForm?: string;
  packSize?: string;
  manufacturer?: string;
  countryOfManufacture?: string;
  nafdacNumber?: string;
  barcode?: string;
  sku?: string;
  category: string;
  dispenseStatus: "prescription" | "otc";
  minimumStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  defaultSellingPrice: number;
  storageRequirement?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PharmacyBatch = {
  id: string;
  organizationId: string;
  productId: string | { _id: string; name: string; genericName?: string };
  supplierId?: string | null;
  purchaseOrderId?: string | null;
  batchNumber: string;
  location: string;
  quantityReceived: number;
  quantityOnHand: number;
  costPrice: number;
  sellingPrice: number;
  expiryDate: string;
  receivedAt: string;
  status: "active" | "quarantined" | "disposed" | "returned" | "depleted";
  createdAt: string;
  updatedAt: string;
};

export type PharmacySupplier = {
  id: string;
  organizationId: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTerms?: string;
  creditLimit?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PharmacyPurchaseOrder = {
  id: string;
  organizationId: string;
  supplierId: string | { _id: string; name: string; phone?: string; email?: string };
  poNumber: string;
  status: "draft" | "pending_delivery" | "partially_received" | "received" | "cancelled";
  lineItems: Array<{
    productId: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitCost: number;
  }>;
  expectedDeliveryDate?: string | null;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

const BASE_URL = `${apiUrl}/api/v1/pharmacy-inventory`;

export const pharmacyInventoryApi = {
  getSummary: async (): Promise<PharmacyInventorySummary> => {
    const { data } = await api.get(`${BASE_URL}/summary`, { headers: authHeaders() });
    return data.data;
  },

  listProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<PharmacyProduct>> => {
    const { data } = await api.get(`${BASE_URL}/products`, { params, headers: authHeaders() });
    return data.data;
  },

  getProduct: async (id: string): Promise<PharmacyProduct> => {
    const { data } = await api.get(`${BASE_URL}/products/${id}`, { headers: authHeaders() });
    return data.data;
  },

  createProduct: async (payload: Partial<PharmacyProduct>): Promise<PharmacyProduct> => {
    const { data } = await api.post(`${BASE_URL}/products`, payload, { headers: authHeaders() });
    return data.data;
  },

  updateProduct: async (id: string, payload: Partial<PharmacyProduct>): Promise<PharmacyProduct> => {
    const { data } = await api.patch(`${BASE_URL}/products/${id}`, payload, { headers: authHeaders() });
    return data.data;
  },

  listBatches: async (params?: {
    page?: number;
    limit?: number;
    productId?: string;
    location?: string;
    status?: string;
    expiringWithinDays?: number;
    expiredOnly?: boolean;
  }): Promise<PaginatedResponse<PharmacyBatch>> => {
    const { data } = await api.get(`${BASE_URL}/batches`, { params, headers: authHeaders() });
    return data.data;
  },

  createStockAdjustment: async (payload: {
    batchId: string;
    quantityDelta: number;
    reason: string;
  }): Promise<{ batch: PharmacyBatch; ledgerEntry: any }> => {
    const { data } = await api.post(`${BASE_URL}/adjustments`, payload, { headers: authHeaders() });
    return data.data;
  },

  listSuppliers: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<PharmacySupplier>> => {
    const { data } = await api.get(`${BASE_URL}/suppliers`, { params, headers: authHeaders() });
    return data.data;
  },

  createSupplier: async (payload: Partial<PharmacySupplier>): Promise<PharmacySupplier> => {
    const { data } = await api.post(`${BASE_URL}/suppliers`, payload, { headers: authHeaders() });
    return data.data;
  },

  updateSupplier: async (id: string, payload: Partial<PharmacySupplier>): Promise<PharmacySupplier> => {
    const { data } = await api.patch(`${BASE_URL}/suppliers/${id}`, payload, { headers: authHeaders() });
    return data.data;
  },

  listPurchaseOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<PharmacyPurchaseOrder>> => {
    const { data } = await api.get(`${BASE_URL}/purchase-orders`, { params, headers: authHeaders() });
    return data.data;
  },

  createPurchaseOrder: async (payload: {
    supplierId: string;
    poNumber?: string;
    lineItems: Array<{ productId: string; quantityOrdered: number; unitCost: number }>;
    expectedDeliveryDate?: string;
    notes?: string;
  }): Promise<PharmacyPurchaseOrder> => {
    const { data } = await api.post(`${BASE_URL}/purchase-orders`, payload, { headers: authHeaders() });
    return data.data;
  },

  updatePurchaseOrderStatus: async (
    id: string,
    status: "pending_delivery" | "cancelled",
  ): Promise<PharmacyPurchaseOrder> => {
    const { data } = await api.patch(
      `${BASE_URL}/purchase-orders/${id}/status`,
      { status },
      { headers: authHeaders() },
    );
    return data.data;
  },

  receiveGoods: async (
    id: string,
    receiptLines: Array<{
      productId: string;
      batchNumber: string;
      quantityReceived: number;
      expiryDate: string;
      costPrice?: number;
      sellingPrice?: number;
      location?: string;
    }>,
  ): Promise<{ purchaseOrder: PharmacyPurchaseOrder; batches: PharmacyBatch[] }> => {
    const { data } = await api.patch(
      `${BASE_URL}/purchase-orders/${id}/receive`,
      { receiptLines },
      { headers: authHeaders() },
    );
    return data.data;
  },

  listLedger: async (params?: {
    page?: number;
    limit?: number;
    productId?: string;
    batchId?: string;
    transactionType?: string;
  }): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get(`${BASE_URL}/ledger`, { params, headers: authHeaders() });
    return data.data;
  },
};
