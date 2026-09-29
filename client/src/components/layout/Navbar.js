import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "@/components/ui/button";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-panel-admin";
const LINK_BASE = "flex items-center gap-1.5 text-sm font-medium rounded-lg border transition-colors";
const LINK_ACTIVE = "text-text-on-dark bg-panel-admin-hover border-white/10";
const LINK_IDLE = "text-text-on-dark/60 border-transparent hover:text-text-on-dark hover:bg-panel-admin-hover";
const LOGOUT = "text-text-on-dark/60 hover:text-danger-border hover:bg-danger/20";
function Navbar() {
    const [session, setSession] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            subscription.unsubscribe();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };
    const isActive = (path) => location.pathname === path;
    const linkClass = (path, pad) => `${LINK_BASE} ${pad} ${isActive(path) ? LINK_ACTIVE : LINK_IDLE} ${FOCUS}`;
    return (_jsx("nav", { className: `fixed top-0 w-full z-50 border-b border-white/10 transition-all duration-300 ${isScrolled
            ? "bg-panel-admin/95 backdrop-blur-md shadow-lg shadow-black/20"
            : "bg-panel-admin"}`, children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs(Link, { to: "/", className: `flex items-center gap-2 font-heading font-bold text-lg text-text-on-dark rounded-lg hover:opacity-90 transition-opacity ${FOCUS}`, children: [_jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-lg bg-brand shadow-sm", children: _jsx(CalendarDays, { className: "w-4.5 h-4.5 text-text-on-dark" }) }), "EventOS"] }), _jsxs("div", { className: "hidden md:flex items-center gap-1.5", children: [_jsx(Link, { to: "/events", className: linkClass("/events", "px-3.5 py-2"), children: "Find Events" }), session ? (_jsxs(_Fragment, { children: [_jsxs(Link, { to: "/dashboard", className: linkClass("/dashboard", "px-3.5 py-2"), children: [_jsx(LayoutDashboard, { className: "w-4 h-4 text-accent-organizer" }), "Dashboard"] }), _jsx("div", { className: "w-px h-6 bg-white/10 mx-2" }), _jsxs(Button, { variant: "ghost", onClick: handleLogout, className: `gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg ${LOGOUT}`, children: [_jsx(LogOut, { className: "w-4 h-4" }), "Logout"] })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: `${LINK_BASE} ${LINK_IDLE} px-3.5 py-2 ${FOCUS}`, children: "Log In" }), _jsx(Link, { to: "/signup", className: `text-sm font-medium bg-brand text-text-on-dark px-5 py-2 rounded-lg hover:bg-brand-hover shadow-sm transition-all active:scale-95 ${FOCUS}`, children: "Sign Up" })] }))] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setMobileOpen(!mobileOpen), className: "md:hidden text-text-on-dark/60 hover:text-text-on-dark hover:bg-panel-admin-hover transition-colors", "aria-label": mobileOpen ? "Close navigation menu" : "Open navigation menu", "aria-expanded": mobileOpen, children: mobileOpen ? (_jsx(X, { className: "w-5 h-5" })) : (_jsx(Menu, { className: "w-5 h-5" })) })] }), mobileOpen && (_jsxs("div", { className: "md:hidden flex flex-col gap-1.5 border-t border-white/10 pt-2 pb-4", children: [_jsx(Link, { to: "/events", className: linkClass("/events", "px-3 py-2.5"), children: "Find Events" }), session ? (_jsxs(_Fragment, { children: [_jsxs(Link, { to: "/dashboard", className: linkClass("/dashboard", "gap-2 px-3 py-2.5"), children: [_jsx(LayoutDashboard, { className: "w-4 h-4 text-accent-organizer" }), "Dashboard"] }), _jsxs(Button, { variant: "ghost", onClick: handleLogout, className: `justify-start gap-2 px-3 py-2.5 text-sm font-medium rounded-lg ${LOGOUT}`, children: [_jsx(LogOut, { className: "w-4 h-4" }), "Logout"] })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: `${LINK_BASE} ${LINK_IDLE} px-3 py-2.5 ${FOCUS}`, children: "Log In" }), _jsx(Link, { to: "/signup", className: `px-3 py-2.5 text-sm font-medium text-text-on-dark bg-brand rounded-lg text-center hover:bg-brand-hover transition-colors ${FOCUS}`, children: "Sign Up" })] }))] }))] }) }));
}
export default Navbar;
