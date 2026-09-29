import { jsx as _jsx } from "react/jsx-runtime";
import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";
export default function AttendeeLogin() {
    return (_jsx(AuthLayout, { variant: "attendee", title: "Welcome back", subtitle: "Log in to find and join events.", children: _jsx(LoginForm, { variant: "attendee", redirectTo: "/events", signupPath: "/attendee/signup" }) }));
}
