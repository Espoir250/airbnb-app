import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, extractArray, mapBooking, type Booking } from "../../../lib/api";
import { useAuth } from "../../auth/hooks/useAuth";

type BookingResponse = any[] | { data: any[] };

function sameValue(left?: string | null, right?: string | null) {
  return !!left && !!right && left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function useMyBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookings", "me", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const body = await api.get<BookingResponse>("/api/v1/bookings");

      return extractArray(body)
        .filter((booking: any) => {
          const guestId = booking.guestId ?? booking.userId ?? booking.guest?.id;
          const guestName = booking.guest?.name ?? booking.guestName ?? booking.name;
          const guestEmail = booking.guest?.email ?? booking.email;
          const hostId = booking.hostId ?? booking.listing?.hostId ?? booking.host?.id;

          return (
            sameValue(guestId, user!.id) ||
            sameValue(guestName, user!.name) ||
            sameValue(guestEmail, user!.email) ||
            sameValue(hostId, user!.id)
          );
        })
        .map(mapBooking);
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/bookings/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bookings", "me"] });

      const previous = queryClient.getQueriesData<Booking[]>({
        queryKey: ["bookings", "me"],
      });

      previous.forEach(([key, value]) => {
        queryClient.setQueryData<Booking[]>(
          key,
          value?.filter((booking) => booking.id !== id) ?? [],
        );
      });

      return { previous };
    },
    onError: (error: Error, _id, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
      toast.error(error.message || "Could not cancel booking.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
  });
}
