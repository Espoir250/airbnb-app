import { useState } from "react";
import { formatCurrency } from "../../../shared/currency";
import { useAllBookings, type BookingFilters } from "../hooks/useAdminStats";

export function AllBookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({
    status: "all",
    start: "",
    end: "",
    page: 1,
  });
  const { data: bookings = [], isFetching, isLoading } = useAllBookings(filters);

  function updateFilter(next: Partial<BookingFilters>) {
    setFilters((current) => ({ ...current, ...next, page: next.page ?? 1 }));
  }

  return (
    <main className="appPage">
      <section className="appCard">
        <h1 className="appTitle">All bookings</h1>
        <div className="filtersBar">
          <select
            value={filters.status}
            onChange={(event) => updateFilter({ status: event.target.value })}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filters.start}
            onChange={(event) => updateFilter({ start: event.target.value })}
          />
          <input
            type="date"
            value={filters.end}
            onChange={(event) => updateFilter({ end: event.target.value })}
          />
        </div>

        {isLoading ? (
          <div className="pageSpinner" />
        ) : bookings.length === 0 ? (
          <p className="emptyState">No bookings match these filters.</p>
        ) : (
          <div className="cardGrid">
            {bookings.map((booking) => (
              <article className="managementCard" key={booking.id}>
                <div>
                  <span className="statusPill">{booking.status}</span>
                  <h2>{booking.listingTitle}</h2>
                  <p>Guest: {booking.guestName ?? "Guest"}</p>
                  <p>
                    {booking.checkIn} to {booking.checkOut}
                  </p>
                  <strong>{formatCurrency(booking.totalPrice)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}

        {isFetching && <p className="refreshNote">Refreshing...</p>}
        <div className="buttonRow">
          <button
            disabled={filters.page === 1}
            onClick={() => updateFilter({ page: Math.max(1, filters.page - 1) })}
          >
            Previous
          </button>
          <span>Page {filters.page}</span>
          <button onClick={() => updateFilter({ page: filters.page + 1 })}>Next</button>
        </div>
      </section>
    </main>
  );
}
