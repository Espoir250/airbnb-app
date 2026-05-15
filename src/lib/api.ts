import type { Listing } from "../features/listings/types";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string ?? "").replace(/\/api\/v1\/?$/, "");
const DEFAULT_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";

type ApiErrorBody = {
  message?: string;
  error?: string;
};

export type BackendListing = {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight?: number;
  price?: number;
  guests?: number;
  type?: "APARTMENT" | "HOUSE" | "HOTEL" | "VILLA" | "CABIN";
  category?: "HOUSE" | "APARTMENT" | "HOTEL";
  hostId?: string;
  userId?: string;
  ownerId?: string;
  hostName?: string | null;
  status?: string;
  available?: boolean;
  availableFrom?: string;
  superhost?: boolean;
  host?: { id?: string; name?: string | null; username?: string | null; email?: string | null } | null;
  hostUser?: { id?: string; name?: string | null; username?: string | null; email?: string | null } | null;
  owner?: { id?: string; name?: string | null; username?: string | null; email?: string | null } | null;
  amenities?: string[];
  rating?: number | null;
  averageRating?: number | null;
  avgRating?: number | null;
  reviewsAverage?: number | null;
  reviews?: Array<{ rating?: number | null }>;
  images?: string[];
  image?: string | null;
  imageUrl?: string | null;
  photo?: string | null;
  photoUrl?: string | null;
  coverImage?: string | null;
};

type PaginatedResponse<T> = {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type Booking = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  guestId?: string;
  userId?: string;
  hostId?: string;
  guestName?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "declined" | string;
};

type BackendBooking = {
  id: string | number;
  listingId?: string | number | null;
  listing?: {
    id?: string | number | null;
    title?: string | null;
    image?: string | null;
    imageUrl?: string | null;
    images?: string[];
    hostId?: string | null;
  } | null;
  listingTitle?: string | null;
  listingImage?: string | null;
  title?: string | null;
  guestId?: string | null;
  userId?: string | null;
  hostId?: string | null;
  host?: { id?: string | null } | null;
  guest?: { id?: string | null; name?: string | null } | null;
  guestName?: string | null;
  name?: string | null;
  checkIn: string;
  checkOut: string;
  guests?: number | string | null;
  totalPrice?: number | string | null;
  total?: number | string | null;
  price?: number | string | null;
  status?: string | null;
};

export type AdminStats = {
  totalUsers: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
};

function apiUrl(path: string) {
  const url = `${API_BASE_URL}${path}`;
  // Prevent double /api/v1 if both base and path have it
  return url.replace("/api/v1/api/v1/", "/api/v1/");
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  if (!response.ok) {
    throw new Error(body.message || body.error || "Request failed");
  }

  return body;
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem("token");

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
  });

  return parseJson<T>(response);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/**
 * Normalise the backend type (which includes VILLA and CABIN) down to the
 * three values that the frontend Listing type accepts: APARTMENT | HOUSE | HOTEL
 */
function normalizeType(type?: BackendListing["type"]): "APARTMENT" | "HOUSE" | "HOTEL" {
  switch (type) {
    case "HOUSE":
    case "CABIN":
      return "HOUSE";
    case "APARTMENT":
      return "APARTMENT";
    case "HOTEL":
    case "VILLA":
    default:
      return "HOTEL";
  }
}

function categoryFromType(type?: BackendListing["type"]): "APARTMENT" | "HOUSE" | "HOTEL" {
  return normalizeType(type);
}

// Multiple images per property type for richer visual variety
const HOUSE_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
];

const APARTMENT_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop",
];

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop",
];

function imagesForType(type?: BackendListing["type"]): string[] {
  switch (type) {
    case "HOUSE":
    case "CABIN":
      return HOUSE_IMAGES;
    case "APARTMENT":
      return APARTMENT_IMAGES;
    case "HOTEL":
    case "VILLA":
    default:
      return HOTEL_IMAGES;
  }
}

