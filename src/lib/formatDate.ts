import type { ISODateString } from "@/types/wedding";

const DEFAULT_LOCALE = "en-US";

/**
 * Format helpers for the wedding template. All accept an ISO timestamp from
 * `wedding.config.ts` and return a human-readable string. The timezone is
 * threaded through so the displayed date matches the venue's local time
 * regardless of the visitor's browser locale.
 */

export function formatWeddingDate(
  iso: ISODateString,
  options: { timezone?: string; locale?: string } = {},
): string {
  const { timezone, locale = DEFAULT_LOCALE } = options;
  return new Date(iso).toLocaleDateString(locale, {
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
  return new Date(iso).toLocaleDateString(locale, {
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
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  });
}

/** Whole days remaining until the wedding. Returns 0 once the date has passed. */
export function daysUntil(iso: ISODateString): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  if (target <= now) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((target - now) / msPerDay);
}
