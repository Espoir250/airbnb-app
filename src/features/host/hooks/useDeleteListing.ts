import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, type Booking } from "../../../lib/api";
import type { Listing } from "../../listings/types";

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      let lastError: Error | null = null;
      for (const path of [`/api/v1/listings/${id}`, `/api/listings/${id}`]) {
        try {
          return await api.delete(path);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Request failed");
        }
      }
      throw lastError ?? new Error("Could not delete listing");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["host-listings"] });
      const previous = queryClient.getQueriesData<Listing[]>({ queryKey: ["host-listings"] });
      previous.forEach(([key, value]) => {
        queryClient.setQueryData<Listing[]>(
          key,
          value?.filter((listing) => listing.id !== id) ?? [],
        );
      });
      return { previous };
    },
    onError: (error: Error, _id, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
      toast.error(error.message || "Could not delete listing.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["host-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateHostBookingStatus(status: "confirmed" | "declined") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      let lastError: Error | null = null;
      for (const path of [`/api/v1/bookings/${id}/status`, `/api/bookings/${id}/status`]) {
        try {
          return await api.patch(path, { status });
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Request failed");
        }
      }
      throw lastError ?? new Error("Could not update booking");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["host-bookings"] });
      const previous = queryClient.getQueriesData<Booking[]>({ queryKey: ["host-bookings"] });
      previous.forEach(([key, value]) => {
        queryClient.setQueryData<Booking[]>(
          key,
          value?.map((booking) => (booking.id === id ? { ...booking, status } : booking)) ?? [],
        );
      });
      return { previous };
    },
    onError: (error: Error, _id, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
      toast.error(error.message || "Could not update booking.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["host-bookings"] }),
  });
}
