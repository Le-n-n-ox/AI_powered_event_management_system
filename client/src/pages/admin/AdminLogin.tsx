import AuthLayout from '../../components/auth/AuthLayout'; // Used relative path to match your LoginForm import
import LoginForm from "../../components/auth/LoginForm"

export default function AdminLogin() {
  return (
    <AuthLayout variant="admin" title="Admin sign in" subtitle="Access the platform-wide dashboard.">
      <LoginForm variant="admin" redirectTo="/dashboard" signupPath="/admin/signup" />
    </AuthLayout>
  )
}