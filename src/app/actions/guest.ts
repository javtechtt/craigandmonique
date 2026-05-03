"use server";

import { weddingConfig } from "@/data/wedding.config";
import {
  getSupabase,
  GUESTS_TABLE,
  isSupabaseConfigured,
  type GuestRow,
} from "@/lib/rsvpServer";

export interface PublicGuest {
  token: string;
  fullName: string;
  partySize: number;
  responded: boolean;
}

export type GuestLookupResult =
  | { ok: true; guest: PublicGuest }
  | { ok: false; reason: "not-found" | "not-configured" | "error" };

const TOKEN_PATTERN = /^[a-z0-9-]{1,120}$/;

/**
 * Server Action: look up an invite by its URL token.
 *
 * Returns a `PublicGuest` shape with only the fields the client needs
 * — no created_at, no internal IDs, just enough to drive the form
 * (full name, party size for the +1/+2 toggle, and whether they've
 * already submitted so we can show a "thanks, already received"
 * message instead of letting them double-submit).
 *
 * Tolerates Supabase being unconfigured (returns `not-configured`)
 * so the form falls back to anonymous mode in dev.
 */
export async function lookupGuestByToken(
  rawToken: string,
): Promise<GuestLookupResult> {
  // Sanitise the token before it touches the database. Anything outside
  // the slug character set is treated as not-found rather than queried.
  const token = String(rawToken ?? "")
    .toLowerCase()
    .trim();
  if (!token || !TOKEN_PATTERN.test(token)) {
    return { ok: false, reason: "not-found" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(GUESTS_TABLE)
      .select("token, full_name, party_size, responded")
      .eq("wedding_slug", weddingConfig.slug)
      .eq("token", token)
      .maybeSingle();

    if (error) {
      console.error("[guest] lookup failed:", error.message);
      return { ok: false, reason: "error" };
    }

    if (!data) {
      return { ok: false, reason: "not-found" };
    }

    const row = data as Pick<
      GuestRow,
      "token" | "full_name" | "party_size" | "responded"
    >;
    return {
      ok: true,
      guest: {
        token: row.token,
        fullName: row.full_name,
        partySize: row.party_size,
        responded: row.responded,
      },
    };
  } catch (err) {
    console.error("[guest] lookup threw:", err);
    return { ok: false, reason: "error" };
  }
}
