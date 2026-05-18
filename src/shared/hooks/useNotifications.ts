import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  extractArray,
  mapBooking,
  mapListing,
  type BackendListing,
  type Booking,
} from "../../lib/api";
import { useAuth } from "../../features/auth/hooks/useAuth";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  href: string;
  kind: "booking" | "listing";
};

type PaginatedResponse<T> = T[] | { data: T[] };

function sameValue(left?: string | null, right?: string | null) {
  return !!left && !!right && left.trim().toLowerCase() === right.trim().toLowerCase();
}

function readIds(key: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "guest";
  const storageKey = `notifications:${userId}:read`;

  const query = useQuery({
    queryKey: ["notifications", user?.id, user?.role],
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 30000,
    queryFn: async () => {
      if (!user) return [];

      const role = user.role?.toUpperCase();
      const notifications: AppNotification[] = [];

      if (role === "HOST") {
        const body = await api
          .get<PaginatedResponse<BackendListing>>(`/api/v1/listings/host/${user.id}`)
          .catch(() => [] as BackendListing[]);

        extractArray(body).map(mapListing).forEach((listing) => {
          const status = listing.status?.toUpperCase();
          if (status !== "APPROVED" && status !== "REJECTED") return;

          notifications.push({
            id: `listing-${listing.id}-${status}`,
            title: status === "APPROVED" ? "Listing approved" : "Listing rejected",
            message: `${listing.title} is ${status === "APPROVED" ? "now active" : "not approved yet"}.`,
            href: "/host#listings",
            kind: "listing",
          });
        });
      } else {
        const body = await api.get<PaginatedResponse<any>>("/api/v1/bookings").catch(() => []);

        extractArray(body).map(mapBooking).forEach((booking: Booking) => {
          const status = booking.status?.toLowerCase();
          const belongsToGuest =
            sameValue(booking.guestId, user.id) ||
            sameValue(booking.userId, user.id) ||
            sameValue(booking.guestName, user.name);

          if (!belongsToGuest || (status !== "confirmed" && status !== "cancelled" && status !== "declined")) return;

          notifications.push({
            id: `booking-${booking.id}-${status}`,
            title: status === "confirmed" ? "Booking approved" : "Booking declined",
            message: `${booking.listingTitle} was ${status === "confirmed" ? "approved by the host" : "not approved"}.`,
            href: "/bookings#bookings",
            kind: "booking",
          });
        });
      }

      return notifications;
    },
  });

  const read = readIds(storageKey);
  const notifications = query.data ?? [];
  const unread = useMemo(
    () => notifications.filter((notification) => !read.includes(notification.id)),
    [notifications, read],
  );

  function markAllRead() {
    localStorage.setItem(storageKey, JSON.stringify(notifications.map((notification) => notification.id)));
    queryClient.invalidateQueries({ queryKey: ["notifications", user?.id, user?.role] });
  }

  return {
    notifications,
    unreadCount: unread.length,
    markAllRead,
  };
}
