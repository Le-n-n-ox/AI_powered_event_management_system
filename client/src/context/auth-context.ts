import { createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"

export type Role = "admin" | "organizer" | "attendee" | "floor_manager"

export interface SignUpInput {
  email: string
  password: string
  fullName: string
  role: "admin" | "organizer" | "attendee"
  phone?: string
  inviteCode?: string
}

export interface AuthContextType {
  user: User | null
  role: Role | null
  loading: boolean
  isAdmin: boolean
  isStaff: boolean // admin or organizer
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsConfirmation?: boolean }>
  signIn: (email: string, password: string, allowedRoles?: Role[]) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
