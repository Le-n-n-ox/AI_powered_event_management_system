import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";

interface TableData {
  columns: string[];
  rows: (string | number)[][];
}

interface Props {
  title: string;
  subtitle?: string;
  /** The chart itself. */
  children: ReactNode;
  /**
   * The same numbers as a table. Every chart can be read without relying on
   * colour, so the table is always available.
   */
  table?: TableData;
  /** Extra controls shown in the card header. */
  action?: ReactNode;
  className?: string;
}

const SWITCH =
  "inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted p-0.5";

/**
 * The frame every chart sits in: a title, an optional subtitle, and a switch
 * between the chart and a plain table of the same numbers.
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  table,
  action,
  className = "",
}: Props) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <section
      className={`bg-surface rounded-2xl border border-border shadow-md shadow-shadow-soft p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <div>
          <h2 className="font-heading text-lg font-semibold text-text">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-text-soft mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {action}
          {table && (
            <div className={SWITCH} role="group" aria-label="Chart or table">
              <button
                type="button"
                onClick={() => setView("chart")}
                aria-pressed={view === "chart"}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  view === "chart"
                    ? "bg-surface text-brand shadow-sm"
                    : "text-text-soft hover:text-text"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Chart
              </button>
              <button
                type="button"
                onClick={() => setView("table")}
                aria-pressed={view === "table"}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  view === "table"
                    ? "bg-surface text-brand shadow-sm"
                    : "text-text-soft hover:text-text"
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {view === "chart" || !table ? (
          children
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-border text-text-soft uppercase text-xs tracking-wide">
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="py-2 px-2 font-semibold first:pr-3 last:pl-2"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {table.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-surface-muted">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`py-2 px-2 ${
                          cellIndex === 0
                            ? "pr-3 font-medium text-text"
                            : "text-text-muted tabular-nums"
                        } ${cellIndex === row.length - 1 ? "pl-2" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
