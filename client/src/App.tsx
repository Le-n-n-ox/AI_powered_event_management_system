import { Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import EventDetail from "./pages/EventDetail"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ManageAttendees from "./pages/ManageAttendees"
// Import the new page
import EventsList from "./pages/EventsList" 

function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard/events/:id/attendees" element={<ProtectedRoute><ManageAttendees /></ProtectedRoute>} />
          
          {/* Add the missing route here */}
          <Route path="/events" element={<EventsList />} /> 
          
          {/* Specific event detail page */}
          <Route path="/events/:id" element={<EventDetail />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  )
}

export default App