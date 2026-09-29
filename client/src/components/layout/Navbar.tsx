import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { Button } from "@/components/ui/button";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-panel-admin";

const LINK_BASE =
  "flex items-center gap-1.5 text-sm font-medium rounded-lg border transition-colors";
const LINK_ACTIVE =
  "text-text-on-dark bg-panel-admin-hover border-white/10";
const LINK_IDLE =
  "text-text-on-dark/60 border-transparent hover:text-text-on-dark hover:bg-panel-admin-hover";
const LOGOUT =
  "text-text-on-dark/60 hover:text-danger-border hover:bg-danger/20";

function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
      className={`fixed top-0 w-full z-50 border-b border-white/10 transition-all duration-300 ${
        isScrolled
          ? "bg-panel-admin/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-panel-admin"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className={`flex items-center gap-2 font-heading font-bold text-lg text-text-on-dark rounded-lg hover:opacity-90 transition-opacity ${FOCUS}`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand shadow-sm">
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
                  to="/dashboard"
                  className={linkClass("/dashboard", "px-3.5 py-2")}
                >
                  <LayoutDashboard className="w-4 h-4 text-accent-organizer" />
                  Dashboard
                </Link>
                <div className="w-px h-6 bg-white/10 mx-2" />
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
                  className={`text-sm font-medium bg-brand text-text-on-dark px-5 py-2 rounded-lg hover:bg-brand-hover shadow-sm transition-all active:scale-95 ${FOCUS}`}
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
            className="md:hidden text-text-on-dark/60 hover:text-text-on-dark hover:bg-panel-admin-hover transition-colors"
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
          <div className="md:hidden flex flex-col gap-1.5 border-t border-white/10 pt-2 pb-4">
            <Link to="/events" className={linkClass("/events", "px-3 py-2.5")}>
              Find Events
            </Link>

            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className={linkClass("/dashboard", "gap-2 px-3 py-2.5")}
                >
                  <LayoutDashboard className="w-4 h-4 text-accent-organizer" />
                  Dashboard
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
                  className={`px-3 py-2.5 text-sm font-medium text-text-on-dark bg-brand rounded-lg text-center hover:bg-brand-hover transition-colors ${FOCUS}`}
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