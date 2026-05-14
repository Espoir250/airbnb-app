import { Navigate } from "react-router-dom";
import { MyBookingsPage } from "../../bookings";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();

  if (role === "HOST") return <Navigate to="/host" replace />;
  if (role === "ADMIN") return <Navigate to="/admin" replace />;

  return <MyBookingsPage />;
}
