import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="min-h-screen bg-background pt-32 text-center text-text-soft">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default RequireAuth;