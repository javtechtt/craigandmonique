"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { submitRsvp } from "@/app/actions/rsvp";
import {
  lookupGuestByToken,
  searchGuestsByName,
  type PublicGuest,
} from "@/app/actions/guest";
import type { RsvpStatus } from "@/lib/rsvpStatus";
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

  // Personalised invite — populated by lookupGuestByToken when the URL
  // carries a recognised `?guest=token` param. `null` means we're in
  // anonymous mode (no token, or unrecognised token).
  const searchParams = useSearchParams();
  const guestToken = searchParams.get("guest");
  const [guest, setGuest] = useState<PublicGuest | null>(null);
  const [tokenWarning, setTokenWarning] = useState<string | null>(null);
  // Tracks whether we've finished resolving the URL token. Without
  // this, a valid `?guest=` link briefly renders the search card
  // before the lookup completes — flicker-y.
  const [lookupComplete, setLookupComplete] = useState<boolean>(!guestToken);

  useEffect(() => {
    if (!guestToken) {
      setGuest(null);
      setTokenWarning(null);
      setLookupComplete(true);
      return;
    }
    setLookupComplete(false);
    let cancelled = false;
    (async () => {
      const result = await lookupGuestByToken(guestToken);
      if (cancelled) return;
      if (result.ok) {
        setGuest(result.guest);
        setTokenWarning(null);
      } else if (result.reason === "not-found") {
        setGuest(null);
        setTokenWarning(
          "We couldn't match that invitation link. Please search for your name below.",
        );
      } else {
        setGuest(null);
        setTokenWarning(null);
      }
      setLookupComplete(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [guestToken]);

  // The primary's meal preference is a controlled pill group. Plus-one
  // meals are stored separately, keyed by their slot index (1..N).
  const [mealPreference, setMealPreference] = useState(mealOptions[0]);
  const [plusMeals, setPlusMeals] = useState<Record<number, string>>({});
  const [includePlus, setIncludePlus] = useState<Record<number, boolean>>({});

  function setPlusMeal(idx: number, value: string) {
    setPlusMeals((prev) => ({ ...prev, [idx]: value }));
  }

  function togglePlus(idx: number, on: boolean) {
    setIncludePlus((prev) => ({ ...prev, [idx]: on }));
    if (on && plusMeals[idx] === undefined) {
      setPlusMeal(idx, mealOptions[0]);
    }
  }

  // Number of plus-ones the invitation allows. Cap at 0 outside of a
  // recognised invite (anonymous form has no plus-one fields).
  const plusOnesAllowed = guest ? Math.max(0, guest.partySize - 1) : 0;

  const alreadyResponded = guest?.responded ?? false;

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
          ) : alreadyResponded && guest ? (
            <AlreadyRespondedCard
              fullName={guest.fullName}
              displayName={couple.displayName}
            />
          ) : status === "success" ? (
            <SuccessCard displayName={couple.displayName} />
          ) : !guest && lookupComplete ? (
            <GuestSearchCard
              displayName={couple.displayName}
              tokenWarning={tokenWarning}
            />
          ) : !guest ? (
            <p
              className="text-center text-sm italic"
              style={{ color: "var(--color-sage-dark)" }}
            >
              Loading your invitation…
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-7"
            >
              {guest ? (
                <input type="hidden" name="guestToken" value={guest.token} />
              ) : null}

              {isEndingSoon && rsvpStatus.deadlineLabel ? (
                <DeadlineBanner
                  daysRemaining={rsvpStatus.daysRemaining}
                  deadlineLabel={rsvpStatus.deadlineLabel}
                />
              ) : null}

              {tokenWarning ? (
                <div
                  role="status"
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-sage) 22%, var(--color-cream))",
                    border:
                      "1px solid color-mix(in srgb, var(--color-sage) 60%, transparent)",
                    color: "var(--color-charcoal)",
                  }}
                >
                  {tokenWarning}
                </div>
              ) : null}

              {guest ? (
                <p
                  className="text-sm italic"
                  style={{ color: "var(--color-sage-dark)" }}
                >
                  Welcome, {guest.fullName}.
                  {plusOnesAllowed > 0
                    ? ` Your invitation includes ${plusOnesAllowed === 1 ? "a +1" : `up to ${plusOnesAllowed} additional guests`}.`
                    : ""}
                </p>
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
                  style={
                    guest
                      ? { ...INPUT_STYLE, opacity: 0.85, cursor: "not-allowed" }
                      : INPUT_STYLE
                  }
                  defaultValue={guest?.fullName ?? ""}
                  readOnly={Boolean(guest)}
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

              {plusOnesAllowed > 0
                ? Array.from({ length: plusOnesAllowed }, (_, i) => i + 1).map(
                    (idx) => (
                      <PlusOneFieldset
                        key={idx}
                        index={idx}
                        included={!!includePlus[idx]}
                        onToggle={(on) => togglePlus(idx, on)}
                        mealOptions={mealOptions}
                        meal={plusMeals[idx] ?? mealOptions[0]}
                        onMealChange={(value) => setPlusMeal(idx, value)}
                      />
                    ),
                  )
                : null}

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

interface PlusOneFieldsetProps {
  index: number;
  included: boolean;
  onToggle: (on: boolean) => void;
  mealOptions: string[];
  meal: string;
  onMealChange: (value: string) => void;
}

function PlusOneFieldset({
  index,
  included,
  onToggle,
  mealOptions,
  meal,
  onMealChange,
}: PlusOneFieldsetProps) {
  const fieldId = `plusName_${index}`;
  return (
    <fieldset
      className="flex flex-col gap-3 rounded-2xl px-5 py-4"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-cream) 60%, var(--color-sage) 8%)",
        border:
          "1px solid color-mix(in srgb, var(--color-sage) 50%, transparent)",
      }}
    >
      <legend
        className="px-2 text-[0.65rem] font-medium uppercase tracking-[0.4em]"
        style={{ color: "var(--color-sage-dark)" }}
      >
        {`Plus-one${index === 1 ? "" : ` #${index}`}`}
      </legend>

      <label className="inline-flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={included}
          onChange={(e) => onToggle(e.target.checked)}
          className="size-4 cursor-pointer accent-[color:var(--color-sage-dark)]"
        />
        <span style={{ color: "var(--color-charcoal)" }}>
          {included
            ? "Yes, including a plus-one — details below"
            : "I'm bringing a plus-one"}
        </span>
      </label>

      {included ? (
        <>
          <Field id={fieldId} label="Plus-one's full name" required>
            <input
              id={fieldId}
              name={fieldId}
              type="text"
              required
              autoComplete="off"
              placeholder="Their name"
              className={INPUT_CLASS}
              style={INPUT_STYLE}
            />
          </Field>

          <fieldset className="flex flex-col gap-3">
            <legend
              className="text-[0.65rem] font-medium uppercase tracking-[0.4em]"
              style={{ color: "var(--color-sage-dark)" }}
            >
              Their meal preference
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
                  name={`plusMeal_${index}`}
                  value={opt}
                  label={opt}
                  selected={meal === opt}
                  onSelect={() => onMealChange(opt)}
                />
              ))}
            </div>
          </fieldset>
        </>
      ) : null}
    </fieldset>
  );
}

