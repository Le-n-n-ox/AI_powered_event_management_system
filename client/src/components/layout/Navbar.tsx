import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { CalendarDays, LogOut, LayoutDashboard, Menu, X } from "lucide-react"
import { supabase } from "../../lib/supabase"

function Navbar() {
  const [session, setSession] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm" : "bg-transparent border-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-bold text-lg text-gray-900 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
              <CalendarDays className="w-4.5 h-4.5 text-white" />
            </div>
            EventOS
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/events"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive("/events")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Find Events
            </Link>

            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/dashboard")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-1 pb-4">
            <Link
              to="/events"
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/events") ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Find Events
            </Link>

            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg ${
                    isActive("/dashboard") ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-left text-gray-600 rounded-lg hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50">
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar