"use client";

import { useState, type FormEvent } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { formatShortDate } from "@/lib/formatDate";
import { cn } from "@/lib/cn";

interface RSVPSectionProps {
  config: WeddingConfig;
}

const DEFAULT_MEAL_OPTIONS = [
  "Standard",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
];

/**
 * RSVP form — client component because it manages submit state.
 *
 * Submitting prevents default, logs the payload, and swaps the form for
 * a success card. Wiring to a real backend is intentionally deferred.
 *
 * --- Supabase integration TODO ------------------------------------------
 * 1. Create `rsvps` table:
 *      id uuid pk default uuid_generate_v4()
 *      created_at timestamptz default now()
 *      full_name text, contact text, attending boolean,
 *      guest_count int, meal_preference text, message text,
 *      wedding_slug text -- to support multi-couple deployments
 *
 * 2. Add row-level security: insert allowed for anon, select restricted
 *    to the couple's authenticated session.
 *
 * 3. Replace the `// TODO(supabase)` block in `handleSubmit` with:
 *      import { createClient } from "@supabase/supabase-js";
 *      const supabase = createClient(URL, ANON_KEY);
 *      const { error } = await supabase.from("rsvps").insert(payload);
 *      if (error) { setStatus("error"); return; }
 *
 * 4. Surface `status === "error"` in the UI (toast / inline banner).
 * ------------------------------------------------------------------------
 */
export function RSVPSection({ config }: RSVPSectionProps) {
  const { rsvp, couple, weddingDate, timezone } = config;

  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const mealOptions =
    rsvp.mealOptions && rsvp.mealOptions.length > 0
      ? rsvp.mealOptions
      : DEFAULT_MEAL_OPTIONS;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const data = new FormData(event.currentTarget);
    const payload = {
      weddingSlug: config.slug,
      fullName: String(data.get("fullName") ?? "").trim(),
      contact: String(data.get("contact") ?? "").trim(),
      attending: true,
      // Each guest registers separately, so the count is always 1.
      guestCount: 1,
      mealPreference: String(data.get("mealPreference") ?? ""),
      message: String(data.get("message") ?? "").trim(),
      submittedAt: new Date().toISOString(),
    };

    // TODO(supabase): replace this stub with a real insert. See the
    // header comment above for the schema and integration steps.
    if (process.env.NODE_ENV !== "production") {
      console.info("[RSVP placeholder]", payload);
    }

    // Simulate a tiny round-trip so the success state feels intentional.
    window.setTimeout(() => setStatus("success"), 350);
  }

  return (
    <section
      id="rsvp"
      className="relative isolate overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-sage) 30%, var(--color-cream))",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 -z-10 size-[28rem] rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: "var(--color-sage)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 -z-10 size-[22rem] rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: "var(--color-gold)" }}
      />

      <Container size="md" className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Will you join us?"
          title="RSVP"
          description={rsvp.description}
        />

        <div
          className="rounded-3xl px-6 py-10 sm:px-12 sm:py-14"
          style={{
            backgroundColor: "var(--color-cream)",
            border:
              "1px solid color-mix(in srgb, var(--color-sage) 60%, transparent)",
            boxShadow:
              "0 30px 60px -36px color-mix(in srgb, var(--color-sage-dark) 60%, transparent)",
          }}
        >
          {status === "success" ? (
            <SuccessCard
              displayName={couple.displayName}
              weddingDate={weddingDate}
              timezone={timezone}
            />
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-7"
            >
              <Field id="fullName" label="Full name" required>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className={INPUT_CLASS}
                  style={INPUT_STYLE}
                />
              </Field>

              <Field id="contact" label="Email or phone" required>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                  style={INPUT_STYLE}
                />
              </Field>

              <fieldset className="flex flex-col gap-3">
                <legend
                  className="text-[0.65rem] font-medium uppercase tracking-[0.4em]"
                  style={{ color: "var(--color-sage-dark)" }}
                >
                  Attendance
                </legend>
                <AttendanceOption
                  name="attending"
                  value="yes"
                  label="Joyfully accept"
                />
              </fieldset>

              <Field id="mealPreference" label="Meal preference" required>
                <select
                  id="mealPreference"
                  name="mealPreference"
                  required
                  defaultValue={mealOptions[0]}
                  className={INPUT_CLASS}
                  style={INPUT_STYLE}
                >
                  {mealOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="message" label="A note for the couple">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Allergies, song requests, well-wishes…"
                  className={cn(INPUT_CLASS, "resize-none")}
                  style={INPUT_STYLE}
                />
              </Field>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
                <p
                  className="text-xs italic"
                  style={{ color: "var(--color-sage-dark)" }}
                >
                  Your response helps us plan a perfect day.
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Sending…" : "Send RSVP"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl px-4 py-3 text-base outline-none transition focus:ring-2 focus:ring-offset-1 placeholder:opacity-50";

const INPUT_STYLE: React.CSSProperties = {
  backgroundColor:
    "color-mix(in srgb, var(--color-cream) 60%, var(--color-sage) 8%)",
  border: "1px solid color-mix(in srgb, var(--color-sage) 50%, transparent)",
  color: "var(--color-charcoal)",
};

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ id, label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[0.65rem] font-medium uppercase tracking-[0.4em]"
        style={{ color: "var(--color-sage-dark)" }}
      >
        {label}
        {required ? (
          <span aria-hidden style={{ color: "var(--color-gold)" }}>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}

interface AttendanceOptionProps {
  name: string;
  value: string;
  label: string;
}

function AttendanceOption({ name, value, label }: AttendanceOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-default items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-medium tracking-wide",
        "focus-within:ring-2 focus-within:ring-offset-1",
      )}
      style={{
        backgroundColor: "var(--color-sage-dark)",
        color: "var(--color-cream)",
        border:
          "1px solid color-mix(in srgb, var(--color-sage-dark) 80%, transparent)",
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked
        readOnly
        className="sr-only"
      />
      {label}
    </label>
  );
}

interface SuccessCardProps {
  displayName: string;
  weddingDate: string;
  timezone: string;
}

function SuccessCard({
  displayName,
  weddingDate,
  timezone,
}: SuccessCardProps) {
  return (
    <div
      className="flex flex-col items-center gap-4 py-6 text-center"
      style={{ animation: "hero-fade-up 0.6s ease-out both" }}
    >
      <span
        className="flex size-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--color-sage-dark)",
          color: "var(--color-cream)",
        }}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>

      <h3
        className="font-serif text-3xl sm:text-4xl"
        style={{ color: "var(--color-charcoal)" }}
      >
        Thank you
      </h3>

      <p
        className="max-w-md text-sm leading-relaxed sm:text-base"
        style={{ color: "var(--color-sage-dark)" }}
      >
        {`We can't wait to celebrate with you. ${displayName} have your RSVP, and you'll receive a confirmation closer to ${formatShortDate(weddingDate, { timezone })}.`}
      </p>

      <p
        className="text-[0.65rem] uppercase tracking-[0.4em]"
        style={{ color: "var(--color-gold)" }}
      >
        With love
      </p>
    </div>
  );
}

export default RSVPSection;
