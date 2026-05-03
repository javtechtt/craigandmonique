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

export type GuestSearchResult =
  | { ok: true; matches: PublicGuest[] }
  | { ok: false; reason: "too-short" | "not-configured" | "error" };

const TOKEN_PATTERN = /^[a-z0-9-]{1,120}$/;
const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_RESULTS = 10;

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

/**
 * Server Action: case-insensitive search for invited guests by name.
 *
 * Powers the "Find your invitation" recovery flow on the RSVP section
 * for guests who lost their personalised link. Match logic is a simple
 * `ilike '%query%'` against `full_name` so partial first/last name input
 * still matches. Results are capped at `MAX_SEARCH_RESULTS` to keep
 * the response payload (and rendered list) manageable.
 *
 * The token returned here is already deterministically derivable from
 * the guest's name (slugified), so this endpoint doesn't expose
 * anything that wasn't already inferable. Anyone who wanted to brute
 * force the guest list could already do so by guessing tokens.
 */
export async function searchGuestsByName(
  rawQuery: string,
): Promise<GuestSearchResult> {
  const query = String(rawQuery ?? "").trim();
  if (query.length < MIN_SEARCH_LENGTH) {
    return { ok: false, reason: "too-short" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  // Strip Postgres `ilike` wildcards from the user's input so they can't
  // craft a query that matches everything (`%`) or every-character-but-
  // these (`_`). We're already using parameterised queries via the
  // Supabase client, but escaping the LIKE meta-chars keeps the search
  // semantics predictable.
  const safe = query.replace(/[%_]/g, "");
  if (safe.length < MIN_SEARCH_LENGTH) {
    return { ok: false, reason: "too-short" };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(GUESTS_TABLE)
      .select("token, full_name, party_size, responded")
      .eq("wedding_slug", weddingConfig.slug)
      .ilike("full_name", `%${safe}%`)
      .order("full_name", { ascending: true })
      .limit(MAX_SEARCH_RESULTS);

    if (error) {
      console.error("[guest] search failed:", error.message);
      return { ok: false, reason: "error" };
    }

    const rows = (data ?? []) as Pick<
      GuestRow,
      "token" | "full_name" | "party_size" | "responded"
    >[];
    const matches: PublicGuest[] = rows.map((row) => ({
      token: row.token,
      fullName: row.full_name,
      partySize: row.party_size,
      responded: row.responded,
    }));
    return { ok: true, matches };
  } catch (err) {
    console.error("[guest] search threw:", err);
    return { ok: false, reason: "error" };
  }
}
