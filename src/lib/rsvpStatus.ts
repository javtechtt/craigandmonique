import { getWeddingMoment, formatShortDate } from "@/lib/formatDate";

export type RsvpDeadlineState = "open" | "ending-soon" | "closed";

export interface RsvpStatus {
  state: RsvpDeadlineState;
  daysRemaining: number;
  deadlineLabel: string | null;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ENDING_SOON_THRESHOLD_DAYS = 7;

/**
 * Resolve the live RSVP deadline status from the configured ISO and
 * timezone. Computed server-side so the result is deterministic at
 * render time and serialises cleanly across the client boundary.
 *
 * - `open`         — more than 7 days remain, no banner
 * - `ending-soon`  — 7 days or fewer remain, render a gold banner
 * - `closed`       — deadline passed, lock the form behind a notice
 */
export function computeRsvpStatus(
  deadlineIso: string | undefined,
  timezone: string,
): RsvpStatus {
  if (!deadlineIso) {
    return { state: "open", daysRemaining: 0, deadlineLabel: null };
  }
  const deadlineMs = getWeddingMoment(deadlineIso, timezone);
  if (deadlineMs === null) {
    return { state: "open", daysRemaining: 0, deadlineLabel: null };
  }

  const remainingMs = deadlineMs - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / MS_PER_DAY));
  const deadlineLabel = formatShortDate(deadlineIso, { timezone });

  if (remainingMs <= 0) {
    return { state: "closed", daysRemaining: 0, deadlineLabel };
  }
  if (daysRemaining <= ENDING_SOON_THRESHOLD_DAYS) {
    return { state: "ending-soon", daysRemaining, deadlineLabel };
  }
  return { state: "open", daysRemaining, deadlineLabel };
}
