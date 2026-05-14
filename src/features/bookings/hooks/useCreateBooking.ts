import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../../lib/api";
import { useAuth } from "../../auth/hooks/useAuth";
import type { BookingFormData } from "../schemas/booking";

type CreateBookingInput = BookingFormData & {
  listingId: string;
  totalPrice: number;
};

export function useCreateBooking(listingId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      if (!user?.id) {
        throw new Error("Please log in before booking.");
      }

      const payload = {
        userId: user.id,
        guestId: user.id,
        listingId: input.listingId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        guests: input.guests,
        guest: {
          name: input.name,
          email: input.email,
          phone: input.phone,
        },
        payment: {
          cardLast4: input.card.slice(-4),
          expiry: input.expiry,
        },
        totalPrice: input.totalPrice,
      };

      let lastError: Error | null = null;
      for (const path of ["/api/v1/bookings", "/api/bookings"]) {
        try {
          return await api.post(path, payload);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Booking failed");
        }
      }

      throw lastError ?? new Error("Booking failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
      toast.success("Booking request sent.");
      navigate("/bookings");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Booking failed. Please try again.");
    },
  });
}
