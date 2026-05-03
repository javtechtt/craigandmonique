import {
  isSupabaseConfigured,
  getSupabase,
  RSVP_TABLE,
  type RsvpRow,
} from "@/lib/rsvpServer";
import { weddingConfig } from "@/data/wedding.config";
import { ExportCsvButton } from "@/app/admin/ExportCsvButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — RSVPs",
  robots: { index: false, follow: false },
};

/**
 * Couple's admin dashboard. Auth is handled by `src/proxy.ts` (HTTP
 * Basic), so by the time this page renders the visitor is authenticated.
 *
 * Reads RSVPs straight from Supabase (server-only, with the service key)
 * and lays them out as:
 *   - Aggregate stats (total responses, meal breakdown)
 *   - A sortable-ish table of every row, newest first
 *   - A "Download CSV" button for offline planning
 *
 * If Supabase isn't configured, renders setup instructions so the
 * couple knows what's missing.
 */
export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-charcoal">
        <h1 className="font-serif text-3xl">RSVP Admin</h1>
        <p className="mt-4 text-sm leading-relaxed">
          Supabase is not configured for this deployment. Set the
          following environment variables and redeploy:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-neutral-100 px-4 py-3 text-xs">
          SUPABASE_URL={"<your-project>.supabase.co"}
          {"\n"}SUPABASE_SERVICE_KEY={"<service-role-key>"}
        </pre>
        <p className="mt-4 text-sm">
          Then create the <code>rsvps</code> table — see{" "}
          <code>supabase/schema.sql</code> in the repo.
        </p>
      </main>
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(RSVP_TABLE)
    .select("*")
    .eq("wedding_slug", weddingConfig.slug)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-3xl">RSVP Admin</h1>
        <p className="mt-4 text-sm text-red-700">
          Failed to load RSVPs: {error.message}
        </p>
      </main>
    );
  }

  const rows = (data ?? []) as RsvpRow[];

  // Aggregate stats
  const totalResponses = rows.length;
  const mealCounts = rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.meal_preference ?? "(unspecified)";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 font-sans text-sm text-neutral-900">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-neutral-500">
            {weddingConfig.couple.displayName}
          </p>
          <h1 className="mt-1 font-serif text-3xl">RSVP Admin</h1>
        </div>
        <ExportCsvButton rows={rows} />
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Total responses" value={String(totalResponses)} />
        <Stat
          label="Most common meal"
          value={pickTop(mealCounts) ?? "—"}
        />
        <Stat
          label="With messages"
          value={String(
            rows.filter((r) => r.message && r.message.trim().length > 0)
              .length,
          )}
        />
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl">Meal preferences</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(mealCounts).length === 0 ? (
            <li className="text-neutral-500">No responses yet.</li>
          ) : (
            Object.entries(mealCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([meal, count]) => (
                <li
                  key={meal}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2"
                >
                  <span>{meal}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))
          )}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl">All responses</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-neutral-500">
            No RSVPs yet. They will appear here as guests submit.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full border-collapse text-left">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Meal</th>
                  <th className="px-3 py-2">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-2 text-neutral-500">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 font-medium">{row.full_name}</td>
                    <td className="px-3 py-2">{row.contact}</td>
                    <td className="px-3 py-2">
                      {row.meal_preference ?? "—"}
                    </td>
                    <td className="px-3 py-2 max-w-md whitespace-pre-wrap text-neutral-700">
                      {row.message ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
    </div>
  );
}

function pickTop(counts: Record<string, number>): string | null {
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0];
}
