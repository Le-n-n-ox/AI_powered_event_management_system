import AuthLayout from "../../components/auth/AuthLayout"
import SignupForm from "../../components/auth/SignupForm"

export default function AttendeeSignup() {
  return (
    <AuthLayout variant="attendee" title="Create your account" subtitle="Register once, join events faster.">
      <SignupForm variant="attendee" redirectTo="/events" loginPath="/attendee/login" />
    </AuthLayout>
  )
}