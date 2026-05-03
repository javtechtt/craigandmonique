"use server";

import { Resend } from "resend";
import { weddingConfig } from "@/data/wedding.config";
import { computeRsvpStatus } from "@/lib/rsvpStatus";
import {
  getSupabase,
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

/**
 * Server Action: validate and persist an RSVP. Called from the
 * `RSVPSection` form. Returns a serializable result so the client
 * can render success/error inline.
 *
 * Reachable as a POST endpoint by anyone who knows the action ID, so
 * every input is validated and bounded. No rate limiting yet — note
 * for a future engagement.
 */
export async function submitRsvp(
  formData: FormData,
): Promise<RsvpActionResult> {
  // 1. Server-side deadline guard. The client also locks the form
  //    behind a closed-state card once the deadline passes, but a
  //    stale tab or direct POST could still try to submit — so we
  //    re-check the live deadline status here.
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

  // 2. Coerce + trim inputs from FormData
  const fullName = String(formData.get("fullName") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const mealPreference = String(formData.get("mealPreference") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // 3. Validate
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

  // Meal preference must be one of the configured options. Falls back
  // to the first option if the client somehow sent something else.
  const allowed = weddingConfig.rsvp.mealOptions ?? [];
  const meal = allowed.includes(mealPreference)
    ? mealPreference
    : (allowed[0] ?? null);

  const row: RsvpRow = {
    wedding_slug: weddingConfig.slug,
    full_name: fullName,
    contact,
    attending: true, // single-pill UX, always true at submit time
    guest_count: 1, // each guest registers separately
    meal_preference: meal,
    message: message || null,
  };

  // 3. Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from(RSVP_TABLE).insert(row);
      if (error) {
        console.error("[rsvp] supabase insert failed:", error.message);
        return {
          ok: false,
          error:
            "We couldn't save your response. Please try again, or message Craig directly.",
        };
      }
    } catch (err) {
      console.error("[rsvp] supabase threw:", err);
      return {
        ok: false,
        error: "Something went wrong saving your RSVP. Please try again.",
      };
    }
  }

  // 4. Notify the couple by email if Resend is configured
  if (process.env.RESEND_API_KEY && process.env.COUPLE_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromAddress =
        process.env.RESEND_FROM_EMAIL ?? "RSVPs <onboarding@resend.dev>";
      await resend.emails.send({
        from: fromAddress,
        to: process.env.COUPLE_EMAIL,
        subject: `New RSVP — ${fullName}`,
        text: [
          `New RSVP for ${weddingConfig.couple.displayName}.`,
          ``,
          `Name:   ${fullName}`,
          `Contact: ${contact}`,
          `Meal:   ${meal ?? "(unspecified)"}`,
          `Message: ${message || "(none)"}`,
        ].join("\n"),
      });
    } catch (err) {
      // Email failure should not block the user — they're already saved
      // (or in dev, the action is succeeding regardless). Log only.
      console.error("[rsvp] resend send failed:", err);
    }
  }

  // 5. Dev fallback when neither integration is set up
  if (!isSupabaseConfigured() && !process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[rsvp dev] received:", row);
    }
  }

  return { ok: true };
}
