import type { Listing } from "../features/listings/types";
import { listings as fallbackListings } from "../data/listings";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string ?? "").replace(/\/api\/v1\/?$/, "");
const DEFAULT_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";

type ApiErrorBody = {
  message?: string;
  error?: string;
};

type BackendListing = {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: "APARTMENT" | "HOUSE" | "HOTEL" | "VILLA" | "CABIN";
  category?: "HOUSE" | "APARTMENT" | "HOTEL";
  hostId?: string;
  userId?: string;
  ownerId?: string;
  hostName?: string | null;
  host?: {
    id?: string;
    name?: string | null;
    username?: string | null;
  } | null;
  hostUser?: {
    id?: string;
    name?: string | null;
    username?: string | null;
  } | null;
  owner?: {
    id?: string;
    name?: string | null;
    username?: string | null;
  } | null;
  amenities: string[];
  rating: number | null;
  averageRating?: number | null;
  avgRating?: number | null;
  reviewsAverage?: number | null;
  reviewCount?: number;
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

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    phone?: string;
  };
};

type RegisterInput = {
  name: string;
  username: string;
  phone: string;
  role: "GUEST" | "HOST" | "ADMIN";
  email: string;
  password: string;
  adminSecret?: string;
};

type CreateBookingInput = {
  userId: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  token: string;
};

export type Booking = {
  id: string;
  listingId: string;
  listingTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status?: string;
};

type BackendBooking = {
  id: string | number;
  listingId?: string | number | null;
  listing?: {
    id?: string | number | null;
    title?: string | null;
    hostId?: string | null;
  } | null;
  listingTitle?: string | null;
  title?: string | null;
  guestId?: string | null;
  userId?: string | null;
  hostId?: string | null;
  host?: { id?: string | null } | null;
  guest?: { id?: string | null } | null;
  checkIn: string;
  checkOut: string;
  guests?: number | string | null;
  status?: string | null;
};

export type CreateListingInput = {
  token: string;
  hostId: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: BackendListing["type"];
  amenities: string[];
  images: string[];
};

function apiUrl(path: string) {
  const url = `${API_BASE_URL}${path}`;
  // Prevent double /api/v1 if both base and path have it
  return url.replace("/api/v1/api/v1/", "/api/v1/");
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new Error(body.message || body.error || "Request failed");
  }

  return body;
}

function categoryFromType(type: BackendListing["type"]): Listing["category"] {
  switch (type) {
    case "CABIN":
    case "HOUSE":
      return "HOUSE";
    case "APARTMENT":
      return "APARTMENT";
    case "HOTEL":
    case "VILLA":
    default:
      return "HOTEL";
  }
}

