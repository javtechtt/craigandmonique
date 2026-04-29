import type { ISODateString } from "@/types/wedding";
import { localTimeInZoneToUtcMs } from "@/lib/calendar";

const DEFAULT_LOCALE = "en-US";

/**
 * Format helpers for the wedding template. All accept an ISO timestamp from
 * `wedding.config.ts` and return a human-readable string in the wedding's
 * timezone, so the displayed value matches the venue's local time
 * regardless of the visitor's (or server's) browser locale.
 *
 * The wedding ISO strings are typically *floating* times — no `Z` and no
 * `+hh:mm` offset — and are intended to be read as wall-clock time at
 * the venue. The native `new Date(iso)` parser interprets such strings
 * in the server/browser local timezone instead, which silently shifts
 * the rendered hour when those zones differ from the wedding's. To
 * avoid that we resolve the absolute UTC moment ourselves whenever a
 * timezone is supplied.
 */

const HAS_EXPLICIT_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/;

function asWeddingMoment(iso: ISODateString, timezone?: string): Date {
  if (HAS_EXPLICIT_OFFSET.test(iso) || !timezone) return new Date(iso);
  return new Date(localTimeInZoneToUtcMs(iso, timezone));
}

export function formatWeddingDate(
  iso: ISODateString,
  options: { timezone?: string; locale?: string } = {},
): string {
  const { timezone, locale = DEFAULT_LOCALE } = options;
  return asWeddingMoment(iso, timezone).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });
}

export function formatShortDate(
  iso: ISODateString,
  options: { timezone?: string; locale?: string } = {},
): string {
  const { timezone, locale = DEFAULT_LOCALE } = options;
  return asWeddingMoment(iso, timezone).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  });
}

export function formatTime(
  iso: ISODateString,
  options: { timezone?: string; locale?: string } = {},
): string {
  const { timezone, locale = DEFAULT_LOCALE } = options;
  return asWeddingMoment(iso, timezone).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  });
}

/** Whole days remaining until the wedding. Returns 0 once the date has passed. */
export function daysUntil(
  iso: ISODateString,
  options: { timezone?: string } = {},
): number {
  const target = asWeddingMoment(iso, options.timezone).getTime();
  const now = Date.now();
  if (target <= now) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((target - now) / msPerDay);
}

/**
 * Resolve a wedding ISO to its true UTC moment in milliseconds, applying
 * the wedding timezone for floating values. Returns `null` for missing
 * or unparseable input. Useful for tickers, comparisons, etc.
 */
export function getWeddingMoment(
  iso: ISODateString | undefined | null,
  timezone?: string,
): number | null {
  if (!iso) return null;
  const ms = asWeddingMoment(iso, timezone).getTime();
  return Number.isFinite(ms) ? ms : null;
}
