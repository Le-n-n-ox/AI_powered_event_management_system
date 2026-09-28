import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";

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
          ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-slate-950/20"
          : "bg-slate-900 border-b border-slate-800"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-bold text-lg text-white hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-sm">
              <CalendarDays className="w-4.5 h-4.5 text-white" />
            </div>
            EventOS
          </Link>

          <div className="hidden md:flex items-center gap-1.5">
            <Link
              to="/events"
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive("/events")
                  ? "text-white bg-slate-800 border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
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
                      ? "text-white bg-slate-800 border border-slate-700"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  Dashboard
                </Link>
                <div className="w-px h-6 bg-slate-700 mx-2" />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-400 rounded-lg hover:text-red-400 hover:bg-red-950/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
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
            className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
          <Card className="md:hidden gap-0 overflow-visible rounded-none border-t border-slate-800 bg-transparent pb-4 pt-2 text-inherit ring-0">
            <CardContent className="flex flex-col gap-1.5 px-0">
            <Link
              to="/events"
              className={`px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive("/events")
                  ? "text-white bg-slate-800"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
                      ? "text-white bg-slate-800"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  Dashboard
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center justify-start gap-2 px-3 py-2.5 text-sm font-medium text-left text-slate-400 rounded-lg hover:text-red-400 hover:bg-red-950/50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg text-center hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            )}
            </CardContent>
          </Card>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
