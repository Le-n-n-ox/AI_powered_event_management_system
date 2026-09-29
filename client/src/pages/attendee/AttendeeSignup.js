import { jsx as _jsx } from "react/jsx-runtime";
import AuthLayout from "../../components/auth/AuthLayout";
import SignupForm from "../../components/auth/SignupForm";
export default function AttendeeSignup() {
    return (_jsx(AuthLayout, { variant: "attendee", title: "Create your account", subtitle: "Register once, join events faster.", children: _jsx(SignupForm, { variant: "attendee", redirectTo: "/events", loginPath: "/attendee/login" }) }));
}
