import type { ISODateString, WeddingEvent } from "@/types/wedding";

/**
 * Build calendar URLs and ICS content for a `WeddingEvent`.
 *
 * The wedding ISO timestamps in `wedding.config.ts` are floating local
 * times (no offset suffix) and are intended to be interpreted in the
 * `WeddingConfig.timezone` zone. These helpers convert them to real UTC
 * moments before writing them into Google / Outlook / ICS payloads, so
 * the event lands at the correct absolute time for any guest no matter
 * where they live.
 */

const DEFAULT_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Treat `iso` as wall-clock time in `timezone` and return the actual UTC
 * milliseconds for that moment. Uses Intl, no external dependency.
 */
export function localTimeInZoneToUtcMs(
  iso: ISODateString,
  timezone: string,
): number {
  const parts = iso.match(/(\d+)/g);
  if (!parts || parts.length < 5) {
    throw new Error(`Unsupported ISO format for calendar export: ${iso}`);
  }
  const [y, mo, d, h, mi, s] = parts.map((p) => Number(p));

  // Pretend the components are UTC. Then ask: when this UTC moment is
  // viewed in `timezone`, what wall-clock time does it show? The
  // difference between the two tells us the zone's offset for this
  // exact instant (handles DST, historical changes, etc.).
  const asIfUtc = Date.UTC(y, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, s ?? 0);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const fp = Object.fromEntries(
    formatter
      .formatToParts(new Date(asIfUtc))
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value]),
  );

  const tzAsUtc = Date.UTC(
    Number(fp.year),
    Number(fp.month) - 1,
    Number(fp.day),
    Number(fp.hour) % 24,
    Number(fp.minute),
    Number(fp.second),
  );

  // Offset (ms) such that the actual UTC moment renders in `timezone`
  // as the wall-clock time we wanted.
  const offset = asIfUtc - tzAsUtc;
  return asIfUtc + offset;
}

function formatUtcCompact(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}` +
    "Z"
  );
}

function buildLocationString(event: WeddingEvent): string {
  return [
    event.venue.name,
    event.venue.addressLine1,
    event.venue.addressLine2,
    event.venue.city,
    event.venue.region,
    event.venue.country,
  ]
    .filter((p): p is string => Boolean(p))
    .join(", ");
}

interface CalendarMoment {
  startUtc: Date;
  endUtc: Date;
  title: string;
  description: string;
  location: string;
}

function eventToMoment(
  event: WeddingEvent,
  timezone: string,
): CalendarMoment {
  const startMs = localTimeInZoneToUtcMs(event.startsAt, timezone);
  const endMs = event.endsAt
    ? localTimeInZoneToUtcMs(event.endsAt, timezone)
    : startMs + DEFAULT_DURATION_MS;
  return {
    startUtc: new Date(startMs),
    endUtc: new Date(endMs),
    title: event.title,
    description: event.description ?? "",
    location: buildLocationString(event),
  };
}

/** Google Calendar "TEMPLATE" deep link. Opens the New Event composer. */
export function buildGoogleCalendarUrl(
  event: WeddingEvent,
  timezone: string,
): string {
  const m = eventToMoment(event, timezone);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: m.title,
    dates: `${formatUtcCompact(m.startUtc)}/${formatUtcCompact(m.endUtc)}`,
    details: m.description,
    location: m.location,
    ctz: timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Outlook (outlook.live.com) "compose" deep link. */
export function buildOutlookCalendarUrl(
  event: WeddingEvent,
  timezone: string,
): string {
  const m = eventToMoment(event, timezone);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: m.title,
    startdt: m.startUtc.toISOString(),
    enddt: m.endUtc.toISOString(),
    body: m.description,
    location: m.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/** Office 365 (outlook.office.com) "compose" deep link. */
export function buildOffice365CalendarUrl(
  event: WeddingEvent,
  timezone: string,
): string {
  const m = eventToMoment(event, timezone);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: m.title,
    startdt: m.startUtc.toISOString(),
    enddt: m.endUtc.toISOString(),
    body: m.description,
    location: m.location,
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Build an ICS file body. Apple Calendar (macOS, iOS) opens .ics files
 * natively, as does Outlook desktop and most other clients. UTC times
 * keep things unambiguous regardless of the guest's machine timezone.
 */
export function buildIcsContent(
  event: WeddingEvent,
  timezone: string,
  options: { uidDomain?: string; productId?: string } = {},
): string {
  const m = eventToMoment(event, timezone);
  const now = formatUtcCompact(new Date());
  const uidDomain = options.uidDomain ?? "craigandmonique.com";
  const productId = options.productId ?? "-//Craig & Monique//Wedding//EN";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${productId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}-${event.startsAt}@${uidDomain}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatUtcCompact(m.startUtc)}`,
    `DTEND:${formatUtcCompact(m.endUtc)}`,
    `SUMMARY:${escapeIcs(m.title)}`,
    m.description ? `DESCRIPTION:${escapeIcs(m.description)}` : "",
    m.location ? `LOCATION:${escapeIcs(m.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return `${lines.join("\r\n")}\r\n`;
}

/**
 * Trigger an .ics download in the browser. Works for Apple Calendar
 * (macOS / iOS) and Outlook desktop / classic.
 */
export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Give the browser a tick to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 250);
}
