import type { ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import EventGuard from "./components/layout/EventGuard";
import RequireAuth from "./components/layout/RequireAuth";
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
import Profile from "./pages/Profile";
import CheckIn from "./pages/CheckIn";
import MyEvents from "./pages/attendee/MyEvents";

// Staff login required AND must own the event (admins bypass ownership)
function Managed({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <EventGuard>{children}</EventGuard>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        {" "}
        {/* Global fix: pushes all page routes below the fixed navbar */}
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* Auth */}
          <Route path="/login" element={<RoleSelect mode="login" />} />
          <Route path="/signup" element={<RoleSelect mode="signup" />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/organizer/login" element={<OrganizerLogin />} />
          <Route path="/organizer/signup" element={<OrganizerSignup />} />
          <Route path="/attendee/login" element={<AttendeeLogin />} />
          <Route path="/attendee/signup" element={<AttendeeSignup />} />

          {/* Any logged-in user */}
          <Route
            path="/my-events"
            element={
              <RequireAuth>
                <MyEvents />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* Event Form Management */}
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute>
                <EventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <Managed>
                <EventFormPage />
              </Managed>
            }
          />

          {/* Public */}
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Staff only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/manage"
            element={
              <Managed>
                <ManageAttendees />
              </Managed>
            }
          />
          <Route
            path="/events/:id/schedule"
            element={
              <Managed>
                <ManageSchedule />
              </Managed>
            }
          />
          <Route
            path="/events/:id/locations"
            element={
              <Managed>
                <ManageVenueLocations />
              </Managed>
            }
          />
          <Route
            path="/events/:id/checkin"
            element={
              <Managed>
                <CheckIn />
              </Managed>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;