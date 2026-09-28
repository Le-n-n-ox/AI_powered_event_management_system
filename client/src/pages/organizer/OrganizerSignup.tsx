import AuthLayout from "../../components/auth/AuthLayout"
import SignupForm from "../../components/auth/SignupForm"

export default function OrganizerSignup() {
  return (
    <AuthLayout variant="organizer" title="Create organizer account" subtitle="Start running your events in minutes.">
      <SignupForm variant="organizer" redirectTo="/dashboard" loginPath="/organizer/login" />
    </AuthLayout>
  )
}