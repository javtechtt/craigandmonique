"use client";

import { useState, useTransition } from "react";
import { deletePendingGuest } from "@/app/admin/actions";

interface DeleteGuestButtonProps {
  id: number;
  fullName: string;
}

/**
 * Inline "Delete" button rendered per row in the Pending invitations
 * table. Asks for explicit confirmation before invoking the server
 * action so a mistaken click can't wipe an invite. After a successful
 * delete the action revalidates `/admin` and the row disappears on
 * next render.
 */
export function DeleteGuestButton({ id, fullName }: DeleteGuestButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (
      !window.confirm(
        `Delete the invitation for ${fullName}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deletePendingGuest(id);
      if (!result.ok) {
        setError(result.error ?? "Couldn't delete the invitation.");
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
      {error ? (
        <span className="max-w-[16rem] text-right text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export default DeleteGuestButton;
