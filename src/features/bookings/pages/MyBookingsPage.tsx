import { useState } from "react";
import { FaCalendarCheck, FaChartLine, FaHeart, FaHome, FaSearch, FaSignOutAlt, FaSlidersH } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../shared/currency";
import { useAuth } from "../../auth/hooks/useAuth";
import { useListings } from "../../listings/hooks/useListings";
import { useSavedListings } from "../../listings/hooks/useToggleSaved";
import { useCancelBooking, useMyBookings } from "../hooks/useMyBookings";

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function nightCount(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(
    0,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  );
}

function statusClass(status?: string) {
  return `statusPill status-${(status ?? "pending").toLowerCase()}`;
}

export function MyBookingsPage() {
  const [activePanel, setActivePanel] = useState("overview");
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { user, logout } = useAuth();
  const { data: saved = [] } = useSavedListings();
  const { data: listings = [] } = useListings();
  const { data: bookings = [], isLoading, isError, error, refetch } = useMyBookings();
  const cancelBooking = useCancelBooking();

  const confirmed = bookings.filter((booking) => booking.status?.toLowerCase() === "confirmed").length;
  const pending = bookings.filter((booking) => booking.status?.toLowerCase() === "pending").length;
  const totalSpent = bookings
    .filter((booking) => !["cancelled", "declined"].includes(booking.status?.toLowerCase() ?? ""))
    .reduce((total, booking) => total + booking.totalPrice, 0);
  const savedListings = listings.filter((listing) => saved.includes(String(listing.id)));
  const routedPanel =
    hash === "#saved" ? "saved" : hash === "#bookings" ? "bookings" : activePanel;

  function showPanel(panel: string) {
    setActivePanel(panel);
    navigate("/bookings", { replace: true });
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const bookingsPanel = (
    <section className="dashboardPanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Reservations</p>
          <h2>Booking status</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="pageSpinner" />
      ) : isError ? (
        <div className="emptyState">
          <p>{error instanceof Error ? error.message : "Could not load bookings."}</p>
          <button className="appButton" type="button" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="emptyState">
          <h2>No bookings yet</h2>
          <p>When you request a stay, its pending or confirmed status will appear here.</p>
          <Link className="appButton" to="/">
            Explore listings
          </Link>
        </div>
      ) : (
        <div className="dataTable dataTableGuestBookings">
          <div className="dataTableHead">
            <span>Listing</span>
            <span>Dates</span>
            <span>Guests</span>
            <span>Status</span>
            <span>Total</span>
            <span>Action</span>
          </div>
          {bookings.map((booking) => {
            const nights = nightCount(booking.checkIn, booking.checkOut);
            const cancellable = ["pending", "confirmed"].includes(
              booking.status?.toLowerCase() ?? "",
            );

            return (
              <div className="dataTableRow" key={booking.id}>
                <span className="tableListingCell">
                  {booking.listingImage && (
                    <img src={booking.listingImage} alt={booking.listingTitle} />
                  )}
                  <strong>{booking.listingTitle}</strong>
                </span>
                <span>{formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}</span>
                <span>{booking.guests} guest{booking.guests === 1 ? "" : "s"} · {nights} night{nights === 1 ? "" : "s"}</span>
                <span><span className={statusClass(booking.status)}>{booking.status ?? "pending"}</span></span>
                <span>{formatCurrency(booking.totalPrice)}</span>
                <span>
                  {cancellable ? (
                    <button
                      type="button"
                      disabled={cancelBooking.isPending}
                      onClick={() =>
                        window.confirm("Cancel this booking?") && cancelBooking.mutate(booking.id)
                      }
                    >
                      Cancel
                    </button>
                  ) : (
                    "No action"
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <main className="dashboardShell proDashboard">
      <aside className="dashboardSidebar">
        <Link className="dashboardBrand" to="/">
          <span><FaHome /></span>
          <strong>Stays</strong>
        </Link>
        <p className="sidebarLabel">Guest panel</p>
        <nav className="sidebarNav">
          <button className={routedPanel === "overview" ? "active" : ""} type="button" onClick={() => showPanel("overview")}><FaChartLine /> Overview</button>
          <button className={routedPanel === "bookings" ? "active" : ""} type="button" onClick={() => showPanel("bookings")}><FaCalendarCheck /> My Bookings</button>
          <button className={routedPanel === "saved" ? "active" : ""} type="button" onClick={() => showPanel("saved")}><FaHeart /> Saved</button>
          <button className={routedPanel === "discover" ? "active" : ""} type="button" onClick={() => showPanel("discover")}><FaSearch /> Discover</button>
          <button className={routedPanel === "settings" ? "active" : ""} type="button" onClick={() => showPanel("settings")}><FaSlidersH /> Settings</button>
        </nav>
        <button className="sidebarLogout" type="button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <section className="dashboardWorkspace">
        <input className="dashboardSearch" placeholder="Search dashboard..." />

        {routedPanel === "overview" && (
          <>
            <section className="dashboardHero">
              <div>
                <p className="dashboardBadge">Guest Dashboard</p>
                <h1 className="dashboardTitle">Welcome back, {user?.name ?? "Guest"}</h1>
                <p className="dashboardLead">
                  Track your stays, saved places, and booking status from one clean workspace.
                </p>
              </div>
            </section>

            <section className="metricGrid">
              <article className="metricCard">
                <span><FaCalendarCheck /></span>
                <strong>{bookings.length}</strong>
                <p>Total Bookings</p>
              </article>
              <article className="metricCard">
                <span><FaCalendarCheck /></span>
                <strong>{confirmed}</strong>
                <p>Confirmed</p>
              </article>
              <article className="metricCard">
                <span><FaCalendarCheck /></span>
                <strong>{pending}</strong>
                <p>Pending</p>
              </article>
              <article className="metricCard">
                <span><FaHeart /></span>
                <strong>{saved.length}</strong>
                <p>Saved Stays</p>
              </article>
              <article className="metricCard">
                <span><FaCalendarCheck /></span>
                <strong>{formatCurrency(totalSpent)}</strong>
                <p>Active Trip Value</p>
              </article>
            </section>
          </>
        )}

        {(routedPanel === "overview" || routedPanel === "bookings") && bookingsPanel}

        {routedPanel === "saved" && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Selected stays</p>
                <h2>Saved stays</h2>
              </div>
              <Link className="appButton" to="/">Browse listings</Link>
            </div>

            {savedListings.length === 0 ? (
              <div className="emptyState">
                <h2>No saved stays yet</h2>
                <p>Tap the heart on a listing, then come back here to book it.</p>
              </div>
            ) : (
              <div className="dataTable dataTableSavedListings">
                <div className="dataTableHead">
                  <span>Listing</span>
                  <span>Location</span>
                  <span>Guests</span>
                  <span>Price</span>
                  <span>Action</span>
                </div>
                {savedListings.map((listing) => (
                  <div className="dataTableRow" key={listing.id}>
                    <span className="tableListingCell">
                      <img src={listing.img?.[0] ?? "https://placehold.co/80x64?text=Stay"} alt={listing.title} />
                      <strong>{listing.title}</strong>
                    </span>
                    <span>{listing.location}</span>
                    <span>{listing.guests} guest{listing.guests === 1 ? "" : "s"}</span>
                    <span>{formatCurrency(listing.price ?? listing.pricePerNight)} / night</span>
                    <span>
                      <Link className="appButton" to={`/listing/${listing.id}`}>
                        Book
                      </Link>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {routedPanel === "discover" && (
          <section className="dashboardPanel emptyState">
            <h2>Discover</h2>
            <p>Find more places to stay.</p>
            <Link className="appButton" to="/">Explore stays</Link>
          </section>
        )}

        {routedPanel === "settings" && (
          <section className="dashboardPanel emptyState">
            <h2>Settings</h2>
            <p>Guest settings will appear here.</p>
          </section>
        )}
      </section>
    </main>
  );
}
