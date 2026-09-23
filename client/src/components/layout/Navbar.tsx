import { Link } from "react-router-dom"
import { CalendarDays } from "lucide-react"

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-gray-900">
        <CalendarDays className="w-6 h-6 text-indigo-600" />
        EventOS
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
        <Link to="/events" className="hover:text-indigo-600 transition-colors">Events</Link>
      </div>
    </nav>
  )
}

export default Navbar