import { jsx as _jsx } from "react/jsx-runtime";
import AuthLayout from '../../components/auth/AuthLayout'; // Used relative path to match your LoginForm import
import LoginForm from "../../components/auth/LoginForm";
export default function AdminLogin() {
    return (_jsx(AuthLayout, { variant: "admin", title: "Admin sign in", subtitle: "Access the platform-wide dashboard.", children: _jsx(LoginForm, { variant: "admin", redirectTo: "/dashboard", signupPath: "/admin/signup" }) }));
}
