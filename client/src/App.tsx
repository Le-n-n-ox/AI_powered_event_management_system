import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import EventGuard from "./components/layout/EventGuard";
import RequireAuth from "./components/layout/RequireAuth";
import Landing from "./pages/Landing";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const EventsList = lazy(() => import("./pages/EventsList"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const ManageAttendees = lazy(() => import("./pages/ManageAttendees"));
const ManageSchedule = lazy(() => import("./pages/ManageSchedule"));
const ManageVenueLocations = lazy(() => import("./pages/ManageVenueLocations"));
const RoleSelect = lazy(() => import("./pages/RoleSelect"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminSignup = lazy(() => import("./pages/admin/AdminSignup"));
const OrganizerLogin = lazy(() => import("./pages/organizer/OrganizerLogin"));
const OrganizerSignup = lazy(() => import("./pages/organizer/OrganizerSignup"));
const AttendeeLogin = lazy(() => import("./pages/attendee/AttendeeLogin"));
const AttendeeSignup = lazy(() => import("./pages/attendee/AttendeeSignup"));
const EventFormPage = lazy(() => import("./pages/organizer/EventFormPage"));
const Profile = lazy(() => import("./pages/Profile"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const MyEvents = lazy(() => import("./pages/attendee/MyEvents"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// inside <Routes>:

function PageFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-text-soft text-sm">
      Loading…
    </div>
  );
}

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
        <Suspense fallback={<PageFallback />}>
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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
        </Suspense>
      </div>
    </>
  );
}

export default App;
