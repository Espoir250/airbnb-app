import { useQuery } from "@tanstack/react-query";
import {
  api,
  extractArray,
  mapBooking,
  mapListing,
  type BackendListing,
} from "../../../lib/api";
import { useAuth } from "../../auth/hooks/useAuth";

type PaginatedResponse<T> = {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function sameValue(left?: string | null, right?: string | null) {
  return !!left && !!right && left.trim().toLowerCase() === right.trim().toLowerCase();
}

function belongsToHost(listing: BackendListing, user: NonNullable<ReturnType<typeof useAuth>["user"]>) {
  return (
    sameValue(listing.hostId, user.id) ||
    sameValue(listing.userId, user.id) ||
    sameValue(listing.ownerId, user.id) ||
    sameValue(listing.host?.id, user.id) ||
    sameValue(listing.hostUser?.id, user.id) ||
    sameValue(listing.owner?.id, user.id) ||
    sameValue(listing.hostName, user.name) ||
    sameValue(listing.host?.name, user.name) ||
    sameValue(listing.host?.username, user.username) ||
    sameValue(listing.host?.email, user.email) ||
    sameValue(listing.hostUser?.name, user.name) ||
    sameValue(listing.hostUser?.username, user.username) ||
    sameValue(listing.hostUser?.email, user.email) ||
    sameValue(listing.owner?.name, user.name) ||
    sameValue(listing.owner?.username, user.username) ||
    sameValue(listing.owner?.email, user.email)
  );
}

export function useMyListings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["host-listings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const body = await api.get<BackendListing[] | PaginatedResponse<BackendListing>>(
        `/api/v1/listings/host/${user!.id}`,
      );

      return extractArray(body)
        .filter((listing) => belongsToHost(listing, user!))
        .map((listing) => {
          const mapped = mapListing(listing);
          return {
            ...mapped,
            hostId: mapped.hostId || user!.id,
            hostName: mapped.hostName ?? user!.name ?? user!.username,
          };
        });
    },
  });
}

export function useHostBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["host-bookings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const body = await api.get<any[] | PaginatedResponse<any>>(`/api/v1/bookings/host/${user!.id}`);

      return extractArray(body).map(mapBooking);
    },
  });
}
