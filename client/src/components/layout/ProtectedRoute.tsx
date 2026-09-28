import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AccessDenied from "./AccessDenied"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isStaff, loading } = useAuth()

  if (loading) return <p className="p-6 text-gray-500">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  if (!isStaff) return <AccessDenied message="This area is for organizers and admins only." />

  return <>{children}</>
}

export default ProtectedRoute