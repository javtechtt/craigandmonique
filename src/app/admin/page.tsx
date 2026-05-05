import {
  isSupabaseConfigured,
  getSupabase,
  RSVP_TABLE,
  GUESTS_TABLE,
  type RsvpRow,
  type GuestRow,
} from "@/lib/rsvpServer";
import { weddingConfig } from "@/data/wedding.config";
import { ExportCsvButton } from "@/app/admin/ExportCsvButton";
import { DeleteRsvpButton } from "@/app/admin/DeleteRsvpButton";
import { AddRsvpForm } from "@/app/admin/AddRsvpForm";
import { AddPendingGuestForm } from "@/app/admin/AddPendingGuestForm";
import { DeleteGuestButton } from "@/app/admin/DeleteGuestButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — RSVPs",
  robots: { index: false, follow: false },
};

/**
 * Couple's admin dashboard. Auth is handled by `src/proxy.ts` (HTTP
 * Basic), so by the time this page renders the visitor is authenticated.
 *
 * Reads RSVPs and the invite list straight from Supabase (server-only,
 * with the service key) and lays them out as:
 *   - Aggregate stats (responses, invitations, people, top meal)
 *   - Meal-preference breakdown
 *   - "Pending" view — invites that have not yet RSVPed
 *   - Full table of every RSVP row, newest first
 *   - "Download CSV" — RSVP rows for offline planning
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
          Then run <code>supabase/schema.sql</code> followed by{" "}
          <code>supabase/seed-guests.sql</code> in the SQL editor.
        </p>
      </main>
    );
  }

  const supabase = getSupabase();
  const [rsvpRes, guestRes] = await Promise.all([
    supabase
      .from(RSVP_TABLE)
      .select("*")
      .eq("wedding_slug", weddingConfig.slug)
      .order("created_at", { ascending: false }),
    supabase
      .from(GUESTS_TABLE)
      .select("*")
      .eq("wedding_slug", weddingConfig.slug)
      .order("full_name", { ascending: true }),
  ]);

  if (rsvpRes.error) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-3xl">RSVP Admin</h1>
        <p className="mt-4 text-sm text-red-700">
          Failed to load RSVPs: {rsvpRes.error.message}
        </p>
      </main>
    );
  }

  const rsvps = (rsvpRes.data ?? []) as RsvpRow[];
  const guests = (guestRes.data ?? []) as GuestRow[];
  const guestsErrored = Boolean(guestRes.error);

  // Aggregate stats
  const totalResponses = rsvps.length;
  const totalInvitations = guests.length;
  const totalPeopleInvited = guests.reduce(
    (sum, g) => sum + (g.party_size ?? 1),
    0,
  );
  const respondedInvitations = guests.filter((g) => g.responded).length;
  const pendingInvitations = guests.filter((g) => !g.responded);

  const mealCounts = rsvps.reduce<Record<string, number>>((acc, row) => {
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
        <ExportCsvButton rows={rsvps} />
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Invitations responded"
          value={
            totalInvitations === 0
              ? "—"
              : `${respondedInvitations} / ${totalInvitations}`
          }
          hint={
            totalInvitations === 0
              ? "Run supabase/seed-guests.sql"
              : `${pendingInvitations.length} pending`
          }
        />
        <Stat
          label="People responded"
          value={
            totalPeopleInvited === 0
              ? String(totalResponses)
              : `${totalResponses} / ${totalPeopleInvited}`
          }
        />
        <Stat
          label="Most common meal"
          value={pickTop(mealCounts) ?? "—"}
        />
        <Stat
          label="With messages"
          value={String(
            rsvps.filter((r) => r.message && r.message.trim().length > 0)
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
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-serif text-xl">All responses</h2>
        </div>

        <div className="mt-3">
          <AddRsvpForm
            mealOptions={weddingConfig.rsvp.mealOptions ?? []}
            pendingInvitations={pendingInvitations.map((g) => ({
              token: g.token,
              fullName: g.full_name,
              partySize: g.party_size,
            }))}
          />
        </div>

        {rsvps.length === 0 ? (
          <p className="mt-4 text-neutral-500">
            No RSVPs yet. They will appear here as guests submit.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full border-collapse text-left">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Meal</th>
                  <th className="px-3 py-2">Token</th>
                  <th className="px-3 py-2">Message</th>
                  <th className="px-3 py-2 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rsvps.map((row) => (
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
                    <td className="px-3 py-2 text-xs text-neutral-600">
                      {row.guest_token ? (
                        <code>{row.guest_token}</code>
                      ) : (
                        <span className="opacity-60">anonymous</span>
                      )}
                    </td>
                    <td className="px-3 py-2 max-w-md whitespace-pre-wrap text-neutral-700">
                      {row.message ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {typeof row.id === "number" ? (
                        <DeleteRsvpButton
                          id={row.id}
                          fullName={row.full_name}
                        />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl">Pending invitations</h2>

        <div className="mt-3">
          <AddPendingGuestForm />
        </div>

        {guestsErrored ? (
          <p className="mt-3 text-amber-700">
            Couldn&apos;t load the guest list ({guestRes.error?.message}).
            Confirm the <code>guests</code> table exists.
          </p>
        ) : guests.length === 0 ? (
          <p className="mt-4 text-neutral-500">
            No invitations seeded yet. Run{" "}
            <code>supabase/seed-guests.sql</code> to load the list, or
            add one above.
          </p>
        ) : pendingInvitations.length === 0 ? (
          <p className="mt-4 text-neutral-500">
            Every invitation has responded. 🎉
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full border-collapse text-left">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Guest</th>
                  <th className="px-3 py-2">Party size</th>
                  <th className="px-3 py-2">Personalised link</th>
                  <th className="px-3 py-2 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pendingInvitations.map((guest) => (
                  <tr key={guest.id} className="align-top">
                    <td className="px-3 py-2 font-medium">
                      {guest.full_name}
                    </td>
                    <td className="px-3 py-2">{guest.party_size}</td>
                    <td className="px-3 py-2 text-neutral-700">
                      <code className="break-all">?guest={guest.token}</code>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {typeof guest.id === "number" ? (
                        <DeleteGuestButton
                          id={guest.id}
                          fullName={guest.full_name}
                        />
                      ) : null}
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

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
      {hint ? (
        <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

function pickTop(counts: Record<string, number>): string | null {
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0];
}
