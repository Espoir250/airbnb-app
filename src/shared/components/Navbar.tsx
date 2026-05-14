import { NavLink, useNavigate } from "react-router-dom";
import { useId, useState } from "react";
import { useStore } from "../../store/StoreContext";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSavedListings } from "../../features/listings/hooks/useToggleSaved";
import { FaUserCircle } from "react-icons/fa";
import styles from "./Navbar.module.css";

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <NavLink
        to="/"
        onClick={onNavigate}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/#contact"
        onClick={onNavigate}
        className={styles.navItem}
      >
        Contact
      </NavLink>
    </div>
  );
}

export function Navbar() {
  const { state } = useStore();
  const { data: saved = [] } = useSavedListings();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const savedCount = saved.length || state.saved.length;

  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();

  const go = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    go("/");
  };

  const handleSavedClick = () => {
    if (!isAuthenticated) {
      go("/login");
      return;
    }

    go(user?.role?.toUpperCase() === "HOST" ? "/host#reservations" : "/bookings#saved");
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} aria-label="Primary">
        {/* Logo */}
        <div
          className={styles.logo}
          role="button"
          tabIndex={0}
          onClick={() => go("/")}
        >
          Airbnb<span className={styles.logoAccent}>On.</span>
        </div>

        {/* Nav Links (desktop) */}
        <NavLinks
          className={styles.navLinks}
        />

        {/* Right Actions */}
        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            aria-label="Saved listings"
            onClick={handleSavedClick}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {savedCount > 0 && (
              <span className={styles.badge}>{savedCount}</span>
            )}
          </button>

          {isAuthenticated ? (
            <button className={styles.authBtn} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className={styles.loginIconBtn} onClick={() => go("/login")} aria-label="Login">
              <FaUserCircle />
            </button>
          )}

          {/* Mobile menu button */}
          <button
            className={styles.menuBtn}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={panelId}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className={styles.menuIcon} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>

      <div
        id={panelId}
        className={mobileOpen ? styles.mobilePanelOpen : styles.mobilePanel}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <NavLinks
          className={styles.mobileNavLinks}
          onNavigate={() => setMobileOpen(false)}
        />

        <div className={styles.mobileActions}>
          <button
            className={styles.iconBtn}
            aria-label="Saved listings"
            onClick={handleSavedClick}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {savedCount > 0 && (
              <span className={styles.badge}>{savedCount}</span>
            )}
          </button>

          {isAuthenticated ? (
            <button className={styles.authBtn} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className={styles.loginIconBtn} onClick={() => go("/login")} aria-label="Login">
              <FaUserCircle />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
