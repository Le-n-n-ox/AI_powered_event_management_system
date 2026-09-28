import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

export default function AccessDenied({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto mt-24 p-8 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
      <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <h1 className="font-heading text-xl font-bold text-gray-900 mb-1">Access denied</h1>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      <Link to="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        Back to events
      </Link>
    </div>
  )
}