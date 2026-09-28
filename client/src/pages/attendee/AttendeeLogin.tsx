import AuthLayout from "../../components/auth/AuthLayout"
import LoginForm from "../../components/auth/LoginForm"

export default function AttendeeLogin() {
  return (
    <AuthLayout variant="attendee" title="Welcome back" subtitle="Log in to find and join events.">
      <LoginForm variant="attendee" redirectTo="/events" signupPath="/attendee/signup" />
    </AuthLayout>
  )
}