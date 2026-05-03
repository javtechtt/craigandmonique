"use client";

import { useState, useTransition, type FormEvent } from "react";
import { addRsvpManually } from "@/app/admin/actions";

interface AddRsvpFormProps {
  /** Meal options pulled from the wedding config so the labels stay in sync. */
  mealOptions: string[];
  /**
   * Pending invitations (token + name + party size) the admin can attach
   * a manual entry to. Selecting one auto-fills the name and stamps the
   * token onto the row so the "Pending invitations" view shrinks.
   */
  pendingInvitations: ReadonlyArray<{
    token: string;
    fullName: string;
    partySize: number;
  }>;
}

/**
 * Toggle-able panel above the All Responses table. Lets the couple
 * record an RSVP from a guest who replied via WhatsApp / phone / email
 * instead of using the website. Optionally attaches a personalised
 * invite token so the Pending invitations list updates.
 */
export function AddRsvpForm({ mealOptions, pendingInvitations }: AddRsvpFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    // Capture the form element AND any submitted values up front. After
    // an `await`, React nulls out `event.currentTarget`, so reaching
    // for it later throws — which Next.js surfaces as an opaque
    // "page couldn't load" failure even though the row was already
    // written server-side.
    const form = event.currentTarget;
    const data = new FormData(form);
    const savedName = String(data.get("fullName") ?? "").trim() || "RSVP";
    startTransition(async () => {
      const result = await addRsvpManually(data);
      if (!result.ok) {
        setError(result.error ?? "Couldn't save the RSVP.");
        return;
      }
      setSuccess(`Saved ${savedName}.`);
      // Reset visible inputs; the form itself remains mounted so the
      // admin can record a second response in a row.
      setSelectedToken("");
      setFullName("");
      form.reset();
    });
  }

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          Got an RSVP via WhatsApp or phone? Record it here.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-700 transition hover:border-neutral-500"
        >
          + Add manual RSVP
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4"
    >
      <div className="flex items-center justify-between gap-3 pb-3">
        <h3 className="font-serif text-base">Add manual RSVP</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
            setSuccess(null);
          }}
          className="text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-800"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
            Attach invite (optional)
          </span>
          <select
            name="guestToken"
            value={selectedToken}
            onChange={(e) => {
              const tok = e.target.value;
              setSelectedToken(tok);
              const match = pendingInvitations.find((g) => g.token === tok);
              if (match) setFullName(match.fullName);
            }}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">— anonymous (no token)</option>
            {pendingInvitations.map((g) => (
              <option key={g.token} value={g.token}>
                {g.fullName}
                {g.partySize > 1 ? ` (party of ${g.partySize})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
            Full name *
          </span>
          <input
            type="text"
            name="fullName"
            required
            maxLength={200}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
            Contact (optional)
          </span>
          <input
            type="text"
            name="contact"
            maxLength={200}
            placeholder="Phone or email"
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
            Meal
          </span>
          <select
            name="mealPreference"
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
            defaultValue=""
          >
            <option value="">—</option>
            {mealOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
            Message (optional)
          </span>
          <textarea
            name="message"
            rows={2}
            maxLength={2000}
            className="resize-none rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="mt-3 text-sm text-emerald-700">{success}</p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-neutral-700 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save RSVP"}
        </button>
      </div>
    </form>
  );
}

export default AddRsvpForm;
