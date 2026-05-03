"use server";

import { revalidatePath } from "next/cache";
import { weddingConfig } from "@/data/wedding.config";
import {
  getSupabase,
  GUESTS_TABLE,
  isSupabaseConfigured,
  RSVP_TABLE,
} from "@/lib/rsvpServer";

/**
 * Admin-only mutations for the RSVP dashboard. These actions live under
 * `/admin` so the existing Basic-Auth proxy at `src/proxy.ts` gates the
 * POST endpoints alongside the page itself — Server Actions invoked
 * from /admin pages route through the same URL, so the matcher catches
 * them.
 */

export interface AdminActionResult {
  ok: boolean;
  error?: string;
}

const TOKEN_PATTERN = /^[a-z0-9-]{1,120}$/;

/**
 * Permanently delete a single RSVP row by id. If the row was tied to a
 * personalised invitation token AND no other RSVPs remain under that
 * token, the guest's `responded` flag is flipped back to false so the
 * "Pending invitations" view reflects reality.
 */
export async function deleteRsvp(id: number): Promise<AdminActionResult> {
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false, error: "Invalid RSVP id." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured." };
  }

  try {
    const supabase = getSupabase();

    // Read the row first so we know which guest token to recompute.
    const { data: row, error: fetchError } = await supabase
      .from(RSVP_TABLE)
      .select("id, guest_token")
      .eq("wedding_slug", weddingConfig.slug)
      .eq("id", id)
      .maybeSingle();
    if (fetchError) {
      console.error("[admin] delete fetch failed:", fetchError.message);
      return { ok: false, error: "Couldn't read the RSVP." };
    }
    if (!row) {
      return { ok: false, error: "That RSVP no longer exists." };
    }

    const { error: deleteError } = await supabase
      .from(RSVP_TABLE)
      .delete()
      .eq("wedding_slug", weddingConfig.slug)
      .eq("id", id);
    if (deleteError) {
      console.error("[admin] delete failed:", deleteError.message);
      return { ok: false, error: "Couldn't delete the RSVP." };
    }

    const token = row.guest_token as string | null;
    if (token) {
      const { count, error: countError } = await supabase
        .from(RSVP_TABLE)
        .select("id", { count: "exact", head: true })
        .eq("wedding_slug", weddingConfig.slug)
        .eq("guest_token", token);
      if (!countError && (count ?? 0) === 0) {
        await supabase
          .from(GUESTS_TABLE)
          .update({ responded: false, responded_at: null })
          .eq("wedding_slug", weddingConfig.slug)
          .eq("token", token);
      }
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[admin] delete threw:", err);
    return { ok: false, error: "Something went wrong." };
  }
}

/**
 * Manually add an RSVP from the admin panel. Mirrors the public
 * `submitRsvp` shape but skips the Resend notification (the couple
 * already knows — they're entering it themselves) and the deadline
 * check (admins can record late responses).
 */
export async function addRsvpManually(
  formData: FormData,
): Promise<AdminActionResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const mealPreference = String(formData.get("mealPreference") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const rawToken = String(formData.get("guestToken") ?? "")
    .toLowerCase()
    .trim();
  const guestToken = rawToken && TOKEN_PATTERN.test(rawToken) ? rawToken : null;

  if (!fullName) return { ok: false, error: "Name is required." };
  if (fullName.length > 200) return { ok: false, error: "Name is too long." };
  if (contact.length > 200) return { ok: false, error: "Contact is too long." };
  if (message.length > 2000)
    return { ok: false, error: "Message is too long." };

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured." };
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from(RSVP_TABLE).insert({
      wedding_slug: weddingConfig.slug,
      full_name: fullName,
      contact: contact || "(added by admin)",
      attending: true,
      guest_count: 1,
      meal_preference: mealPreference || null,
      message: message || null,
      guest_token: guestToken,
    });
    if (error) {
      console.error("[admin] insert failed:", error.message);
      return { ok: false, error: "Couldn't save the RSVP." };
    }

    if (guestToken) {
      await supabase
        .from(GUESTS_TABLE)
        .update({
          responded: true,
          responded_at: new Date().toISOString(),
        })
        .eq("wedding_slug", weddingConfig.slug)
        .eq("token", guestToken);
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[admin] insert threw:", err);
    return { ok: false, error: "Something went wrong." };
  }
}