interface AlreadyRespondedCardProps {
  fullName: string;
  displayName: string;
}

function AlreadyRespondedCard({
  fullName,
  displayName,
}: AlreadyRespondedCardProps) {
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
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>

      <h3
        className="font-serif text-3xl sm:text-4xl"
        style={{ color: "var(--color-charcoal)" }}
      >
        Already received
      </h3>

      <p
        className="max-w-md text-sm leading-relaxed sm:text-base"
        style={{ color: "var(--color-sage-dark)" }}
      >
        {`Thank you, ${fullName} — ${displayName} have your RSVP. If anything's changed, please reach out to them directly.`}
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
}

function SuccessCard({ displayName }: SuccessCardProps) {
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
        {`We can't wait to celebrate with you. ${displayName} have received your RSVP!`}
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

interface GuestSearchCardProps {
  displayName: string;
  /** Optional warning shown when the URL had a token that didn't match. */
  tokenWarning: string | null;
}

/**
 * Recovery card shown when the visitor lands on the page without a
 * recognised personalised invitation link. Searches the `guests` table
 * by name (case-insensitive partial match), then redirects them to
 * `/?guest=<their-token>` on a single match — the existing RSVP flow
 * + invitation popup take over from there.
 *
 * Multiple matches render as a list to disambiguate (rare for a 70-
 * person guest list but happens for shared first names). Zero matches
 * point them at the couple to confirm.
 */
function GuestSearchCard({
  displayName,
  tokenWarning,
}: GuestSearchCardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [matches, setMatches] = useState<PublicGuest[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchError("Please enter at least two letters of your name.");
      setMatches(null);
      return;
    }
    setSearchError(null);
    startSearch(async () => {
      const result = await searchGuestsByName(trimmed);
      if (!result.ok) {
        setSearchError(
          result.reason === "not-configured"
            ? "Guest list isn't available right now. Please reach out to the couple."
            : "Something went wrong. Please try again.",
        );
        setMatches(null);
        return;
      }
      if (result.matches.length === 1) {
        // Single match → straight into the personalised page. The URL
        // change re-runs the lookup effect above and the invitation
        // popup mounts from `app/page.tsx` for the same token.
        router.push(`/?guest=${result.matches[0].token}#rsvp`);
        return;
      }
      setMatches(result.matches);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
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
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>

        <h3
          className="font-serif text-2xl sm:text-3xl"
          style={{ color: "var(--color-charcoal)" }}
        >
          Find your invitation
        </h3>

        <p
          className="max-w-md text-sm leading-relaxed"
          style={{ color: "var(--color-sage-dark)" }}
        >
          RSVPs are for invited guests. Type your name below to find
          your personalised link.
        </p>
      </div>

      {tokenWarning ? (
        <div
          role="status"
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-gold) 18%, var(--color-cream))",
            border:
              "1px solid color-mix(in srgb, var(--color-gold) 55%, transparent)",
            color: "var(--color-charcoal)",
          }}
        >
          {tokenWarning}
        </div>
      ) : null}

      <form
        onSubmit={handleSearch}
        noValidate
        className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        <label htmlFor="guest-search" className="sr-only">
          Your name
        </label>
        <input
          id="guest-search"
          name="guest-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className={cn(INPUT_CLASS, "sm:flex-1")}
          style={INPUT_STYLE}
          enterKeyHint="search"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSearching}
        >
          {isSearching ? "Searching…" : "Find"}
        </Button>
      </form>

      {searchError ? (
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
          {searchError}
        </div>
      ) : null}

      {matches !== null && matches.length === 0 ? (
        <p
          className="rounded-xl px-4 py-4 text-center text-sm leading-relaxed"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-sage) 18%, var(--color-cream))",
            border:
              "1px solid color-mix(in srgb, var(--color-sage) 55%, transparent)",
            color: "var(--color-charcoal)",
          }}
        >
          {`We couldn't find a matching invitation. Please reach out to ${displayName} so they can confirm or share your link.`}
        </p>
      ) : null}

      {matches !== null && matches.length > 1 ? (
        <div className="flex flex-col gap-3">
          <p
            className="text-[0.65rem] font-medium uppercase tracking-[0.4em]"
            style={{ color: "var(--color-sage-dark)" }}
          >
            Select your invitation
          </p>
          <ul className="flex flex-col gap-2">
            {matches.map((match) => (
              <li key={match.token}>
                <button
                  type="button"
                  onClick={() => router.push(`/?guest=${match.token}#rsvp`)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-sm transition hover:bg-[color:var(--color-sage-dark)] hover:text-[color:var(--color-cream)]"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-cream) 60%, var(--color-sage) 8%)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-sage) 50%, transparent)",
                    color: "var(--color-charcoal)",
                  }}
                >
                  <span className="font-medium">{match.fullName}</span>
                  <span
                    aria-hidden
                    className="text-xs uppercase tracking-[0.32em] opacity-70"
                  >
                    Open
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default RSVPSection;
