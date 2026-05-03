"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { getBankDetails } from "@/app/actions/registry";

interface BankRevealProps {
  /** Registry-link label used as the lookup key by the server action. */
  label: string;
}

/**
 * Click-to-reveal control for bank transfer details.
 *
 * The actual account info is never rendered into the page HTML or the
 * React server payload — it's fetched from `getBankDetails` only after
 * the user clicks "Show bank details", which keeps the account number
 * out of crawls and casual scrapes.
 *
 * On reveal, each line of the details is shown alongside a "Copy"
 * button so guests can paste straight into their banking app.
 */
export function BankReveal({ label }: BankRevealProps) {
  const [details, setDetails] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiedLine, setCopiedLine] = useState<number | null>(null);

  function handleReveal() {
    setError(null);
    startTransition(async () => {
      const result = await getBankDetails(label);
      if (result.ok && result.details) {
        setDetails(result.details);
      } else {
        setError(result.error ?? "Could not load bank details.");
      }
    });
  }

  async function copyLine(line: string, index: number) {
    try {
      // Strip any leading "Label: " so the user only copies the value.
      const value = line.includes(":")
        ? line.slice(line.indexOf(":") + 1).trim()
        : line.trim();
      await navigator.clipboard.writeText(value);
      setCopiedLine(index);
      window.setTimeout(() => setCopiedLine(null), 1800);
    } catch {
      // Older browsers without async clipboard support — silently no-op.
    }
  }

  if (details) {
    const lines = details.split(/\r?\n/).filter(Boolean);
    return (
      <div className="relative flex flex-col gap-2">
        {lines.map((line, idx) => {
          const colon = line.indexOf(":");
          const labelPart = colon >= 0 ? line.slice(0, colon).trim() : null;
          const valuePart =
            colon >= 0 ? line.slice(colon + 1).trim() : line.trim();
          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-sage) 18%, var(--color-cream))",
                border:
                  "1px solid color-mix(in srgb, var(--color-sage) 50%, transparent)",
                color: "var(--color-charcoal)",
              }}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                {labelPart ? (
                  <span
                    className="text-[0.6rem] font-medium uppercase tracking-[0.32em]"
                    style={{ color: "var(--color-sage-dark)" }}
                  >
                    {labelPart}
                  </span>
                ) : null}
                <span className="truncate font-medium">{valuePart}</span>
              </div>
              <button
                type="button"
                onClick={() => copyLine(line, idx)}
                aria-label={`Copy ${labelPart ?? "value"}`}
                className="shrink-0 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em] transition-colors"
                style={{
                  color:
                    copiedLine === idx
                      ? "var(--color-cream)"
                      : "var(--color-sage-dark)",
                  backgroundColor:
                    copiedLine === idx
                      ? "var(--color-sage-dark)"
                      : "transparent",
                  border:
                    "1px solid color-mix(in srgb, var(--color-sage-dark) 60%, transparent)",
                }}
              >
                {copiedLine === idx ? "Copied" : "Copy"}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleReveal}
        disabled={isPending}
      >
        {isPending ? "Loading…" : "Show bank details"}
      </Button>
      {error ? (
        <p className="text-xs italic" style={{ color: "var(--color-sage-dark)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default BankReveal;
