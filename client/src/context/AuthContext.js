import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [roleState, setRoleState] = useState({
        uid: null,
        role: null,
    });
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => listener.subscription.unsubscribe();
    }, []);
    useEffect(() => {
        if (!user)
            return;
        let cancelled = false;
        supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle()
            .then(({ data }) => {
            if (!cancelled)
                setRoleState({ uid: user.id, role: data?.role ?? null });
        });
        return () => {
            cancelled = true;
        };
    }, [user?.id]);
    const roleLoading = !!user && roleState.uid !== user.id;
    const loading = authLoading || roleLoading;
    const role = user && roleState.uid === user.id ? roleState.role : null;
    async function signUp({ email, password, fullName, role, phone, inviteCode }) {
        if (role === "admin") {
            const { data: valid } = await supabase.rpc("admin_invite_valid", { invite: inviteCode ?? "" });
            if (!valid)
                return { error: "Invalid or already used admin invite code." };
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
        });
        if (error)
            return { error: error.message };
        return { error: null, needsConfirmation: !data.session };
    }
    async function signIn(email, password, allowedRoles) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error)
            return { error: error.message };
        if (allowedRoles && data.user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .maybeSingle();
            const userRole = profile?.role;
            if (!userRole || !allowedRoles.includes(userRole)) {
                await supabase.auth.signOut();
                return {
                    error: userRole
                        ? `This is a ${userRole} account. Please use the ${userRole} login.`
                        : "No profile found for this account.",
                };
            }
        }
        return { error: null };
    }
    async function signOut() {
        await supabase.auth.signOut();
    }
    return (_jsx(AuthContext.Provider, { value: {
            user,
            role,
            loading,
            isAdmin: role === "admin",
            isStaff: role === "admin" || role === "organizer",
            signUp,
            signIn,
            signOut,
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within AuthProvider");
    return context;
}
