import { Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import EventsList from "./pages/EventsList"
import EventDetail from "./pages/EventDetail"
import ManageAttendees from "./pages/ManageAttendees"
import ManageSchedule from "./pages/ManageSchedule"
import Login from "./pages/Login"
import Signup from "./pages/Signup"

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/events/:id/manage" element={<ProtectedRoute><ManageAttendees /></ProtectedRoute>} />
        <Route path="/events/:id/schedule" element={<ProtectedRoute><ManageSchedule /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App