function normalizeType(type: BackendListing["type"]): Listing["type"] {
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

function imageForType(type: BackendListing["type"]) {
  switch (type) {
    case "APARTMENT":
      return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop";
    case "HOUSE":
    case "CABIN":
      return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop";
    case "HOTEL":
    case "VILLA":
    default:
      return DEFAULT_LISTING_IMAGE;
  }
}

function ratingForListing(listing: BackendListing) {
  const explicitRating =
    listing.rating ??
    listing.averageRating ??
    listing.avgRating ??
    listing.reviewsAverage;

  if (typeof explicitRating === "number" && explicitRating > 0) {
    return explicitRating;
  }

  const reviewRatings = listing.reviews
    ?.map((review) => review.rating)
    .filter((rating): rating is number => typeof rating === "number");

  if (reviewRatings?.length) {
    return (
      reviewRatings.reduce((total, rating) => total + rating, 0) /
      reviewRatings.length
    );
  }

  return null;
}

function imagesForListing(listing: BackendListing) {
  const images = Array.isArray(listing.images)
    ? listing.images.filter(Boolean)
    : [];
  const singleImage =
    listing.image ??
    listing.imageUrl ??
    listing.photo ??
    listing.photoUrl ??
    listing.coverImage;

  if (images.length > 0) return images;
  if (singleImage) return [singleImage];

  return [imageForType(listing.type)];
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

function mapListing(listing: BackendListing): Listing {
  const images = imagesForListing(listing);
  const rating = ratingForListing(listing);

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    location: listing.location,
    pricePerNight: listing.pricePerNight,
    price: listing.pricePerNight,
    rating,
    type: normalizeType(listing.type),
    propertyType: normalizeType(listing.type),
    superhost: (rating ?? 0) >= 4.8,
    img: images,
    category: listing.category ?? categoryFromType(listing.type),
    hostName: hostNameForListing(listing),
    guests: listing.guests,
    amenities: listing.amenities,
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

function extractArray<T>(body: T[] | PaginatedResponse<T>) {
  return Array.isArray(body) ? body : body.data;
}

function extractRecord<T>(body: T | { data: T }) {
  return "data" in (body as { data?: T }) ? (body as { data: T }).data : (body as T);
}

function mapBooking(booking: BackendBooking): Booking {
  return {
    id: String(booking.id),
    listingId: String(booking.listingId ?? booking.listing?.id ?? ""),
    listingTitle:
      booking.listing?.title ?? booking.listingTitle ?? booking.title ?? "Stay",
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: Number(booking.guests ?? 1),
    status: booking.status ?? undefined,
  };
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(apiUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseJson<LoginResponse>(response);
}

export async function registerUser(input: RegisterInput) {
  const response = await fetch(apiUrl("/api/v1/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseJson(response);
}

export async function createBooking(input: CreateBookingInput) {
  const response = await fetch(apiUrl("/api/v1/bookings"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: input.userId,
      listingId: input.listingId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
    }),
  });

  return parseJson(response);
}

export async function fetchListings() {
  try {
    const response = await fetch(apiUrl("/api/v1/listings?limit=24"));
    const body = await parseJson<PaginatedResponse<BackendListing> | BackendListing[]>(
      response,
    );

    return extractArray(body).map(mapListing);
  } catch (error) {
    console.warn("Using local listings because the listings API is unavailable.", error);
    return fallbackListings;
  }
}

export async function fetchListingById(id: string) {
  const response = await fetch(apiUrl(`/api/v1/listings/${id}`));
  const body = await parseJson<BackendListing>(response);

  return mapListing(body);
}

export async function fetchGuestBookings(userId: string, token: string) {
  const response = await fetch(apiUrl("/api/v1/bookings"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await parseJson<PaginatedResponse<BackendBooking> | BackendBooking[]>(response);

  return extractArray(body)
    .filter((booking) => {
      const guestId = booking.guestId ?? booking.userId ?? booking.guest?.id;
      const hostId = booking.hostId ?? booking.listing?.hostId ?? booking.host?.id;
      return guestId === userId || hostId === userId;
    })
    .map(mapBooking);
}

export async function fetchHostListings(hostId: string, token: string) {
  const response = await fetch(apiUrl("/api/v1/listings"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await parseJson<PaginatedResponse<BackendListing> | BackendListing[]>(
    response,
  );

  return extractArray(body)
    .filter((listing) => {
      const ownerId =
        listing.hostId ??
        listing.userId ??
        listing.ownerId ??
        listing.host?.id ??
        listing.hostUser?.id ??
        listing.owner?.id;
      return ownerId === hostId;
    })
    .map(mapListing);
}

export async function createListing(input: CreateListingInput) {
  const images = input.images.length > 0 ? input.images : [DEFAULT_LISTING_IMAGE];
  const payload = {
    hostId: input.hostId,
    title: input.title,
    description: input.description,
    location: input.location,
    pricePerNight: input.pricePerNight,
    guests: input.guests,
    type: input.type,
    amenities: input.amenities,
    images,
    image: images[0],
    imageUrl: images[0],
    coverImage: images[0],
  };

  const response = await fetch(apiUrl("/api/v1/listings"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await parseJson<BackendListing | { data: BackendListing }>(response);
  return mapListing(extractRecord(body));
}
