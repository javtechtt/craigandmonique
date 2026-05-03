"use client";

import type { RsvpRow } from "@/lib/rsvpServer";
import { weddingConfig } from "@/data/wedding.config";

interface ExportCsvButtonProps {
  rows: RsvpRow[];
}

const CSV_COLUMNS: Array<{ key: keyof RsvpRow; header: string }> = [
  { key: "created_at", header: "Submitted" },
  { key: "full_name", header: "Name" },
  { key: "contact", header: "Contact" },
  { key: "attending", header: "Attending" },
  { key: "guest_count", header: "Guests" },
  { key: "meal_preference", header: "Meal" },
  { key: "guest_token", header: "Invite token" },
  { key: "message", header: "Message" },
];

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Triggers a browser download of the current RSVP list as a CSV. All
 * formatting happens client-side from the rows the server already
 * fetched, so there's no second network round-trip.
 */
export function ExportCsvButton({ rows }: ExportCsvButtonProps) {
  function handleExport() {
    const header = CSV_COLUMNS.map((c) => escapeCsv(c.header)).join(",");
    const body = rows
      .map((row) =>
        CSV_COLUMNS.map((c) => escapeCsv(row[c.key])).join(","),
      )
      .join("\n");
    const csv = `${header}\n${body}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${weddingConfig.slug}-rsvps-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 250);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-neutral-700 transition-colors hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Download CSV
    </button>
  );
}

export default ExportCsvButton;
