import { useRef, useState } from "react";
import { FaBuilding, FaCalendarCheck, FaChartLine, FaEnvelope, FaHome, FaMoneyBillWave, FaPlus, FaSignOutAlt, FaSlidersH } from "react-icons/fa";
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

export function HostDashboard() {
  const [activePanel, setActivePanel] = useState("overview");
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

  const totalEarnings = bookings.filter((b) => b.status?.toLowerCase() === "confirmed").reduce((t, b) => t + b.totalPrice, 0);
  const pendingBookings = bookings.filter((b) => b.status?.toLowerCase() === "pending").length;
  const categorizedListings = LISTING_CATEGORIES.map((category) => ({
    ...category,
    listings: listings.filter((l) => normalizeFormCategory(l.category ?? l.type) === category.value),
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
    navigate("/host", { replace: true });
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

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
              {user?.name?.[0]?.toUpperCase() ?? "H"}
            </div>
          )}
          <strong style={{ fontSize: 13 }}>{isUploading ? "Uploading..." : (user?.name ?? "Host")}</strong>
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
            <section className="dashboardHero">
              <div>
                <p className="dashboardBadge">Host Dashboard</p>
                <h1 className="dashboardTitle">Welcome back, {user?.name ?? "Host"}</h1>
                <p className="dashboardLead">Track your listings, reservations, and earnings from one professional workspace.</p>
              </div>
            </section>
            <section className="metricGrid">
              <article className="metricCard"><span><FaBuilding /></span><strong>{listings.length}</strong><p>Listings Created</p></article>
              <article className="metricCard"><span><FaCalendarCheck /></span><strong>{bookings.length}</strong><p>Reservations</p></article>
              <article className="metricCard"><span><FaMoneyBillWave /></span><strong>{formatCurrency(totalEarnings)}</strong><p>Total Earnings</p></article>
              <Link className="metricCard metricLink" to="/host/listings/new"><span><FaPlus /></span><strong>Add</strong><p>Create Listing</p></Link>
            </section>
          </>
        )}

        {(routedPanel === "overview" || routedPanel === "listings") && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Inventory</p><h2>Your listings</h2></div>
              <div className="buttonRow">
                <p className="refreshNote">{pendingBookings} pending booking request{pendingBookings === 1 ? "" : "s"}</p>
                <Link className="appButton" to="/host/listings/new"><FaPlus /> Add Listing</Link>
              </div>
            </div>
            {isLoading ? <div className="pageSpinner" /> : listings.length === 0 ? (
              <div className="emptyState"><h2>No listings yet</h2><p>Create your first place so guests can start booking.</p></div>
            ) : (
              <div className="categoryTableStack">
                {categorizedListings.map((group) => (
                  <section className="categoryTableGroup" key={group.value}>
                    <div className="categoryTableHeader">
                      <h3>{group.label}</h3>
                      <span>{group.listings.length} listing{group.listings.length === 1 ? "" : "s"}</span>
                    </div>
                    {group.listings.length === 0 ? (
                      <p className="emptyState">No {group.label.toLowerCase()} listings yet.</p>
                    ) : (
                      <div className="dataTable dataTableListings">
                        <div className="dataTableHead">
                          <span>Listing</span><span>Location</span><span>Category</span>
                          <span>Status</span><span>Price</span><span>Action</span>
                        </div>
                        {group.listings.map((listing) => (
                          <div className="dataTableRow" key={listing.id}>
                            <span className="tableListingCell">
                              <img src={listing.img?.[0] ?? "https://placehold.co/80x64?text=Stay"} alt={listing.title} />
                              <span>
                                <strong>{listing.title}</strong>
                                <small>Host: {listing.hostName ?? user?.name ?? "You"}</small>
                              </span>
                            </span>
                            <span>{listing.location}</span>
                            <span>{categoryLabel(listing.category ?? listing.type)}</span>
                            <span><span className={statusClass(listing.status)}>{listing.status ?? "draft"}</span></span>
                            <span>{formatCurrency(listing.price)} / night</span>
                            <div className="buttonRow">
                              <Link to={`/listing/${listing.id}`}>View</Link>
                              <Link to={`/host/listings/${listing.id}/edit`}>Edit</Link>
                              <button type="button"
                                onClick={() => { if (window.confirm("Delete this listing?")) deleteListing.mutate(listing.id); }}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </section>
        )}

        {(routedPanel === "overview" || routedPanel === "reservations") && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Requests</p><h2>Guest bookings</h2></div>
            </div>
            {bookings.length === 0 ? <p className="emptyState">No bookings for your listings yet.</p> : (
              <div className="dataTable dataTableBookings">
                <div className="dataTableHead">
                  <span>Listing</span><span>Guest</span><span>Dates</span>
                  <span>Status</span><span>Total</span><span>Action</span>
                </div>
                {bookings.map((booking) => (
                  <div className="dataTableRow" key={booking.id}>
                    <span>{booking.listingTitle}</span>
                    <span>{booking.guestName ?? "Guest"}</span>
                    <span>{booking.checkIn} to {booking.checkOut} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}</span>
                    <span><span className={statusClass(booking.status)}>{booking.status}</span></span>
                    <span>{formatCurrency(booking.totalPrice)}</span>
                    <span>
                      {booking.status?.toLowerCase() === "pending" ? (
                        <div className="buttonRow">
                          <button type="button" onClick={() => approveBooking.mutate(booking.id)}>Approve</button>
                          <button type="button" onClick={() => declineBooking.mutate(booking.id)}>Decline</button>
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