function ratingForListing(listing: BackendListing) {
  const explicitRating =
    listing.rating ??
    listing.averageRating ??
    listing.avgRating ??
    listing.reviewsAverage;

  if (typeof explicitRating === "number" && explicitRating > 0) return explicitRating;

  const reviewRatings = listing.reviews
    ?.map((review) => review.rating)
    .filter((rating): rating is number => typeof rating === "number");

  if (reviewRatings?.length) {
    return reviewRatings.reduce((total, rating) => total + rating, 0) / reviewRatings.length;
  }

  return null;
}

function imagesForListing(listing: BackendListing) {
  const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
  const singleImage =
    listing.image ?? listing.imageUrl ?? listing.photo ?? listing.photoUrl ?? listing.coverImage;

  // Prefer images from the backend; fall back to the full type-based gallery
  if (images.length > 0) return images;
  if (singleImage) return [singleImage];
  return imagesForType(listing.type);
}

function hostNameForListing(listing: BackendListing) {
  return (
    listing.hostName ??
    listing.host?.name ??
    listing.host?.username ??
    listing.hostUser?.name ??
    listing.hostUser?.username ??
    listing.owner?.name ??
    listing.owner?.username ??
    undefined
  );
}
export function mapListing(listing: BackendListing): Listing {
  console.log("🔍 full listing from backend:", listing);
  console.log("🖼️ image fields:", {

    images: listing.images,
    image: listing.image,
    imageUrl: listing.imageUrl,
    photo: listing.photo,
    photoUrl: listing.photoUrl,
    coverImage: listing.coverImage,
  });

  const rating = ratingForListing(listing);
  const pricePerNight = Number(listing.pricePerNight ?? listing.price ?? 0);
  const normalizedType = normalizeType(listing.type);

  return {
    id: String(listing.id),
    title: listing.title,
    description: listing.description,
    location: listing.location,
    pricePerNight,
    price: pricePerNight,
    rating,
    type: normalizedType,
    propertyType: normalizedType,
    superhost: listing.superhost ?? (rating ?? 0) >= 4.8,
    img: imagesForListing(listing),
    category: listing.category ?? categoryFromType(listing.type),
    hostName: hostNameForListing(listing),
    guests: Number(listing.guests ?? 1),
    amenities: listing.amenities ?? [],
    available: listing.available,
    availableFrom: listing.availableFrom,
    status: listing.status,
    hostId:
      listing.hostId ??
      listing.userId ??
      listing.ownerId ??
      listing.host?.id ??
      listing.hostUser?.id ??
      listing.owner?.id ??
      "",
  };
}

export function extractArray<T>(body: T[] | PaginatedResponse<T>) {
  return Array.isArray(body) ? body : body.data;
}

export function extractRecord<T>(body: T | { data: T }) {
  return "data" in (body as { data?: T }) ? (body as { data: T }).data : (body as T);
}

export function mapBooking(booking: BackendBooking): Booking {
  const totalPrice = Number(booking.totalPrice ?? booking.total ?? booking.price ?? 0);

  return {
    id: String(booking.id),
    listingId: String(booking.listingId ?? booking.listing?.id ?? ""),
    listingTitle: booking.listing?.title ?? booking.listingTitle ?? booking.title ?? "Stay",
    listingImage:
      booking.listing?.image ??
      booking.listing?.imageUrl ??
      booking.listing?.images?.[0] ??
      booking.listingImage ??
      undefined,
    guestId: booking.guestId ?? booking.userId ?? booking.guest?.id ?? undefined,
    userId: booking.userId ?? booking.guestId ?? booking.guest?.id ?? undefined,
    hostId: booking.hostId ?? booking.listing?.hostId ?? booking.host?.id ?? undefined,
    guestName: booking.guest?.name ?? booking.guestName ?? booking.name ?? undefined,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: Number(booking.guests ?? 1),
    totalPrice,
    status: booking.status ?? "pending",
  };
}

export const defaultListingImage = DEFAULT_LISTING_IMAGE;
