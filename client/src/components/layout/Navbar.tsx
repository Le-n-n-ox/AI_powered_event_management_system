import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  CalendarDays,
  LogOut,
  LayoutDashboard,
  UserRound,
  ListPlus,
  Menu,
  X,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-text-on-dark focus-visible:ring-offset-2 focus-visible:ring-offset-panel-admin";

const LINK_BASE =
  "flex items-center gap-1.5 text-sm font-medium rounded-lg border transition-all duration-200 active:scale-95";
const LINK_ACTIVE =
  "text-text-on-dark bg-text-on-dark/20 border-text-on-dark/30 shadow-sm";
const LINK_IDLE =
  "text-text-on-dark/85 border-[var(--color-transparent)] hover:text-text-on-dark hover:bg-text-on-dark/15 hover:border-text-on-dark/20";
const LOGOUT =
  "text-text-on-dark/85 hover:text-text-on-dark hover:bg-danger/60 active:scale-95";

function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isStaff } = useAuth();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string, pad: string) =>
    `${LINK_BASE} ${pad} ${isActive(path) ? LINK_ACTIVE : LINK_IDLE} ${FOCUS}`;

  return (
    <nav
      className={`fixed top-0 w-full z-50 border-b border-text-on-dark/15 bg-linear-to-r transition-all duration-300 ${
        isScrolled
          ? "from-panel-admin/95 via-brand/95 to-panel-attendee-hover/95 backdrop-blur-md shadow-lg shadow-shadow-brand"
          : "from-panel-admin via-brand to-panel-attendee-hover"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className={`group flex items-center gap-2 font-heading font-bold text-lg text-text-on-dark rounded-lg ${FOCUS}`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[image:var(--gradient-warm)] shadow-md shadow-shadow-soft transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">
              <CalendarDays className="w-4.5 h-4.5 text-text-on-dark" />
            </div>
            EventOS
          </Link>

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
                  <Link
                    to="/dashboard"
                    className={linkClass("/dashboard", "px-3.5 py-2")}
                  >
                    <LayoutDashboard className="w-4 h-4 text-accent-admin" />
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={linkClass("/profile", "px-3.5 py-2")}
                >
                  <UserRound className="w-4 h-4" />
                  Profile
                </Link>
                <div className="w-px h-6 bg-text-on-dark/25 mx-2" />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={`gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg ${LOGOUT}`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
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
                  className={`text-sm font-semibold bg-surface text-brand-strong px-5 py-2 rounded-lg shadow-md shadow-shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-strong hover:shadow-lg active:translate-y-0 active:scale-95 ${FOCUS}`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-on-dark/85 hover:text-text-on-dark hover:bg-text-on-dark/15 transition-colors active:scale-95"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-1.5 border-t border-text-on-dark/20 pt-2 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link to="/events" className={linkClass("/events", "px-3 py-2.5")}>
              Find Events
            </Link>

            {session ? (
              <>
                <Link
                  to="/my-events"
                  className={linkClass("/my-events", "gap-2 px-3 py-2.5")}
                >
                  <ListPlus className="w-4 h-4" />
                  My Events
                </Link>
                {isStaff && (
                  <Link
                    to="/dashboard"
                    className={linkClass("/dashboard", "gap-2 px-3 py-2.5")}
                  >
                    <LayoutDashboard className="w-4 h-4 text-accent-admin" />
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={linkClass("/profile", "gap-2 px-3 py-2.5")}
                >
                  <UserRound className="w-4 h-4" />
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={`justify-start gap-2 px-3 py-2.5 text-sm font-medium rounded-lg ${LOGOUT}`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${LINK_BASE} ${LINK_IDLE} px-3 py-2.5 ${FOCUS}`}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className={`px-3 py-2.5 text-sm font-semibold text-brand-strong bg-surface rounded-lg text-center shadow-md shadow-shadow-soft transition-all hover:bg-surface-strong active:scale-95 ${FOCUS}`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;