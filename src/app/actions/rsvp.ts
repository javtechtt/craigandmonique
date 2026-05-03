"use server";

import { Resend } from "resend";
import { weddingConfig } from "@/data/wedding.config";
import { computeRsvpStatus } from "@/lib/rsvpStatus";
import {
  getSupabase,
  GUESTS_TABLE,
  isSupabaseConfigured,
  RSVP_TABLE,
  type RsvpRow,
} from "@/lib/rsvpServer";

export interface RsvpActionResult {
  ok: boolean;
  error?: string;
}

const MAX_NAME = 200;
const MAX_CONTACT = 200;
const MAX_MESSAGE = 2000;
const MAX_PARTY_EXTRAS = 9; // primary + up to 9 plus-ones

/**
 * Server Action: validate and persist an RSVP. Called from the
 * `RSVPSection` form. Returns a serializable result so the client
 * can render success/error inline.
 *
 * Multi-person submissions:
 *   - The form posts the primary's fields under fullName / contact /
 *     mealPreference / message
 *   - For each plus-one (driven by the invitation's party_size) the
 *     form posts plusName_1 / plusMeal_1, plusName_2 / plusMeal_2, …
 *   - We file one rsvp row per person whose name is filled in. The
 *     primary's `contact` and `message` are echoed onto each row so
 *     follow-up emails can reach the whole invite via one address.
 *
 * Reachable as a POST endpoint by anyone who knows the action ID, so
 * every input is validated and bounded. No rate limiting yet — note
 * for a future engagement.
 */
export async function submitRsvp(
  formData: FormData,
): Promise<RsvpActionResult> {
  // 1. Server-side deadline guard.
  const status = computeRsvpStatus(
    weddingConfig.rsvp.deadline,
    weddingConfig.timezone,
  );
  if (status.state === "closed") {
    return {
      ok: false,
      error:
        "RSVPs are closed. Please contact the couple directly if you'd like to follow up.",
    };
  }

  // 2. Coerce + trim primary inputs
  const fullName = String(formData.get("fullName") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const primaryMeal = String(formData.get("mealPreference") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const guestToken = sanitiseToken(String(formData.get("guestToken") ?? ""));

  // 3. Validate primary
  if (!fullName) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (fullName.length > MAX_NAME) {
    return { ok: false, error: "Name is too long." };
  }
  if (!contact) {
    return { ok: false, error: "Please enter an email or phone number." };
  }
  if (contact.length > MAX_CONTACT) {
    return { ok: false, error: "Contact is too long." };
  }
  if (message.length > MAX_MESSAGE) {
    return { ok: false, error: "Message is too long." };
  }

  const allowedMeals = weddingConfig.rsvp.mealOptions ?? [];
  const pickMeal = (raw: string): string | null => {
    const trimmed = raw.trim();
    return allowedMeals.includes(trimmed)
      ? trimmed
      : (allowedMeals[0] ?? null);
  };

  // 4. Build the row list. Primary first, then any plus-one whose
  //    name was filled in.
  const rows: RsvpRow[] = [
    {
      wedding_slug: weddingConfig.slug,
      full_name: fullName,
      contact,
      attending: true,
      guest_count: 1,
      meal_preference: pickMeal(primaryMeal),
      message: message || null,
      guest_token: guestToken || null,
    },
  ];

  for (let i = 1; i <= MAX_PARTY_EXTRAS; i += 1) {
    const plusName = String(formData.get(`plusName_${i}`) ?? "").trim();
    if (!plusName) continue;
    if (plusName.length > MAX_NAME) {
      return {
        ok: false,
        error: `Plus-one #${i} name is too long.`,
      };
    }
    const plusMeal = String(formData.get(`plusMeal_${i}`) ?? "").trim();
    rows.push({
      wedding_slug: weddingConfig.slug,
      full_name: plusName,
      // Plus-ones share the primary's contact and message — there's
      // no separate field for them on the form.
      contact,
      attending: true,
      guest_count: 1,
      meal_preference: pickMeal(plusMeal),
      message: message ? `(via ${fullName}) ${message}` : null,
      guest_token: guestToken || null,
    });
  }

  // 5. Persist to Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from(RSVP_TABLE).insert(rows);
      if (error) {
        console.error("[rsvp] supabase insert failed:", error.message);
        return {
          ok: false,
          error:
            "We couldn't save your response. Please try again, or message Craig directly.",
        };
      }

      // Mark the invite as responded so the admin "pending" view shrinks.
      if (guestToken) {
        const { error: guestUpdateError } = await supabase
          .from(GUESTS_TABLE)
          .update({
            responded: true,
            responded_at: new Date().toISOString(),
          })
          .eq("wedding_slug", weddingConfig.slug)
          .eq("token", guestToken);
        if (guestUpdateError) {
          // Not fatal — the rsvps already landed. Log and move on.
          console.error(
            "[rsvp] failed to mark guest responded:",
            guestUpdateError.message,
          );
        }
      }
    } catch (err) {
      console.error("[rsvp] supabase threw:", err);
      return {
        ok: false,
        error: "Something went wrong saving your RSVP. Please try again.",
      };
    }
  }

  // 6. Notify the couple by email if Resend is configured.
  //    COUPLE_EMAIL accepts a single address or a comma-separated list
  //    so multiple stakeholders (e.g. each partner's inbox) can receive
  //    the notification without forwarding rules.
  const recipients = parseCoupleEmails(process.env.COUPLE_EMAIL);
  if (process.env.RESEND_API_KEY && recipients.length > 0) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromAddress =
        process.env.RESEND_FROM_EMAIL ?? "RSVPs <onboarding@resend.dev>";
      const partyLines = rows.map(
        (row, idx) =>
          `${idx === 0 ? "Primary" : `Plus-${idx}`}: ${row.full_name}` +
          (row.meal_preference ? ` — ${row.meal_preference}` : ""),
      );
      await resend.emails.send({
        from: fromAddress,
        to: recipients,
        subject: `New RSVP — ${fullName}${rows.length > 1 ? ` (+${rows.length - 1})` : ""}`,
        text: [
          `New RSVP for ${weddingConfig.couple.displayName}.`,
          ``,
          guestToken ? `Invite token: ${guestToken}` : `(no token — anonymous form)`,
          `Contact: ${contact}`,
          ``,
          ...partyLines,
          ``,
          `Message: ${message || "(none)"}`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("[rsvp] resend send failed:", err);
    }
  }

  // 7. Dev fallback
  if (!isSupabaseConfigured() && !process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[rsvp dev] received:", rows);
    }
  }

  return { ok: true };
}

const TOKEN_PATTERN = /^[a-z0-9-]{1,120}$/;

function sanitiseToken(raw: string): string {
  const t = raw.toLowerCase().trim();
  return TOKEN_PATTERN.test(t) ? t : "";
}

/**
 * Accept `COUPLE_EMAIL` as either a single address or a comma- /
 * semicolon-separated list. Strips any stray quotes the env file
 * picks up and filters anything that doesn't look like an address.
 */
function parseCoupleEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]/)
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ""))
    .filter((part) => part.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part));
}
