# Craig & Monique — Wedding Site

A Next.js 16 + Tailwind v4 wedding template. All copy, dates, venues,
gallery images, RSVP options, and registry links live in
`src/data/wedding.config.ts`. To launch a new couple's site, fork this
repo and edit that one file.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys, see below
npm run dev
```

Visit <http://localhost:3000>.

## Environment variables

The site runs in three modes depending on which integrations are
configured. **All env vars are optional** — anything you skip degrades
gracefully.

### Supabase (RSVP storage + admin dashboard)

1. Create a Supabase project at <https://supabase.com>.
2. In Settings → API, copy the **Project URL** and the **service role**
   key. Set them in `.env.local`:

   ```
   SUPABASE_URL=https://<project>.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOi...
   ```

3. In the SQL editor, paste and run the contents of
   `supabase/schema.sql` to create the `rsvps` table.

Each RSVP submission inserts a row. The `/admin` page reads from this
table.

### Resend (notification email to the couple on each RSVP)

1. Sign up at <https://resend.com> (free tier: 100 emails/day).
2. Add and verify your sending domain (or skip and let Resend use its
   default test sender).
3. Create an API key, then in `.env.local`:

   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL="RSVPs <rsvps@your-verified-domain.com>"
   COUPLE_EMAIL=craig@example.com
   ```

If `RESEND_FROM_EMAIL` is blank, mail is sent from
`onboarding@resend.dev` (deliverability is lower; fine for testing).

### Admin dashboard

`/admin` is gated by HTTP Basic Auth. The browser will prompt natively.

```
ADMIN_USER=admin           # optional, defaults to "admin"
ADMIN_PASSWORD=set-something-strong
```

Without `ADMIN_PASSWORD` set, `/admin` returns 503.

## RSVP backend behaviour summary

| Configured                    | Behaviour on submit                                                  |
| ----------------------------- | -------------------------------------------------------------------- |
| Supabase + Resend             | Row inserted in `rsvps`; couple gets an email per submission         |
| Supabase only                 | Row inserted; no notification                                        |
| Resend only                   | Couple gets the email; no central record (only useful for low volume) |
| Neither (dev)                 | Server logs the submission to stdout; user still sees success state  |

## Adding the bank account number

The Direct Contribution registry entry's `details` field in
`wedding.config.ts` holds the bank info. The site **does not render
this string into the public HTML** — instead, the `BankReveal` widget
fetches it via a Server Action only after the user clicks "Show bank
details", keeping the account number out of crawls and search caches.

## Deploying

Push to a Vercel project. Set the env vars in Vercel's dashboard. That's
it — the build picks up the integrations automatically.
