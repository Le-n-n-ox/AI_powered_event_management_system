import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"

export type Role = "admin" | "organizer" | "attendee" | "floor_manager"

interface SignUpInput {
  email: string
  password: string
  fullName: string
  role: "admin" | "organizer" | "attendee"
  phone?: string
  inviteCode?: string
}

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [roleState, setRoleState] = useState<{ uid: string | null; role: Role | null }>({
    uid: null,
    role: null,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setRoleState({ uid: user.id, role: (data?.role as Role) ?? null })
      })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const roleLoading = !!user && roleState.uid !== user.id
  const loading = authLoading || roleLoading
  const role = user && roleState.uid === user.id ? roleState.role : null

  async function signUp({ email, password, fullName, role, phone, inviteCode }: SignUpInput) {
    if (role === "admin") {
      const { data: valid } = await supabase.rpc("admin_invite_valid", { invite: inviteCode ?? "" })
      if (!valid) return { error: "Invalid or already used admin invite code." }
    }

    // The DB trigger creates the profile from this metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone: phone ?? null,
          admin_invite: role === "admin" ? inviteCode : null,
        },
      },
    })
    if (error) return { error: error.message }

    return { error: null, needsConfirmation: !data.session }
  }

  async function signIn(email: string, password: string, allowedRoles?: Role[]) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, suspended")
        .eq("id", data.user.id)
        .maybeSingle()

      const userRole = profile?.role as Role | undefined

      if (profile?.suspended) {
        await supabase.auth.signOut()
        return { error: "This account has been suspended. Contact an administrator." }
      }

      if (allowedRoles) {
        if (!userRole || !allowedRoles.includes(userRole)) {
          await supabase.auth.signOut()
          return {
            error: userRole
              ? `This is a ${userRole} account. Please use the ${userRole} login.`
              : "No profile found for this account.",
          }
        }
      }
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error?.message ?? null }
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAdmin: role === "admin",
        isStaff: role === "admin" || role === "organizer",
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}