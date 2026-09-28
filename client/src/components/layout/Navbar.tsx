import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
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
    window.addEventListener("scroll", handleScroll);

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

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--color-panel-admin)]/95 backdrop-blur-md border-b border-[var(--color-panel-admin-hover)] shadow-lg shadow-[var(--color-shadow-soft)]"
          : "bg-[var(--color-panel-admin)] border-b border-[var(--color-panel-admin-hover)]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-bold text-lg text-[var(--color-text-on-dark)] hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-brand)] shadow-sm">
              <CalendarDays className="w-4.5 h-4.5 text-[var(--color-text-on-dark)]" />
            </div>
            EventOS
          </Link>

          <div className="hidden md:flex items-center gap-1.5">
            <Link
              to="/events"
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive("/events")
                  ? "text-[var(--color-text-on-dark)] bg-[var(--color-panel-admin-hover)] border border-[var(--color-border-strong)]"
                  : "text-[var(--color-text-soft)] hover:text-[var(--color-text-on-dark)] hover:bg-[var(--color-panel-admin-hover)]"
              }`}
            >
              Find Events
            </Link>

            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive("/dashboard")
                      ? "text-[var(--color-text-on-dark)] bg-[var(--color-panel-admin-hover)] border border-[var(--color-border-strong)]"
                      : "text-[var(--color-text-soft)] hover:text-[var(--color-text-on-dark)] hover:bg-[var(--color-panel-admin-hover)]"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--color-brand)]" />
                  Dashboard
                </Link>
                <div className="w-px h-6 bg-[var(--color-border-strong)] mx-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[var(--color-text-soft)] rounded-lg hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-[var(--color-text-soft)] rounded-lg hover:text-[var(--color-text-on-dark)] hover:bg-[var(--color-panel-admin-hover)] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-[var(--color-brand)] text-[var(--color-text-on-dark)] px-5 py-2 rounded-full hover:bg-[var(--color-brand-hover)] shadow-sm hover:shadow-[var(--color-shadow-brand)] transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[var(--color-text-soft)] hover:text-[var(--color-text-on-dark)] rounded-lg hover:bg-[var(--color-panel-admin-hover)] transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-1.5 pb-4 pt-2 border-t border-[var(--color-panel-admin-hover)]">
            <Link
              to="/events"
              className={`px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive("/events")
                  ? "text-[var(--color-text-on-dark)] bg-[var(--color-panel-admin-hover)]"
                  : "text-[var(--color-text-soft)] hover:bg-[var(--color-panel-admin-hover)] hover:text-[var(--color-text-on-dark)]"
              }`}
            >
              Find Events
            </Link>

            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive("/dashboard")
                      ? "text-[var(--color-text-on-dark)] bg-[var(--color-panel-admin-hover)]"
                      : "text-[var(--color-text-soft)] hover:bg-[var(--color-panel-admin-hover)] hover:text-[var(--color-text-on-dark)]"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--color-brand)]" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-left text-[var(--color-text-soft)] rounded-lg hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2.5 text-sm font-medium text-[var(--color-text-soft)] rounded-lg hover:bg-[var(--color-panel-admin-hover)] hover:text-[var(--color-text-on-dark)]"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2.5 text-sm font-medium text-[var(--color-text-on-dark)] bg-[var(--color-brand)] rounded-lg text-center hover:bg-[var(--color-brand-hover)]"
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
