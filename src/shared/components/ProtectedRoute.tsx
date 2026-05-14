import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to access this page.", { id: "protected-route-login" });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
