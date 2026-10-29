import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";

export interface AppShellNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Render as a link to another route. Omit for in-page sections. */
  to?: string;
  onSelect?: () => void;
  badge?: string | number;
  /** Renders in the muted style — for destructive or secondary actions. */
  tone?: "default" | "muted";
}

interface AppShellProps {
  title: string;
  subtitle?: string;
  nav: AppShellNavItem[];
  activeKey: string;
  onSelect?: (key: string) => void;
  actions?: ReactNode;
  children: ReactNode;
  /** Shown under the nav list on the desktop sidebar. */
  aside?: ReactNode;
}

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/**
 * Two-column shell: a persistent side bar on desktop, a scrollable pill row
 * on small screens, and a page header that carries the title and actions.
 */
export default function AppShell({
  title,
  subtitle,
  nav,
  activeKey,
  onSelect,
  actions,
  children,
  aside,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  const itemClass = (item: AppShellNavItem) => {
    const active = item.key === activeKey;

    return `group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${FOCUS} ${
      active
        ? "bg-linear-to-r from-brand/15 to-brand/5 text-brand-strong border border-brand-border shadow-sm"
        : "text-text-muted border border-transparent hover:bg-surface-muted hover:text-text"
    } ${item.tone === "muted" ? "opacity-80" : ""}`;
  };

  const itemBody = (item: AppShellNavItem, iconClass: string) => (
    <>
      <item.icon className={`h-4.5 w-4.5 shrink-0 ${iconClass}`} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge !== undefined && (
        <span className="ml-auto inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full bg-surface-strong text-text-soft text-xs font-medium">
          {item.badge}
        </span>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:flex lg:gap-8">
        {/* Desktop side bar */}
        <aside
          className={`hidden lg:block shrink-0 transition-[width] duration-300 ${
            collapsed ? "w-20" : "w-60"
          }`}
        >
          <div className="sticky top-20 flex flex-col gap-4 py-6">
            <nav
              aria-label="Section navigation"
              className="flex flex-col gap-1 p-2 rounded-2xl border border-border bg-surface/70 backdrop-blur-sm shadow-sm shadow-shadow-soft"
            >
              {nav.map((item) =>
                item.to ? (
                  <Link
                    key={item.key}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    aria-current={item.key === activeKey ? "page" : undefined}
                    className={itemClass(item)}
                  >
                    {itemBody(
                      item,
                      item.key === activeKey
                        ? "text-brand-strong"
                        : "text-text-soft group-hover:text-text",
                    )}
                  </Link>
                ) : (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect?.(item.key)}
                    title={collapsed ? item.label : undefined}
                    aria-current={item.key === activeKey ? "page" : undefined}
                    className={itemClass(item)}
                  >
                    {itemBody(
                      item,
                      item.key === activeKey
                        ? "text-brand-strong"
                        : "text-text-soft group-hover:text-text",
                    )}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-text-soft transition-colors hover:bg-surface-muted hover:text-text ${FOCUS}`}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4 shrink-0" />
                ) : (
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                )}
                {!collapsed && "Collapse"}
              </button>
            </nav>

            {!collapsed && aside}
          </div>
        </aside>

        {/* Content column */}
        <main className="min-w-0 flex-1 pb-12">
          <header className="pt-24 lg:pt-10 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-text-soft text-sm mt-1">{subtitle}</p>
                )}
              </div>
              {actions && (
                <div className="flex flex-wrap items-center gap-2">{actions}</div>
              )}
            </div>

            {/* Mobile section switcher */}
            <nav
              aria-label="Section navigation"
              className="lg:hidden mt-5 -mx-1 flex gap-2 overflow-x-auto pb-1"
            >
              {nav.map((item) =>
                item.to ? (
                  <Link
                    key={item.key}
                    to={item.to}
                    className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                      item.key === activeKey
                        ? "bg-brand-soft text-brand-strong border-brand-border"
                        : "bg-surface text-text-muted border-border"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect?.(item.key)}
                    className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                      item.key === activeKey
                        ? "bg-brand-soft text-brand-strong border-brand-border"
                        : "bg-surface text-text-muted border-border"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ),
              )}
            </nav>
          </header>

          <motion.div
            key={activeKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
