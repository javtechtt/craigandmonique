"use server";

import { weddingConfig } from "@/data/wedding.config";

interface BankDetailsResult {
  ok: boolean;
  details?: string;
  error?: string;
}

/**
 * Server Action: return the bank-transfer details for a specific
 * registry entry, identified by label.
 *
 * Why a Server Action instead of just rendering the details on the
 * page: the bank account number is sensitive enough that we don't
 * want it in the static HTML, the React Server Component payload, or
 * any cached crawl of the page. Keeping the details server-only and
 * fetching them on a click means the number only enters the page
 * after a deliberate user gesture.
 *
 * Reachable as a POST endpoint by anyone, so we still accept the lookup
 * `label` as input rather than an opaque key — the registry config is
 * the source of truth for what's allowed.
 */
export async function getBankDetails(
  label: string,
): Promise<BankDetailsResult> {
  if (typeof label !== "string" || label.length === 0 || label.length > 200) {
    return { ok: false, error: "Invalid request." };
  }

  const link = weddingConfig.registry.links.find(
    (entry) => entry.kind === "bank" && entry.label === label,
  );

  if (!link || !link.details) {
    return { ok: false, error: "Bank details not available." };
  }

  return { ok: true, details: link.details };
}
