import { useQuery } from "@tanstack/react-query";
import { api, extractArray, extractRecord, mapListing, type BackendListing } from "../../../lib/api";

type PaginatedResponse = {
  data: BackendListing[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function useListings() {
  return useQuery({
    queryKey: ["listings"],
    retry: false,
    queryFn: async () => {
      const body = await api.get<BackendListing[] | PaginatedResponse>("/api/v1/listings");
      return extractArray(body).map(mapListing);
    },
  });
}

export function useListing(id?: string) {
  return useQuery({
    queryKey: ["listing", id],
    enabled: !!id,
    queryFn: async () => {
      const body = await api.get<BackendListing | { data: BackendListing }>(
        `/api/v1/listings/${id}`,
      );
      return mapListing(extractRecord(body));
    },
  });
}