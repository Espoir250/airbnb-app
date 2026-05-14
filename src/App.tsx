import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import DashboardPage from "./features/auth/pages/DashboardPage";
import ListingDetail from "./features/auth/pages/ListingDetail";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import { AdminDashboard, AllBookingsPage, ModerationQueue } from "./features/admin";
import { MyBookingsPage } from "./features/bookings";
import { CreateListingPage, EditListingPage, HostDashboard } from "./features/host";
import { ListingsPage } from "./features/listings";
import { Navbar } from "./shared/components/Navbar";
import { Footer } from "./shared/components/Footer";
import { FooterBottom } from "./shared/components/FooterBottom";
import { NotFound } from "./shared/components/NotFound";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";

export default function App() {
  const { hash, pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!hash) return;
    requestAnimationFrame(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    });
  }, [hash, pathname]);

  return (
    <>
      {!isAuthPage && <Navbar />}

      <Routes>
        <Route path="/" element={<ListingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host"
          element={
            <ProtectedRoute>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/listings/new"
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/listings/:id/edit"
          element={
            <ProtectedRoute>
              <EditListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute>
              <ModerationQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <AllBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {isHomePage && <Footer />}         {/* contact section — home page only */}
      {!isAuthPage && <FooterBottom />}  {/* copyright bar — all pages except auth */}
    </>
  );
}
