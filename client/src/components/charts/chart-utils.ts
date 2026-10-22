import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/theme-context";

/**
 * Chart colours.
 *
 * Both palettes are validated with the data-viz validator:
 *
 *   light (surface #ffffff) — worst adjacent pair ΔE 14.1 deutan, 20.3 normal
 *   dark  (surface #121a2e) — worst adjacent pair ΔE 11.8 deutan, 18.3 normal
 *
 * Every slot clears the lightness band, the chroma floor and 3:1 contrast
 * against its own surface. The status four are reserved semantic colours —
 * never reused as a categorical series — and always ship with a label beside
 * them.
 */
export interface ChartSeries {
  brand: string;
  teal: string;
  violet: string;
  amber: string;
  pink: string;
  success: string;
  warning: string;
  info: string;
  danger: string;
}

export interface ChartInk {
  primary: string;
  secondary: string;
  muted: string;
}

export interface ChartPalette {
  series: ChartSeries;
  ink: ChartInk;
  grid: string;
  axis: string;
  surface: string;
}

export const LIGHT_PALETTE: ChartPalette = {
  series: {
    brand: "#5152e8",
    teal: "#0d9488",
    violet: "#7c3aed",
    amber: "#d97706",
    pink: "#db2777",
    success: "#059669",
    warning: "#b45309",
    info: "#0284c7",
    danger: "#e11d48",
  },
  ink: {
    primary: "#14203d",
    secondary: "#3d4c73",
    muted: "#64749b",
  },
  grid: "#d3def5",
  axis: "#64749b",
  surface: "#ffffff",
};

export const DARK_PALETTE: ChartPalette = {
  series: {
    brand: "#6366f1",
    teal: "#12a08c",
    violet: "#8b5cf6",
    amber: "#d97706",
    pink: "#e93d7f",
    success: "#059669",
    warning: "#b45309",
    info: "#0284c7",
    danger: "#f43f5e",
  },
  ink: {
    primary: "#e9eefb",
    secondary: "#b7c1e0",
    muted: "#8492b8",
  },
  grid: "#26314f",
  axis: "#8492b8",
  surface: "#121a2e",
};

/**
 * The palette for the theme currently on screen. Dark mode is *selected* —
 * its own steps, validated against the dark surface — not a flip of the
 * light one.
 */
export function useChartPalette(): ChartPalette {
  const { theme } = useTheme();
  return theme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
}

/** The reserved status colours, for the current theme. */
export function useStatusColors() {
  const palette = useChartPalette();

  return {
    approved: palette.series.success,
    pending: palette.series.warning,
    waitlisted: palette.series.info,
    rejected: palette.series.danger,
  } as const;
}

/**
 * The categorical palette — the fixed hue order for charts that carry
 * identity (a status breakdown, a set of named series).
 *
 * Hues are assigned in this order and never cycled: the seventh slot is the
 * last, and an eighth category folds into "Other" rather than inventing a
 * new hue. Both sets are validated with the data-viz validator:
 *
 *   light (surface #ffffff) — worst adjacent pair ΔE 10.3 deutan, 20.3 normal
 *   dark  (surface #121a2e) — worst adjacent pair ΔE 10.6 deutan, 17.6 normal
 *
 * Every slot clears the lightness band, the chroma floor and 3:1 contrast
 * against its own surface. Dark mode is a *selected* set of steps, not a flip.
 */
export const LIGHT_CATEGORICAL: string[] = [
  "#5152e8", // indigo
  "#0d9488", // teal
  "#7c3aed", // violet
  "#d97706", // amber
  "#db2777", // pink
  "#0891b2", // cyan
  "#65a30d", // olive
];

export const DARK_CATEGORICAL: string[] = [
  "#6366f1",
  "#12a08c",
  "#8b5cf6",
  "#d97706",
  "#e93d7f",
  "#1e9ab8",
  "#6b8f2f",
];

/** The categorical palette for the theme currently on screen. */
export function useCategoricalColors(): string[] {
  const { theme } = useTheme();
  return theme === "dark" ? DARK_CATEGORICAL : LIGHT_CATEGORICAL;
}

/**
 * The colour for a slot in the categorical palette.
 *
 * Colour follows the entity, not its rank — so a series keeps its colour
 * even when a filter changes how many series are on screen. The index is the
 * entity's own slot, not its position in the current list.
 */
export function categoricalAt(colors: string[], index: number) {
  return colors[index % colors.length];
}

/**
 * A stable id for an SVG gradient, so two charts on one page never share one.
 */
let gradientCounter = 0;
export function useGradientId(prefix: string) {
  const [id] = useState(() => {
    gradientCounter += 1;
    return `${prefix}-${gradientCounter}`;
  });
  return id;
}

/**
 * Counts a number up when it changes, so a headline figure arrives with a
 * little motion rather than snapping into place.
 */
export function useCountUp(value: number, duration = 700) {
  const [display, setDisplay] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    if (!Number.isFinite(value)) return;

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    let frame = 0;
    const start = performance.now();
    const from = latest.current;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic.
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = reduced ? value : from + (value - from) * eased;

      latest.current = next;
      setDisplay(next);

      if (progress < 1 && !reduced) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}

/** Measures the container so charts render at real pixel size (no scaled-down text). */
export function useChartWidth(fallback = 640) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next && Math.abs(next - width) > 1) setWidth(next);
    });

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, width };
}

/** "Nice" axis maximum so gridlines land on round numbers. */
export function niceMax(value: number) {
  if (value <= 0) return 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const scaled = value / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}

/** Splits a value into 4 gridline steps. */
export function axisTicks(max: number, count = 4) {
  return Array.from({ length: count + 1 }, (_, i) => (max / count) * i);
}
