import { Search, X } from "lucide-react";

const FIELD =
  "h-10 border border-border rounded-lg bg-surface text-sm text-text transition-colors hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-focus-soft";

export interface EventFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  locations: string[];
  location: string;
  onLocationChange: (value: string) => void;
  categories: string[];
  category: string;
  onCategoryChange: (value: string) => void;
  /** Hidden until the category column exists in the database. */
  categoriesAvailable: boolean;
  showTime?: boolean;
  time?: string;
  onTimeChange?: (value: string) => void;
  searchPlaceholder?: string;
  onClear?: () => void;
  children?: React.ReactNode;
}

/**
 * One row of filters above a list of events. Kept as a single row on wide
 * screens and stacked on narrow ones, so the controls never squeeze the
 * results into a sliver.
 */
export default function EventFilterBar({
  search,
  onSearchChange,
  locations,
  location,
  onLocationChange,
  categories,
  category,
  onCategoryChange,
  categoriesAvailable,
  showTime = false,
  time = "all",
  onTimeChange,
  searchPlaceholder = "Search events",
  onClear,
  children,
}: EventFilterBarProps) {
  const hasFilters =
    search.trim() !== "" ||
    location !== "all" ||
    category !== "all" ||
    (showTime && time !== "all");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-soft pointer-events-none" />
          <input
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${FIELD} w-full pl-9 pr-3 placeholder:text-text-soft`}
          />
        </div>

        <select
          aria-label="Filter by location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className={`${FIELD} px-3 cursor-pointer sm:w-48`}
        >
          <option value="all">All locations</option>
          {locations.map((place) => (
            <option key={place} value={place}>
              {place}
            </option>
          ))}
        </select>

        {categoriesAvailable && (
          <select
            aria-label="Filter by niche"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`${FIELD} px-3 cursor-pointer sm:w-48`}
          >
            <option value="all">All niches</option>
            {categories.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
        )}

        {showTime && onTimeChange && (
          <select
            aria-label="Filter by time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className={`${FIELD} px-3 cursor-pointer sm:w-40`}
          >
            <option value="all">Any time</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="ongoing">Happening now</option>
          </select>
        )}

        {hasFilters && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="h-10 px-3 rounded-lg text-sm font-medium text-text-soft hover:text-text hover:bg-surface-muted inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {children}
    </div>
  );
}
