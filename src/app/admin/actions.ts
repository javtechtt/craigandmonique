"use server";

import { revalidatePath } from "next/cache";
import { weddingConfig } from "@/data/wedding.config";
import {
  getSupabase,
  GUESTS_TABLE,
  isSupabaseConfigured,
  RSVP_TABLE,
} from "@/lib/rsvpServer";
import { slugifyName } from "@/lib/slug";

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

export interface AddPendingGuestResult extends AdminActionResult {
  /** The slugified token assigned to the new guest, returned on success. */
  token?: string;
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

/**
 * Add a brand-new invitation to the `guests` table. The token is
 * derived from the supplied name via `slugifyName`; uniqueness is
 * enforced at the DB level (the column is `unique`), so adding a
 * second guest with the same slugified name returns a friendly error
 * rather than failing opaquely.
 */
export async function addPendingGuest(
  formData: FormData,
): Promise<AddPendingGuestResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const partySizeRaw = String(formData.get("partySize") ?? "1").trim();
  const partySize = Number.parseInt(partySizeRaw, 10);

  if (!fullName) return { ok: false, error: "Name is required." };
  if (fullName.length > 200) return { ok: false, error: "Name is too long." };
  if (!Number.isFinite(partySize) || partySize < 1 || partySize > 10) {
    return { ok: false, error: "Party size must be between 1 and 10." };
  }

  const token = slugifyName(fullName);
  if (!TOKEN_PATTERN.test(token)) {
    return {
      ok: false,
      error:
        "Couldn't generate a usable token from that name. Please use letters, numbers, spaces or hyphens.",
    };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured." };
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from(GUESTS_TABLE).insert({
      wedding_slug: weddingConfig.slug,
      token,
      full_name: fullName,
      party_size: partySize,
      responded: false,
    });
    if (error) {
      // Postgres unique-constraint violation surfaces as code "23505".
      const isDuplicate =
        (error as { code?: string }).code === "23505" ||
        /duplicate|unique/i.test(error.message);
      if (isDuplicate) {
        return {
          ok: false,
          error: `An invitation with the token "${token}" already exists. Use a more specific name (e.g. include a middle initial) and try again.`,
        };
      }
      console.error("[admin] guest insert failed:", error.message);
      return { ok: false, error: "Couldn't save the invitation." };
    }

    revalidatePath("/admin");
    return { ok: true, token };
  } catch (err) {
    console.error("[admin] guest insert threw:", err);
    return { ok: false, error: "Something went wrong." };
  }
}

/**
 * Delete an invitation from the `guests` table by id. Any RSVP rows
 * already filed under that guest's token are left untouched — they
 * stay visible in "All responses" with the now-orphaned token, and
 * the admin can clean them up individually with `deleteRsvp` if they
 * want to. Guests who have already responded are blocked from this
 * path (the Pending invitations table only renders unresponded rows
 * anyway), so admins must remove the RSVPs first if they need to
 * fully revoke an invite.
 */
export async function deletePendingGuest(
  id: number,
): Promise<AdminActionResult> {
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false, error: "Invalid guest id." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured." };
  }

  try {
    const supabase = getSupabase();

    const { data: row, error: fetchError } = await supabase
      .from(GUESTS_TABLE)
      .select("id, responded")
      .eq("wedding_slug", weddingConfig.slug)
      .eq("id", id)
      .maybeSingle();
    if (fetchError) {
      console.error("[admin] guest delete fetch failed:", fetchError.message);
      return { ok: false, error: "Couldn't read the invitation." };
    }
    if (!row) {
      return { ok: false, error: "That invitation no longer exists." };
    }
    if ((row as { responded?: boolean }).responded) {
      return {
        ok: false,
        error:
          "This guest has already responded. Delete their RSVP first, then come back to remove the invitation.",
      };
    }

    const { error: deleteError } = await supabase
      .from(GUESTS_TABLE)
      .delete()
      .eq("wedding_slug", weddingConfig.slug)
      .eq("id", id);
    if (deleteError) {
      console.error("[admin] guest delete failed:", deleteError.message);
      return { ok: false, error: "Couldn't delete the invitation." };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[admin] guest delete threw:", err);
    return { ok: false, error: "Something went wrong." };
  }
}
