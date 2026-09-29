import { jsx as _jsx } from "react/jsx-runtime";
import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";
export default function OrganizerLogin() {
    return (_jsx(AuthLayout, { variant: "organizer", title: "Organizer login", subtitle: "Manage your events and attendees.", children: _jsx(LoginForm, { variant: "organizer", redirectTo: "/dashboard", signupPath: "/organizer/signup" }) }));
}
