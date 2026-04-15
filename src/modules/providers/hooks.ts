import { useCallback, useEffect, useState } from "react";
import { searchProvidersApi } from "./api";
import type { ProviderSearchItem } from "./types";

export const useProviderSearch = (params?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const [items, setItems] = useState<ProviderSearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchProvidersApi(params);
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    items,
    loading,
    refetch: fetchProviders,
  };
};