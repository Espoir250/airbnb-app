import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  api,
  extractArray,
  mapBooking,
  mapListing,
  type BackendListing,
  type Booking,
} from "../../../lib/api";
import type { Listing } from "../../listings/types";

type ListResponse<T> = T[] | { data: T[] };

export type AdminUser = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  phone?: string;
};

async function patchFirst<T>(paths: string[], body: unknown) {
  let lastError: Error | null = null;

  for (const path of paths) {
    try {
      return await api.patch<T>(path, body);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Request failed");
    }
  }

  throw lastError ?? new Error("Request failed");
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [listingsBody, bookingsBody, usersBody] = await Promise.all([
        api.get<ListResponse<BackendListing>>("/api/v1/listings"),
        api.get<ListResponse<any>>("/api/v1/bookings"),
        api.get<ListResponse<AdminUser>>("/api/v1/users").catch(() => [] as AdminUser[]),
      ]);
      const bookings = extractArray(bookingsBody).map(mapBooking);

      return {
        totalUsers: extractArray(usersBody).length,
        totalListings: extractArray(listingsBody).length,
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((total, booking) => total + booking.totalPrice, 0),
      };
    },
  });
}

export function usePendingListings() {
  return useQuery({
    queryKey: ["listings", "pending"],
    queryFn: async () => {
      const body = await api.get<ListResponse<BackendListing>>("/api/v1/listings");
      return extractArray(body)
        .filter((listing) => listing.status?.toLowerCase() === "pending")
        .map(mapListing);
    },
  });
}

function useModerationMutation(status: "published" | "rejected") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      patchFirst([`/api/v1/listings/${id}/status`, `/api/listings/${id}/status`], {
        status,
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["listings", "pending"] });
      const previous = queryClient.getQueryData<Listing[]>(["listings", "pending"]) ?? [];
      queryClient.setQueryData<Listing[]>(["listings", "pending"], (current = []) =>
        current.filter((listing) => listing.id !== id),
      );
      return { previous };
    },
    onError: (error: Error, _id, context) => {
      queryClient.setQueryData(["listings", "pending"], context?.previous ?? []);
      toast.error(error.message || "Could not moderate listing.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["listings", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useApprove() {
  return useModerationMutation("published");
}

export function useReject() {
  return useModerationMutation("rejected");
}

export type BookingFilters = {
  status: string;
  start: string;
  end: string;
  page: number;
};

export function useAllBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ["bookings", "all", filters],
    queryFn: async () => {
      const body = await api.get<ListResponse<any>>("/api/v1/bookings");
      return extractArray(body)
        .filter((booking: any) => {
          if (filters.status !== "all" && booking.status !== filters.status) return false;
          if (filters.start && booking.checkIn < filters.start) return false;
          if (filters.end && booking.checkOut > filters.end) return false;
          return true;
        })
        .map(mapBooking);
    },
    placeholderData: keepPreviousData,
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      let lastError: Error | null = null;
      for (const path of [`/api/v1/admin/users/${id}/ban`, `/api/admin/users/${id}/ban`]) {
        try {
          return await api.post(path);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Request failed");
        }
      }
      throw lastError ?? new Error("Could not ban user.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("User banned.");
    },
    onError: (error: Error) => toast.error(error.message || "Could not ban user."),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const body = await api.get<ListResponse<AdminUser>>("/api/v1/users");
      return extractArray(body).map((user) => ({
        ...user,
        id: String(user.id),
      }));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/users/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previous = queryClient.getQueryData<AdminUser[]>(["users"]) ?? [];
      queryClient.setQueryData<AdminUser[]>(["users"], (current = []) =>
        current.filter((user) => user.id !== id),
      );
      return { previous };
    },
    onError: (error: Error, _id, context) => {
      queryClient.setQueryData(["users"], context?.previous ?? []);
      toast.error(error.message || "Could not delete user.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("User deleted.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useAdminBookingStatus(status: Booking["status"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      patchFirst([`/api/v1/bookings/${id}/status`, `/api/bookings/${id}/status`], {
        status,
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bookings", "all"] });
      const queries = queryClient.getQueriesData<Booking[]>({ queryKey: ["bookings", "all"] });
      queries.forEach(([key, value]) => {
        queryClient.setQueryData<Booking[]>(
          key,
          value?.map((booking) => (booking.id === id ? { ...booking, status } : booking)),
        );
      });
      return { queries };
    },
    onError: (_error, _id, context) => {
      context?.queries.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["bookings", "all"] }),
  });
}
