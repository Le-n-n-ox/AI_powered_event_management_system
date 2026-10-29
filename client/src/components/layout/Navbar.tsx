import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  LogOut,
  LayoutDashboard,
  UserRound,
  ListPlus,
  Menu,
  X,
  ChartColumn,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/auth-context";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const LINK_BASE =
  "flex items-center gap-1.5 text-sm font-medium rounded-lg border transition-all duration-200 active:scale-95";
const LINK_ACTIVE =
  "text-brand-strong bg-brand-soft border-brand-border shadow-sm";
const LINK_IDLE =
  "text-text-muted border-transparent hover:text-text hover:bg-surface-muted hover:border-border";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  organizer: "Organizer",
  attendee: "Attendee",
  floor_manager: "Floor manager",
};

function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  /** Close the mobile sheet as soon as a destination is picked. */
  const closeMenu = () => setMobileOpen(false);

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string, pad: string) =>
    `${LINK_BASE} ${pad} ${isActive(path) ? LINK_ACTIVE : LINK_IDLE} ${FOCUS}`;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border glass shadow-sm shadow-shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <Link
            to="/"
            className={`group flex items-center gap-2.5 font-heading font-bold text-lg text-text rounded-lg ${FOCUS}`}
          >
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-brand via-tag-violet to-tag-teal shadow-md shadow-shadow-brand transition-transform duration-200 group-hover:rotate-6 group-hover:scale-105">
              <CalendarDays className="w-4.5 h-4.5 text-text-on-dark" />
            </span>
            <span className="hidden sm:block">EventOS</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link to="/events" className={linkClass("/events", "px-3.5 py-2")}>
              Find Events
            </Link>

            {session ? (
              <>
                <Link
                  to="/my-events"
                  className={linkClass("/my-events", "px-3.5 py-2")}
                >
                  <ListPlus className="w-4 h-4" />
                  My Events
                </Link>

                {isStaff && (
                  <>
                    <Link
                      to="/dashboard"
                      className={linkClass("/dashboard", "px-3.5 py-2")}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/organizer/statistics"
                      className={linkClass("/organizer/statistics", "px-3.5 py-2")}
                    >
                      <ChartColumn className="w-4 h-4" />
                      Statistics
                    </Link>
                    <Link
                      to="/organizer/transactions"
                      className={linkClass("/organizer/transactions", "px-3.5 py-2")}
                    >
                      <Wallet className="w-4 h-4" />
                      Transactions
                    </Link>
                  </>
                )}

                <Link
                  to="/profile"
                  className={linkClass("/profile", "px-3.5 py-2")}
                >
                  <UserRound className="w-4 h-4" />
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${LINK_BASE} ${LINK_IDLE} px-3.5 py-2 ${FOCUS}`}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className={`text-sm font-semibold bg-linear-to-r from-brand to-panel-organizer text-text-on-dark px-5 py-2 rounded-lg shadow-md shadow-shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 ${FOCUS}`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Right-hand controls */}
          <div className="flex items-center gap-2">
            {session && role && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-surface-muted text-text-muted border border-border">
                {role === "admin" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-role-admin" />
                ) : (
                  <UserRound className="w-3.5 h-3.5 text-text-soft" />
                )}
                {ROLE_LABEL[role] ?? role}
              </span>
            )}

            <ThemeToggle />

            {session && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={`hidden md:inline-flex gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-text-muted hover:text-danger hover:bg-danger-bg transition-colors ${FOCUS}`}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden text-text-muted hover:text-text hover:bg-surface-muted transition-colors active:scale-95 ${FOCUS}`}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t border-border bg-surface/95 backdrop-blur-md"
          >
            <div className="flex flex-col gap-1 px-4 pt-3 pb-4">
              <Link
                to="/events"
                onClick={closeMenu}
                className={linkClass("/events", "gap-2 px-3 py-2.5")}
              >
                Find Events
              </Link>

              {session ? (
                <>
                  <Link
                    to="/my-events"
                    onClick={closeMenu}
                    className={linkClass("/my-events", "gap-2 px-3 py-2.5")}
                  >
                    <ListPlus className="w-4 h-4" />
                    My Events
                  </Link>

                  {isStaff && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={closeMenu}
                        className={linkClass("/dashboard", "gap-2 px-3 py-2.5")}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/organizer/statistics"
                        onClick={closeMenu}
                        className={linkClass("/organizer/statistics", "gap-2 px-3 py-2.5")}
                      >
                        <ChartColumn className="w-4 h-4" />
                        Statistics
                      </Link>
                      <Link
                        to="/organizer/transactions"
                        onClick={closeMenu}
                        className={linkClass("/organizer/transactions", "gap-2 px-3 py-2.5")}
                      >
                        <Wallet className="w-4 h-4" />
                        Transactions
                      </Link>
                    </>
                  )}

                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className={linkClass("/profile", "gap-2 px-3 py-2.5")}
                  >
                    <UserRound className="w-4 h-4" />
                    Profile
                  </Link>

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={`justify-start gap-2 px-3 py-2.5 text-sm font-medium rounded-lg text-text-muted hover:text-danger hover:bg-danger-bg ${FOCUS}`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className={`${LINK_BASE} ${LINK_IDLE} gap-2 px-3 py-2.5 ${FOCUS}`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className={`px-3 py-2.5 text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-panel-organizer rounded-lg text-center shadow-md shadow-shadow-brand transition-all hover:brightness-110 active:scale-95 ${FOCUS}`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
