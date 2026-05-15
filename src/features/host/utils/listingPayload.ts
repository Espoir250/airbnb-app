import type { ListingFormInput } from "../schemas/listing";

export const LISTING_CATEGORIES = [
  { label: "House", value: "HOUSE" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "Hotel", value: "HOTEL" },
] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]["value"];

export type BackendListingType = "APARTMENT" | "HOUSE" | "HOTEL" | "VILLA";

export function categoryToBackendType(
  category: ListingCategory,
): BackendListingType {
  if (category === "HOTEL") return "HOTEL";
  return category;
}

export function legacyCategoryToBackendType(
  category: ListingCategory,
): BackendListingType {
  if (category === "HOTEL") return "VILLA";
  return category;
}

export function categoryLabel(category?: string) {
  return (
    LISTING_CATEGORIES.find((option) => option.value === category)?.label ??
    "Hotel"
  );
}

export function normalizeFormCategory(category?: string): ListingCategory {
  const upper = category?.toUpperCase();
  if (upper === "HOUSE") return "HOUSE";
  if (upper === "APARTMENT") return "APARTMENT";
  return "HOTEL";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

export async function uploadListingImage(file?: File) {
  if (!file) return undefined;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body,
      },
    );
    const result = (await response.json().catch(() => ({}))) as {
      secure_url?: string;
      url?: string;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(
        result.error?.message || "Could not upload listing image.",
      );
    }

    return result.secure_url ?? result.url;
  }

  return fileToDataUrl(file);
}

export function imageFields(imageUrl?: string) {
  if (!imageUrl) return {};

  // Send multiple common field names because backend schemas may differ.
  // This keeps listing creation working even if it expects e.g. `photos`
  // instead of `images`, or `photoUrl` instead of `imageUrl`.
  return {
    // Current/primary fields
    image: imageUrl,
    imageUrl: imageUrl,
    coverImage: imageUrl,
    images: [imageUrl],

    // Alternate common naming
    photo: imageUrl,
    photoUrl: imageUrl,
    photos: [imageUrl],
  };
}

export function listingPayload(
  input: ListingFormInput,
  imageUrl: string | undefined,
  type: BackendListingType,
  host?: { id?: string; name?: string; username?: string },
) {
  return {
    title: input.title,
    description: input.description,
    location: input.location,
    pricePerNight: input.price,
    price: input.price,
    guests: input.guests,
    type,
    category: input.category,
    propertyType: input.category,
    superhost: input.superhost ?? false,
    available: input.available ?? true,
    availableFrom: input.availableFrom,
    ...(host?.id
      ? {
          hostId: host.id,
          userId: host.id,
          hostName: host.name ?? host.username,
        }
      : {}),
    amenities: [],
    ...imageFields(imageUrl),
  };
}
