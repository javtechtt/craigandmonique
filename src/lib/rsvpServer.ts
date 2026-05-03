import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared server-only helpers for the RSVP backend.
 *
 * The site runs in three modes depending on which env vars are configured:
 *
 *   1. Both Supabase + Resend → store every RSVP and email the couple
 *      a notification per submission.
 *   2. Resend only → email the couple, no persistence.
 *   3. Neither (dev) → log to the server console, return success so the
 *      UI flow stays exercised.
 *
 * All env reads happen lazily so a missing var does not blow up the
 * server bundle at import time — only when an action actually tries to
 * use that integration.
 */

export interface RsvpRow {
  id?: number;
  created_at?: string;
  wedding_slug: string;
  full_name: string;
  contact: string;
  attending: boolean;
  guest_count: number;
  meal_preference: string | null;
  message: string | null;
}

export const RSVP_TABLE = "rsvps";

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY,
  );
}

/**
 * Returns a singleton Supabase client built with the service role key
 * (server-only). Throws if env vars aren't set — callers must guard
 * with `isSupabaseConfigured()` first.
 */
export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing — set SUPABASE_URL and SUPABASE_SERVICE_KEY.",
    );
  }
  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
