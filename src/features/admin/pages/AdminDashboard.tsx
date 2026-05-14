import { useRef, useState } from "react";
import { FaBuilding, FaCalendarCheck, FaChartLine, FaEnvelope, FaHome, FaPlus, FaSignOutAlt, FaSlidersH, FaTrash, FaUserPlus, FaUsers } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../shared/currency";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUploadAvatar } from "../../bookings/hooks/UseUploadAvatar";
import { useAdminStats, useAdminUsers, useAllBookings, useDeleteUser } from "../hooks/useAdminStats";

export function AdminDashboard() {
  const [activePanel, setActivePanel] = useState("overview");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { uploadAvatar, isUploading, error: uploadError } = useUploadAvatar();
  const { data, isLoading, isError } = useAdminStats();
  const { data: users = [], isLoading: usersLoading, isError: usersError } = useAdminUsers();
  const { data: bookings = [], isLoading: bookingsLoading, isError: bookingsError } = useAllBookings({ status: "all", start: "", end: "", page: 1 });
  const deleteUser = useDeleteUser();

  const displayAvatar = avatarUrl || (user as any)?.avatar || "";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) setAvatarUrl(url);
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
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
          )}
          <strong style={{ fontSize: 13 }}>{isUploading ? "Uploading..." : (user?.name ?? "Admin")}</strong>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

        <p className="sidebarLabel">Admin panel</p>
        <nav className="sidebarNav">
          <button className={activePanel === "overview" ? "active" : ""} type="button" onClick={() => setActivePanel("overview")}><FaChartLine /> Overview</button>
          <button className={activePanel === "users" ? "active" : ""} type="button" onClick={() => setActivePanel("users")}><FaUsers /> Users</button>
          <button className={activePanel === "listings" ? "active" : ""} type="button" onClick={() => setActivePanel("listings")}><FaBuilding /> Listings</button>
          <button className={activePanel === "bookings" ? "active" : ""} type="button" onClick={() => setActivePanel("bookings")}><FaCalendarCheck /> Bookings</button>
          <button className={activePanel === "messages" ? "active" : ""} type="button" onClick={() => setActivePanel("messages")}><FaEnvelope /> Messages</button>
          <button className={activePanel === "settings" ? "active" : ""} type="button" onClick={() => setActivePanel("settings")}><FaSlidersH /> Settings</button>
        </nav>
        <button className="sidebarLogout" type="button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <section className="dashboardWorkspace">
        <input className="dashboardSearch" placeholder="Search dashboard..." />

        {activePanel === "overview" && (
          <>
            <section className="dashboardHero">
              <div>
                <p className="dashboardBadge">Admin Dashboard</p>
                <h1 className="dashboardTitle">Welcome back, {user?.name ?? "System Admin"}</h1>
                <p className="dashboardLead">Manage users, listings, bookings, and platform activity from one clean dashboard.</p>
              </div>
            </section>
            {isLoading ? <div className="pageSpinner" /> : isError ? <p className="emptyState">Could not load admin stats.</p> : (
              <section className="metricGrid">
                <article className="metricCard"><span><FaUsers /></span><strong>{data?.totalUsers ?? users.length}</strong><p>Total Users</p></article>
                <article className="metricCard"><span><FaBuilding /></span><strong>{data?.totalListings ?? 0}</strong><p>Total Listings</p></article>
                <article className="metricCard"><span><FaCalendarCheck /></span><strong>{data?.totalBookings ?? 0}</strong><p>Total Bookings</p></article>
                <Link className="metricCard metricLink" to="/register"><span><FaUserPlus /></span><strong>Add</strong><p>Create User</p></Link>
                <Link className="metricCard metricLink" to="/host/listings/new"><span><FaPlus /></span><strong>Add</strong><p>Create Listing</p></Link>
              </section>
            )}
          </>
        )}

        {(activePanel === "overview" || activePanel === "users") && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Access</p><h2>Users</h2></div>
            </div>
            {usersLoading ? <div className="pageSpinner" /> : usersError ? (
              <p className="emptyState">Could not load users. Confirm the backend exposes /api/v1/users.</p>
            ) : users.length === 0 ? <p className="emptyState">No users found.</p> : (
              <div className="dataTable">
                <div className="dataTableHead">
                  <span>Name</span><span>Email</span><span>Role</span><span>Action</span>
                </div>
                {users.map((account) => (
                  <div className="dataTableRow" key={account.id}>
                    <span>{account.name ?? account.username ?? "Unnamed user"}</span>
                    <span>{account.email ?? "No email"}</span>
                    <span>{account.role ?? "USER"}</span>
                    <button type="button" disabled={deleteUser.isPending || account.id === user?.id}
                      onClick={() => { if (window.confirm("Delete this user?")) deleteUser.mutate(account.id); }}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activePanel === "listings" && (
          <section className="dashboardPanel emptyState">
            <h2>Listings</h2>
            <p>Review pending listings and moderation actions.</p>
            <Link className="appButton" to="/admin/moderation">Open moderation queue</Link>
          </section>
        )}

        {activePanel === "bookings" && (
          <section className="dashboardPanel">
            <div className="sectionHeader">
              <div><p className="eyebrow">Bookings</p><h2>All bookings</h2></div>
              <Link className="appButton" to="/admin/bookings">Open full page</Link>
            </div>
            {bookingsLoading ? <div className="pageSpinner" /> : bookingsError ? (
              <p className="emptyState">Could not load bookings.</p>
            ) : bookings.length === 0 ? <p className="emptyState">No bookings found.</p> : (
              <div className="bookingList">
                {bookings.map((booking) => (
                  <article className="bookingRow compact" key={booking.id}>
                    <div className="bookingRowMain">
                      <div>
                        <span className={`statusPill status-${booking.status?.toLowerCase() ?? "pending"}`}>{booking.status ?? "pending"}</span>
                        <h2>{booking.listingTitle}</h2>
                        <p>Guest: {booking.guestName ?? "Guest"}</p>
                      </div>
                      <div className="bookingFacts">
                        <span>{booking.checkIn} to {booking.checkOut}</span>
                        <span>{booking.guests} guest{booking.guests === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                    <div className="bookingRowAside">
                      <strong>{formatCurrency(booking.totalPrice)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activePanel === "messages" && (
          <section className="dashboardPanel emptyState">
            <h2>Messages</h2>
            <p>Platform messages will appear here when available.</p>
          </section>
        )}

        {activePanel === "settings" && (
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
                    {user?.name?.[0]?.toUpperCase() ?? "A"}
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