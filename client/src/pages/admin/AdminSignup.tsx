import AuthLayout from "../../components/auth/AuthLayout"
import SignupForm from "../../components/auth/SignupForm"

export default function AdminSignup() {
  return (
    <AuthLayout variant="admin" title="Create admin account" subtitle="An invite code is required.">
      <SignupForm variant="admin" redirectTo="/dashboard" loginPath="/admin/login" />
    </AuthLayout>
  )
}