import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CalendarDays, LogOut } from "lucide-react"
import { supabase } from "../../lib/supabase"

function Navbar() {
  const [session, setSession] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-gray-900">
        <CalendarDays className="w-6 h-6 text-indigo-600" />
        EventOS
      </Link>
      
      <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
        <Link to="/events" className="hover:text-indigo-600 transition-colors">Find Events</Link>
        
        {session ? (
          <>
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Log In</Link>
            <Link 
              to="/signup" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar