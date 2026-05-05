"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { addPendingGuest } from "@/app/admin/actions";
import { slugifyName } from "@/lib/slug";

/**
 * Toggle-able panel above the Pending invitations table. Lets the
 * couple add a new invitation entry — name + party size — and
 * generates the URL token automatically by slugifying the name. The
 * token is shown live as the admin types so they can confirm the
 * link looks right before saving.
 */
export function AddPendingGuestForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState(1);

  const previewToken = useMemo(() => slugifyName(name.trim()), [name]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await addPendingGuest(data);
      if (!result.ok) {
        setError(result.error ?? "Couldn't save the invitation.");
        return;
      }
      setSuccess(
        `Added ${name.trim()} (token: ${result.token ?? previewToken}).`,
      );
      setName("");
      setPartySize(1);
      form.reset();
    });
  }

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          Forgot to add someone? Add a new invitation here — the token
          is generated from the name automatically.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-700 transition hover:border-neutral-500"
        >
          + Add invitation
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
        <h3 className="font-serif text-base">Add invitation</h3>
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

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
            Full name *
          </span>
          <input
            type="text"
            name="fullName"
            required
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aunty Marlene James"
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
            Party size
          </span>
          <input
            type="number"
            name="partySize"
            min={1}
            max={10}
            value={partySize}
            onChange={(e) =>
              setPartySize(
                Math.max(1, Math.min(10, Number(e.target.value) || 1)),
              )
            }
            className="w-24 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-neutral-600">
        Token preview:{" "}
        {previewToken ? (
          <code className="break-all">?guest={previewToken}</code>
        ) : (
          <span className="opacity-60">— start typing a name —</span>
        )}
      </p>

      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="mt-3 text-sm text-emerald-700">{success}</p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={isPending || !previewToken}
          className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-neutral-700 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Add invitation"}
        </button>
      </div>
    </form>
  );
}

export default AddPendingGuestForm;
