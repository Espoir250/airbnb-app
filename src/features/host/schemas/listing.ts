import { z } from "zod";

const maxFileSize = 5 * 1024 * 1024;

export const listingSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  location: z.string().min(2, "Location is required"),
  price: z.number().min(10, "Price must be at least FRW 10"),
  category: z.enum(["HOUSE", "APARTMENT", "HOTEL"]),
  guests: z.number().min(1).max(16),
  superhost: z.boolean().optional(),
  available: z.boolean().optional(),
  availableFrom: z.string().min(1, "Available date is required"),
  image: z
    .any()
    .optional()
    .refine((files) => !files?.[0] || files[0].size <= maxFileSize, "Image must be under 5MB"),
});

export type ListingFormInput = z.infer<typeof listingSchema>;
