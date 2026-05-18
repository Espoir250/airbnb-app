import { useRef, useState } from "react";
import { FaBuilding, FaCalendarCheck, FaChartLine, FaCheck, FaEdit, FaEnvelope, FaEye, FaMoneyBillWave, FaPlus, FaSignOutAlt, FaSlidersH, FaTimes, FaTrash } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../shared/currency";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUploadAvatar } from "../../bookings/hooks/UseUploadAvatar";
import { useDeleteListing, useUpdateHostBookingStatus } from "../hooks/useDeleteListing";
import { useHostBookings, useMyListings } from "../hooks/useMyListings";
import { LISTING_CATEGORIES, categoryLabel, normalizeFormCategory } from "../utils/listingPayload";

function statusClass(status?: string) {
  return `statusPill status-${(status ?? "draft").toLowerCase()}`;
}

function statusLabel(status?: string) {
  const normalized = status?.toUpperCase();
  if (normalized === "APPROVED" || normalized === "PUBLISHED") return "Active";
  if (normalized === "PENDING") return "Pending";
  if (normalized === "REJECTED") return "Rejected";
  return status ?? "Draft";
}

export function HostDashboard() {
  const [activePanel, setActivePanel] = useState("overview");
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { uploadAvatar, isUploading, error: uploadError } = useUploadAvatar();
  const { data: listings = [], isLoading } = useMyListings();
  const { data: bookings = [] } = useHostBookings();
  const deleteListing = useDeleteListing();
  const approveBooking = useUpdateHostBookingStatus("confirmed");
  const declineBooking = useUpdateHostBookingStatus("declined");

  const displayedBookings = selectedListing ? bookings.filter((b) => String(b.listingId) === selectedListing) : bookings;

  const totalEarnings = bookings.filter((b) => b.status?.toLowerCase() === "confirmed").reduce((t, b) => t + b.totalPrice, 0);
  const pendingBookings = bookings.filter((b) => b.status?.toLowerCase() === "pending").length;
  const categoryCounts = LISTING_CATEGORIES.map((category) => ({
    ...category,
    count: listings.filter((l) => normalizeFormCategory(l.category ?? l.type) === category.value).length,
  }));
  const routedPanel = hash === "#reservations" ? "reservations" : hash === "#listings" ? "listings" : activePanel;
  const displayAvatar = avatarUrl || (user as any)?.avatar || "";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) setAvatarUrl(url);
  }

  function showPanel(panel: string) {
    setActivePanel(panel);
    setSelectedListing(null);
    navigate(`/host#${panel}`, { replace: true });
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main className="dashboardShell proDashboard">
      <aside className="dashboardSidebar">

        <div className="hostProfileButton" onClick={() => fileInputRef.current?.click()}>
          {displayAvatar ? (
            <img src={displayAvatar} alt="Avatar" />
          ) : (
            <span>
              {user?.name?.[0]?.toUpperCase() ?? "H"}
            </span>
          )}
          <div>
            <strong>{isUploading ? "Uploading..." : (user?.name ?? "Host")}</strong>
            <small>Host account</small>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

        <p className="sidebarLabel">Host panel</p>
        <nav className="sidebarNav">
          <button className={routedPanel === "overview" ? "active" : ""} type="button" onClick={() => showPanel("overview")}><FaChartLine /> Overview</button>
          <button className={routedPanel === "listings" ? "active" : ""} type="button" onClick={() => showPanel("listings")}><FaBuilding /> My Listings</button>
          <button className={routedPanel === "reservations" ? "active" : ""} type="button" onClick={() => showPanel("reservations")}><FaCalendarCheck /> Reservations</button>
          <button className={routedPanel === "earnings" ? "active" : ""} type="button" onClick={() => showPanel("earnings")}><FaMoneyBillWave /> Earnings</button>
          <button className={routedPanel === "messages" ? "active" : ""} type="button" onClick={() => showPanel("messages")}><FaEnvelope /> Messages</button>
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
            <section className="dashboardHero hostWelcomePanel">
              <div>
                <p className="dashboardBadge">Host Dashboard</p>
                <h1 className="dashboardTitle">Welcome back, {user?.name ?? "Host"}</h1>
                <p className="dashboardLead">Track your listings, reservations, and earnings from one professional workspace.</p>
              </div>
              <Link className="appButton hostHeroAction" to="/host/listings/new"><FaPlus /> Create Listing</Link>
            </section>
            <section className="metricGrid">
              <article className="metricCard"><span><FaBuilding /></span><strong>{listings.length}</strong><p>Listings Created</p></article>
              <article className="metricCard" onClick={() => showPanel("reservations")} style={{ cursor: "pointer" }}><span><FaCalendarCheck /></span><strong>{bookings.length}</strong><p>Reservations</p></article>
              <article className="metricCard"><span><FaMoneyBillWave /></span><strong>{formatCurrency(totalEarnings)}</strong><p>Total Earnings</p></article>
              <Link className="metricCard metricLink" to="/host/listings/new"><span><FaPlus /></span><strong>Add</strong><p>Create Listing</p></Link>
            </section>
          </>
        )}

        {(routedPanel === "overview" || routedPanel === "listings") && (
          <section className="dashboardPanel hostListingsPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Inventory</p><h2>My Listings</h2></div>
              <div className="buttonRow">
                <p className="refreshNote">{pendingBookings} pending booking request{pendingBookings === 1 ? "" : "s"}</p>
                <Link className="appButton" to="/host/listings/new"><FaPlus /> Create Listing</Link>
              </div>
            </div>
            <div className="hostCategoryStrip">
              {categoryCounts.map((category) => (
                <span key={category.value}>{category.label}: <strong>{category.count}</strong></span>
              ))}
            </div>
            {isLoading ? <div className="pageSpinner" /> : listings.length === 0 ? (
              <div className="emptyState"><h2>No listings yet</h2><p>Create your first place so guests can start booking.</p></div>
            ) : (
              <div className="dataTable dataTableListings hostListingsTable">
                <div className="dataTableHead">
                  <span>Image</span><span>Title</span><span>Location</span>
                  <span>Price</span><span>Status</span><span>Action</span>
                </div>
                {listings.map((listing) => (
                  <div className="dataTableRow" key={listing.id}>
                    <span className="hostListingImage">
                      <img src={listing.img?.[0] ?? "https://placehold.co/80x64?text=Stay"} alt={listing.title} />
                    </span>
                    <span className="hostListingTitle">
                      <strong>{listing.title}</strong>
                      <small>{categoryLabel(listing.category ?? listing.type)}</small>
                    </span>
                    <span>{listing.location}</span>
                    <span>{formatCurrency(listing.price)}</span>
                    <span><span className={statusClass(listing.status)}>{statusLabel(listing.status)}</span></span>
                    <div className="hostActionGroup">
                      <Link className="hostActionView" to={`/listing/${listing.id}`}><FaEye /> View</Link>
                      <Link className="hostActionEdit" to={`/host/listings/${listing.id}/edit`}><FaEdit /> Edit</Link>
                      <button type="button"
                        onClick={() => { if (window.confirm("Delete this listing?")) deleteListing.mutate(listing.id); }}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {(routedPanel === "overview" || routedPanel === "reservations") && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Requests</p><h2>Guest bookings</h2></div>
              <div className="buttonRow">
                <select 
                  className="appButton" 
                  style={{ backgroundColor: "#fff", color: "#111827", border: "1px solid #d7d4dd" }}
                  value={selectedListing ?? ""} 
                  onChange={(e) => setSelectedListing(e.target.value || null)}
                >
                  <option value="">All your listings</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
                {selectedListing && (
                  <button className="appButton" onClick={() => setSelectedListing(null)}>
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
            {displayedBookings.length === 0 ? <p className="emptyState">No bookings for {selectedListing ? "this listing" : "your listings"} yet.</p> : (
              <div className="dataTable dataTableBookings">
                <div className="dataTableHead">
                  <span>Listing</span><span>Guest</span><span>Dates</span>
                  <span>Status</span><span>Total</span><span>Action</span>
                </div>
                {displayedBookings.map((booking) => (
                  <div className="dataTableRow" key={booking.id}>
                    <span>{booking.listingTitle}</span>
                    <span>{booking.guestName ?? "Guest"}</span>
                    <span>{booking.checkIn} to {booking.checkOut} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}</span>
                    <span><span className={statusClass(booking.status)}>{booking.status}</span></span>
                    <span>{formatCurrency(booking.totalPrice)}</span>
                    <span>
                      {booking.status?.toLowerCase() === "pending" ? (
                        <div className="buttonRow">
                          <button type="button" className="btn-approve" onClick={() => approveBooking.mutate(booking.id)}><FaCheck /> Approve</button>
                          <button type="button" onClick={() => declineBooking.mutate(booking.id)}><FaTimes /> Decline</button>
                        </div>
                      ) : "No action"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {routedPanel === "earnings" && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Earnings</p><h2>Revenue summary</h2></div>
            </div>
            <div className="metricGrid">
              <article className="metricCard"><span><FaMoneyBillWave /></span><strong>{formatCurrency(totalEarnings)}</strong><p>Confirmed Earnings</p></article>
              <article className="metricCard"><span><FaCalendarCheck /></span><strong>{bookings.length}</strong><p>Total Reservations</p></article>
            </div>
          </section>
        )}

        {routedPanel === "messages" && (
          <section className="dashboardPanel emptyState">
            <h2>Messages</h2>
            <p>Guest messages will appear here when the backend provides them.</p>
          </section>
        )}

        {routedPanel === "settings" && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Account</p><h2>Settings</h2></div>
            </div>
            {/* ✅ Avatar upload in settings */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, maxWidth: 400 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Profile Photo</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar"
                    style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid #ff385c" }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ff385c", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700 }}>
                    {user?.name?.[0]?.toUpperCase() ?? "H"}
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
