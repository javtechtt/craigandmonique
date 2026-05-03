"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { submitRsvp } from "@/app/actions/rsvp";
import type { RsvpStatus } from "@/lib/rsvpStatus";
import { formatShortDate } from "@/lib/formatDate";
import { cn } from "@/lib/cn";

interface RSVPSectionProps {
  config: WeddingConfig;
  /**
   * Live deadline status, computed server-side in `page.tsx` and
   * threaded through. Drives whether the form is open, shows a
   * countdown banner, or is replaced by a closed-state card.
   */
  rsvpStatus?: RsvpStatus;
}

const DEFAULT_MEAL_OPTIONS = [
  "Standard",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
];

const DEFAULT_RSVP_STATUS: RsvpStatus = {
  state: "open",
  daysRemaining: 0,
  deadlineLabel: null,
};

/**
 * RSVP form — calls the `submitRsvp` Server Action with the form data.
 *
 * Backend behaviour depends on env vars (see `src/app/actions/rsvp.ts`):
 *   - Supabase configured → row inserted into `rsvps`
 *   - Resend configured → couple emailed a notification
 *   - Neither → server logs and returns success (dev mode)
 *
 * Three render states drive the UI:
 *   - status `closed` (past the RSVP deadline) → locked card
 *   - status `ending-soon` (≤ 7 days left) → form + gold reminder
 *   - status `open` (default) → form rendered as normal
 *
 * Inside the open form, a `success` state replaces the form with a
 * thank-you card, and submission errors render in a banner above.
 */
export function RSVPSection({
  config,
  rsvpStatus = DEFAULT_RSVP_STATUS,
}: RSVPSectionProps) {
  const { rsvp, couple, weddingDate, timezone } = config;

  type Status = "idle" | "success";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mealOptions =
    rsvp.mealOptions && rsvp.mealOptions.length > 0
      ? rsvp.mealOptions
      : DEFAULT_MEAL_OPTIONS;

  const [mealPreference, setMealPreference] = useState(mealOptions[0]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await submitRsvp(data);
      if (result.ok) {
        setStatus("success");
      } else {
        setError(
          result.error ??
            "Something went wrong sending your RSVP. Please try again.",
        );
      }
    });
  }

  const isClosed = rsvpStatus.state === "closed";
  const isEndingSoon = rsvpStatus.state === "ending-soon";

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
          {isClosed ? (
            <ClosedCard
              displayName={couple.displayName}
              deadlineLabel={rsvpStatus.deadlineLabel}
            />
          ) : status === "success" ? (
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
              {isEndingSoon && rsvpStatus.deadlineLabel ? (
                <DeadlineBanner
                  daysRemaining={rsvpStatus.daysRemaining}
                  deadlineLabel={rsvpStatus.deadlineLabel}
                />
              ) : null}

              {error ? (
                <div
                  role="alert"
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, #b8975a 20%, var(--color-cream))",
                    border:
                      "1px solid color-mix(in srgb, #b8975a 60%, transparent)",
                    color: "var(--color-charcoal)",
                  }}
                >
                  {error}
                </div>
              ) : null}

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

              <fieldset className="flex flex-col gap-3">
                <legend
                  className="text-[0.65rem] font-medium uppercase tracking-[0.4em]"
                  style={{ color: "var(--color-sage-dark)" }}
                >
                  Meal preference
                  <span aria-hidden style={{ color: "var(--color-gold)" }}>
                    {" *"}
                  </span>
                </legend>
                <div
                  className={cn(
                    "grid gap-3",
                    mealOptions.length <= 2
                      ? "grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-2",
                  )}
                >
                  {mealOptions.map((opt) => (
                    <MealOption
                      key={opt}
                      name="mealPreference"
                      value={opt}
                      label={opt}
                      selected={mealPreference === opt}
                      onSelect={() => setMealPreference(opt)}
                    />
                  ))}
                </div>
              </fieldset>

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
                  disabled={isPending}
                >
                  {isPending ? "Sending…" : "Send RSVP"}
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
            {" *"}
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

interface MealOptionProps {
  name: string;
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function MealOption({
  name,
  value,
  label,
  selected,
  onSelect,
}: MealOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-medium tracking-wide transition-colors",
        "focus-within:ring-2 focus-within:ring-offset-1",
      )}
      style={{
        backgroundColor: selected
          ? "var(--color-sage-dark)"
          : "color-mix(in srgb, var(--color-cream) 60%, var(--color-sage) 8%)",
        color: selected ? "var(--color-cream)" : "var(--color-charcoal)",
        border:
          "1px solid color-mix(in srgb, var(--color-sage) 60%, transparent)",
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      {label}
    </label>
  );
}

interface DeadlineBannerProps {
  daysRemaining: number;
  deadlineLabel: string;
}

function DeadlineBanner({
  daysRemaining,
  deadlineLabel,
}: DeadlineBannerProps) {
  const message =
    daysRemaining <= 1
      ? `Last day to RSVP — responses close after ${deadlineLabel}.`
      : `Only ${daysRemaining} days left to RSVP — responses close on ${deadlineLabel}.`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl px-4 py-3 text-xs font-medium uppercase tracking-[0.32em]"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-gold) 22%, var(--color-cream))",
        border:
          "1px solid color-mix(in srgb, var(--color-gold) 65%, transparent)",
        color: "var(--color-gold)",
      }}
    >
      {message}
    </div>
  );
}

interface ClosedCardProps {
  displayName: string;
  deadlineLabel: string | null;
}

function ClosedCard({ displayName, deadlineLabel }: ClosedCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
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
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </span>

      <h3
        className="font-serif text-3xl sm:text-4xl"
        style={{ color: "var(--color-charcoal)" }}
      >
        RSVPs are closed
      </h3>

      <p
        className="max-w-md text-sm leading-relaxed sm:text-base"
        style={{ color: "var(--color-sage-dark)" }}
      >
        {deadlineLabel
          ? `Responses closed on ${deadlineLabel}. Please contact ${displayName} directly if you'd like to reach them about your RSVP.`
          : `Responses are no longer being accepted. Please contact ${displayName} directly if you'd like to reach them about your RSVP.`}
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
