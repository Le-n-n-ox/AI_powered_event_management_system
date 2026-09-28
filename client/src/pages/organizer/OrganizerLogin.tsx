import AuthLayout from "../../components/auth/AuthLayout"
import LoginForm from "../../components/auth/LoginForm"

export default function OrganizerLogin() {
  return (
    <AuthLayout variant="organizer" title="Organizer login" subtitle="Manage your events and attendees.">
      <LoginForm variant="organizer" redirectTo="/dashboard" signupPath="/organizer/signup" />
    </AuthLayout>
  )
}