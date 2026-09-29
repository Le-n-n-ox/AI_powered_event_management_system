import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccessDenied from "./AccessDenied";
function ProtectedRoute({ children }) {
    const { user, isStaff, loading } = useAuth();
    if (loading)
        return _jsx("p", { className: "p-6 text-[var(--color-text-muted)]", children: "Loading\u2026" });
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (!isStaff)
        return (_jsx(AccessDenied, { message: "This area is for organizers and admins only." }));
    return _jsx(_Fragment, { children: children });
}
export default ProtectedRoute;
