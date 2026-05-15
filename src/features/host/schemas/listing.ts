import { z } from "zod";

const maxFileSize = 20 * 1024 * 1024; // 20MB

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
    .refine(
      (files) => files && files.length === 3,
      "You must upload exactly 3 images (1 cover, 2 for detail page gallery)"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        Array.from(files).every((f: any) => f.size <= maxFileSize),
      "Each image must be under 20MB"
    ),
});

export type ListingFormInput = z.infer<typeof listingSchema>;