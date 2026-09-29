import { jsx as _jsx } from "react/jsx-runtime";
import AuthLayout from "../../components/auth/AuthLayout";
import SignupForm from "../../components/auth/SignupForm";
export default function AdminSignup() {
    return (_jsx(AuthLayout, { variant: "admin", title: "Create admin account", subtitle: "An invite code is required.", children: _jsx(SignupForm, { variant: "admin", redirectTo: "/dashboard", loginPath: "/admin/login" }) }));
}
