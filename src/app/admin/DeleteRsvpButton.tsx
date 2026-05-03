"use client";

import { useState, useTransition } from "react";
import { deleteRsvp } from "@/app/admin/actions";

interface DeleteRsvpButtonProps {
  id: number;
  fullName: string;
}

/**
 * Inline "Delete" button rendered per row in the All Responses table.
 * Asks for explicit confirmation before invoking the server action so a
 * mistaken click can't wipe a response. After a successful delete the
 * action revalidates `/admin` and the row disappears on next render.
 */
export function DeleteRsvpButton({ id, fullName }: DeleteRsvpButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (
      !window.confirm(
        `Delete the RSVP from ${fullName}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteRsvp(id);
      if (!result.ok) {
        setError(result.error ?? "Couldn't delete the RSVP.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs uppercase tracking-wider text-neutral-600 transition hover:border-red-400 hover:text-red-600 disabled:opacity-60"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export default DeleteRsvpButton;
