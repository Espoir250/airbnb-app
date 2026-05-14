import { z } from "zod";

const maxFileSize = 5 * 1024 * 1024;

export const bookingDatesSchema = z
  .object({
    checkIn: z.string().min(1, "Check-in is required"),
    checkOut: z.string().min(1, "Check-out is required"),
    guests: z.number().min(1, "At least 1 guest").max(16, "Maximum 16 guests"),
  })
  .refine((value) => new Date(value.checkOut) > new Date(value.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export const guestInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Phone must be at least 7 characters"),
  photo: z
    .any()
    .optional()
    .refine((files) => !files?.[0] || files[0].size <= maxFileSize, "Photo must be under 5MB"),
});

export const paymentSchema = z.object({
  card: z.string().regex(/^\d{16}$/, "Card must be exactly 16 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvv: z.string().regex(/^\d{3}$/, "CVV must be exactly 3 digits"),
});

export type BookingDatesInput = z.infer<typeof bookingDatesSchema>;
export type GuestInfoInput = z.infer<typeof guestInfoSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;

export type BookingFormData = BookingDatesInput &
  Omit<GuestInfoInput, "photo"> &
  PaymentInput & {
    photo?: File;
  };
