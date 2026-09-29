import { jsx as _jsx } from "react/jsx-runtime";
import AuthLayout from "../../components/auth/AuthLayout";
import SignupForm from "../../components/auth/SignupForm";
export default function OrganizerSignup() {
    return (_jsx(AuthLayout, { variant: "organizer", title: "Create organizer account", subtitle: "Start running your events in minutes.", children: _jsx(SignupForm, { variant: "organizer", redirectTo: "/dashboard", loginPath: "/organizer/login" }) }));
}
