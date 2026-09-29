import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import EventGuard from "./components/layout/EventGuard";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import EventsList from "./pages/EventsList";
import EventDetail from "./pages/EventDetail";
import ManageAttendees from "./pages/ManageAttendees";
import ManageSchedule from "./pages/ManageSchedule";
import ManageVenueLocations from "./pages/ManageVenueLocations";
import RoleSelect from "./pages/RoleSelect";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import OrganizerLogin from "./pages/organizer/OrganizerLogin";
import OrganizerSignup from "./pages/organizer/OrganizerSignup";
import AttendeeLogin from "./pages/attendee/AttendeeLogin";
import AttendeeSignup from "./pages/attendee/AttendeeSignup";
import EventFormPage from "./pages/organizer/EventFormPage";
// Staff login required AND must own the event (admins bypass ownership)
function Managed({ children }) {
    return (_jsx(ProtectedRoute, { children: _jsx(EventGuard, { children: children }) }));
}
function App() {
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs("div", { className: "pt-16", children: [" ", _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/login", element: _jsx(RoleSelect, { mode: "login" }) }), _jsx(Route, { path: "/signup", element: _jsx(RoleSelect, { mode: "signup" }) }), _jsx(Route, { path: "/admin/login", element: _jsx(AdminLogin, {}) }), _jsx(Route, { path: "/admin/signup", element: _jsx(AdminSignup, {}) }), _jsx(Route, { path: "/organizer/login", element: _jsx(OrganizerLogin, {}) }), _jsx(Route, { path: "/organizer/signup", element: _jsx(OrganizerSignup, {}) }), _jsx(Route, { path: "/attendee/login", element: _jsx(AttendeeLogin, {}) }), _jsx(Route, { path: "/attendee/signup", element: _jsx(AttendeeSignup, {}) }), _jsx(Route, { path: "/organizer/events/new", element: _jsx(EventFormPage, {}) }), _jsx(Route, { path: "/organizer/events/edit", element: _jsx(EventFormPage, {}) }), _jsx(Route, { path: "/events", element: _jsx(EventsList, {}) }), _jsx(Route, { path: "/events/:id", element: _jsx(EventDetail, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/events/:id/manage", element: _jsx(Managed, { children: _jsx(ManageAttendees, {}) }) }), _jsx(Route, { path: "/events/:id/schedule", element: _jsx(Managed, { children: _jsx(ManageSchedule, {}) }) }), _jsx(Route, { path: "/events/:id/locations", element: _jsx(Managed, { children: _jsx(ManageVenueLocations, {}) }) })] })] })] }));
}
export default App;
