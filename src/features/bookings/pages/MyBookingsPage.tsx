import { useRef, useState } from "react";
import { FaCalendarCheck, FaChartLine, FaHeart, FaSearch, FaSignOutAlt, FaSlidersH } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../shared/currency";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUploadAvatar } from "../../bookings/hooks/UseUploadAvatar";
import { useListings } from "../../listings/hooks/useListings";
import { useSavedListings } from "../../listings/hooks/useToggleSaved";
import { useCancelBooking, useMyBookings } from "../hooks/useMyBookings";

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function nightCount(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
}

function statusClass(status?: string) {
  return `statusPill status-${(status ?? "pending").toLowerCase()}`;
}

export function MyBookingsPage() {
  const [activePanel, setActivePanel] = useState("overview");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { user, logout } = useAuth();
  const { uploadAvatar, isUploading, error: uploadError } = useUploadAvatar();
  const { data: saved = [] } = useSavedListings();
  const { data: listings = [] } = useListings();
  const { data: bookings = [], isLoading, isError, error, refetch } = useMyBookings();
  const cancelBooking = useCancelBooking();

  const confirmed = bookings.filter((b) => b.status?.toLowerCase() === "confirmed").length;
  const pending = bookings.filter((b) => b.status?.toLowerCase() === "pending").length;
  const totalSpent = bookings
    .filter((b) => !["cancelled", "declined"].includes(b.status?.toLowerCase() ?? ""))
    .reduce((total, b) => total + b.totalPrice, 0);
  const savedListings = listings.filter((l) => saved.includes(String(l.id)));
  const routedPanel = hash === "#saved" ? "saved" : hash === "#bookings" ? "bookings" : activePanel;

  const displayAvatar = avatarUrl || (user as any)?.avatar || "";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) setAvatarUrl(url);
  }

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
          <button className="appButton" type="button" onClick={() => refetch()}>Try again</button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="emptyState">
          <h2>No bookings yet</h2>
          <p>When you request a stay, its pending or confirmed status will appear here.</p>
          <Link className="appButton" to="/">Explore listings</Link>
        </div>
      ) : (
        <div className="dataTable dataTableGuestBookings">
          <div className="dataTableHead">
            <span>Listing</span><span>Dates</span><span>Guests</span>
            <span>Status</span><span>Total</span><span>Action</span>
          </div>
          {bookings.map((booking) => {
            const nights = nightCount(booking.checkIn, booking.checkOut);
            const cancellable = ["pending", "confirmed"].includes(booking.status?.toLowerCase() ?? "");
            return (
              <div className="dataTableRow" key={booking.id}>
                <span className="tableListingCell">
                  {booking.listingImage && <img src={booking.listingImage} alt={booking.listingTitle} />}
                  <strong>{booking.listingTitle}</strong>
                </span>
                <span>{formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}</span>
                <span>{booking.guests} guest{booking.guests === 1 ? "" : "s"} · {nights} night{nights === 1 ? "" : "s"}</span>
                <span><span className={statusClass(booking.status)}>{booking.status ?? "pending"}</span></span>
                <span>{formatCurrency(booking.totalPrice)}</span>
                <span>
                  {cancellable ? (
                    <button type="button" disabled={cancelBooking.isPending}
                      onClick={() => window.confirm("Cancel this booking?") && cancelBooking.mutate(booking.id)}>
                      Cancel
                    </button>
                  ) : "No action"}
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

        {/* ✅ Avatar replaces brand logo */}
        <div className="dashboardBrand" style={{ flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}>
          {displayAvatar ? (
            <img src={displayAvatar} alt="Avatar"
              style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid #ff385c" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ff385c", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() ?? "G"}
            </div>
          )}
          <strong style={{ fontSize: 13 }}>{isUploading ? "Uploading..." : (user?.name ?? "Guest")}</strong>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

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
                <p className="dashboardLead">Track your stays, saved places, and booking status from one clean workspace.</p>
              </div>
            </section>
            <section className="metricGrid">
              <article className="metricCard"><span><FaCalendarCheck /></span><strong>{bookings.length}</strong><p>Total Bookings</p></article>
              <article className="metricCard"><span><FaCalendarCheck /></span><strong>{confirmed}</strong><p>Confirmed</p></article>
              <article className="metricCard"><span><FaCalendarCheck /></span><strong>{pending}</strong><p>Pending</p></article>
              <article className="metricCard"><span><FaHeart /></span><strong>{saved.length}</strong><p>Saved Stays</p></article>
              <article className="metricCard"><span><FaCalendarCheck /></span><strong>{formatCurrency(totalSpent)}</strong><p>Active Trip Value</p></article>
            </section>
          </>
        )}

        {(routedPanel === "overview" || routedPanel === "bookings") && bookingsPanel}

        {routedPanel === "saved" && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Selected stays</p><h2>Saved stays</h2></div>
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
                  <span>Listing</span><span>Location</span><span>Guests</span><span>Price</span><span>Action</span>
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
                    <span><Link className="appButton" to={`/listing/${listing.id}`}>Book</Link></span>
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
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Account</p><h2>Settings</h2></div>
            </div>
            {/* ✅ Avatar upload in settings too */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, maxWidth: 400 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Profile Photo</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar"
                    style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid #ff385c" }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ff385c", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700 }}>
                    {user?.name?.[0]?.toUpperCase() ?? "G"}
                  </div>
                )}
                <div>
                  <button className="appButton" type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Change Photo"}
                  </button>
                  {uploadError && <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 4 }}>{uploadError}</p>}
                </div>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}