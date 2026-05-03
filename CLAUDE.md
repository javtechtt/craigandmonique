@AGENTS.md

# Craig & Monique Wedding Site — project notes

Premium template-style wedding website. Single-source-of-truth config drives
every couple-specific value, so spinning up a new wedding is a one-file edit.

## Wedding facts

- **Couple**: Craig Batson & Monique Christian
- **Date**: Sunday, 2 August 2026, 2:00 PM ceremony
- **Venues**: Arima Seventh Day Adventist Church (ceremony), Spazi Versatili (reception)
- **Timezone**: `America/Port_of_Spain` (Trinidad, UTC-4 year-round)
- **RSVP deadline**: 28 June 2026
- **Invitation list**: 72 invitations, 81 total people (7 with `+1`, 1 with `+2`)
  — sourced from `MC Guest List.xlsx` in the parent folder
- **Repo**: https://github.com/javtechtt/craigandmonique
- **Production URL**: https://www.craigandmonique.com

## Tech stack

- **Next.js 16.2.4** with the App Router and Turbopack. Next.js 16 has breaking
  changes from 15 — middleware → `proxy.ts`, `themeColor` moved from
  `metadata` to `viewport`, etc. **Always check `node_modules/next/dist/docs`
  before writing Next-specific code.** See AGENTS.md.
- **Tailwind v4** via `@tailwindcss/postcss`. Theme tokens live in
  `src/app/globals.css` under `@theme inline { ... }`. **Use literal hex
  values inside `@theme inline`** — `var()` self-references like
  `--color-cream: var(--color-cream)` produce circular custom properties
  that resolve to "unset" at runtime and silently break inline backgrounds.
- **TypeScript strict**, `@/*` resolves to `src/*`.
- **React 19.2.4**.

## Source of truth

Everything couple-specific lives in `src/data/wedding.config.ts` typed by
`src/types/wedding.ts`. Components never hard-code names, dates, venues,
images, or copy — they receive `WeddingConfig` (or a slice) as a prop. To
launch a new wedding: clone the repo, edit that one file, replace photos
in `public/images/`, redeploy.

## Sensitive-data boundary

Page-level rule: client components must NOT receive bank-transfer details.

`src/app/page.tsx` runs the imported `weddingConfig` through a local
`toPublicConfig()` helper that strips `details` from any registry link of
`kind: "bank"` before passing the config across the client boundary. Bank
account numbers are then fetched on demand by `<BankReveal>` via the
`getBankDetails` Server Action only after the user clicks "Show bank
details", so the value never enters page HTML, the React Server Component
payload, or any web crawl.

## Backend

Optional, all toggles by env var:

| Feature | Env vars | Behaviour when unset |
|---|---|---|
| **RSVP storage + admin** | `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | RSVPs only logged server-side; `/admin` shows setup instructions |
| **Notification email** | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `COUPLE_EMAIL` | RSVPs save but no email goes out |
| **Admin gate** | `ADMIN_USER` (default `admin`), `ADMIN_PASSWORD` | `/admin` returns 503 |

`SUPABASE_SECRET_KEY` is the new naming for the legacy
`SUPABASE_SERVICE_KEY`. Code in `src/lib/rsvpServer.ts` reads either name
and prefers the new one. Never expose this key to the client — all
database access lives in Server Actions on the server.

`COUPLE_EMAIL` accepts a single address or comma-separated list (each
trimmed and validated) — see `parseCoupleEmails()` in
`src/app/actions/rsvp.ts`.

## Supabase

- Service-role client only, persistence disabled (`auth.persistSession: false`)
- Two tables: `rsvps` (one row per person), `guests` (one row per invitation
  with token + party_size + responded flag)
- RLS enabled on both with no policies — service key bypasses RLS, anon
  access blocked
- Schema in `supabase/schema.sql` (idempotent, includes `ALTER TABLE rsvps
  ADD COLUMN IF NOT EXISTS guest_token` migration for older deployments)
- Seed in `supabase/seed-guests.sql` — 72 invite rows, idempotent via
  `ON CONFLICT (token) DO NOTHING`. Auto-generated from the .xlsx
  spreadsheet; tokens are slug({first}-{last})

## Personalised guest links

`?guest={token}` URL param triggers `lookupGuestByToken` Server Action.
Recognised tokens lock the name field, optionally render +1 / +2
fieldsets, and tag the resulting RSVP rows with the token so the admin
"Pending invitations" view can shrink as guests respond. Anonymous form
still works for guests without a recognised token.

## Admin dashboard

`/admin` is gated by HTTP Basic Auth via `src/proxy.ts` (Next.js 16
renamed middleware → proxy). Browser shows native auth prompt. Page
shows aggregate stats, meal-preference breakdown, pending invitations
list with the URL token to copy/paste into reminders, full RSVP table,
and a CSV export (no second round-trip — generated client-side from the
already-fetched rows).

## Mobile navigation

`src/components/layout/MobileNav.tsx`. Full-screen takeover overlay
rendered via `createPortal(overlay, document.body)` so it escapes any
ancestor stacking context. Solid `bg-white` panel, no `backdrop-filter`
(known to cause sibling rendering glitches on iOS Safari). The trigger
button sits inside the Header but the open overlay always lives at the
top of the DOM tree.

A wedding photograph (`/images/gallery/RZ9_7128.jpg`) renders behind the
menu via `next/image` with `loading="eager"` and a `fade-from-zero`
keyframe that gracefully ramps opacity from 0 → 0.2 over 0.9s without
overshooting (the keyframe has no `to` clause so the inline opacity acts
as the implicit end state).

## Calendar links

`src/lib/calendar.ts` builds Google Calendar URLs, Outlook Live URLs,
and ICS payloads from any `WeddingEvent`. Wedding times are floating
local strings; `localTimeInZoneToUtcMs()` converts them to true UTC
moments via `Intl.DateTimeFormat` so the calendar event lands at the
right absolute time for any guest regardless of their device timezone.
Used by `<AddToCalendarButton>` (dropdown with Google / Apple ICS /
Outlook).

## Common gotchas this project hit

1. **@theme inline self-reference**: `--color-cream: var(--color-cream)`
   inside `@theme inline { ... }` makes the property unset at runtime.
   Always use literal hex inside `@theme`.
2. **Date.now() in useState lazy init**: causes hydration mismatch
   (React error #418). Initialize with deterministic zero, populate via
   useEffect after hydration. Pattern used in `CountdownSection`.
3. **Floating ISO times**: ISO strings without `Z` or offset are parsed
   as local time by `new Date()`. Server in UTC + display in Trinidad
   silently shifts hours. `formatDate.ts` handles this — pass a
   `timezone` option to every helper.
4. **Hidden `<select>` mobile UX is cheap**: replaced with custom radio
   pill groups (`AttendanceOption`, `MealOption`).
5. **Vercel env vars don't apply to existing deployments**: adding env
   vars in the dashboard requires a redeploy (or push) for the
   currently-serving build to see them.
6. **`document.getElementById` returns `HTMLElement`, not `Element`**:
   type predicates that say `el is Element` are widening — TypeScript
   rejects them in strict mode.

## Deploy procedure

1. Push to `master` → Vercel auto-deploys
2. Env vars must be set in Vercel **Settings → Environment Variables**,
   scoped to **Production** (and **Preview** if previews should work)
3. Run `supabase/schema.sql` once in Supabase SQL Editor
4. Run `supabase/seed-guests.sql` to load the invitation list
5. (Optional) Verify Resend domain `craigandmonique.com` is verified;
   otherwise leave `RESEND_FROM_EMAIL` blank to use Resend's default
   sender

## File map (selective)

```
src/
  app/
    page.tsx                 → Composes the home page; runs config
                               through toPublicConfig() for client safety
    layout.tsx               → Fonts, Schema.org Event JSON-LD, metadata
    globals.css              → Tailwind import, theme tokens, keyframes
    icon.tsx                 → C&M favicon (programmatic via ImageResponse)
    apple-icon.tsx           → 180×180 home-screen icon
    opengraph-image.tsx      → 1200×630 share card with Cormorant serif
    twitter-image.tsx        → re-exports opengraph-image
    proxy.ts (top of src)    → /admin Basic Auth gate
    actions/
      rsvp.ts                → submitRsvp Server Action
      registry.ts            → getBankDetails Server Action
      guest.ts               → lookupGuestByToken Server Action
    admin/
      page.tsx               → Couple's RSVP dashboard
      ExportCsvButton.tsx    → Client CSV download
  components/
    layout/{Header, Footer, MobileNav, DesktopNav}.tsx
    sections/                → HeroSection, CountdownSection,
                               WeddingDetailsSection, ScheduleSection,
                               GallerySection, RSVPSection,
                               RegistrySection
    ui/                      → Container, Button, SectionHeading,
                               LeafSprig, ImageCard, BankReveal,
                               AddToCalendarButton
  data/
    wedding.config.ts        → SOURCE OF TRUTH
  lib/
    cn.ts                    → className joiner
    formatDate.ts            → Timezone-aware date formatters
    rsvpStatus.ts            → computeRsvpStatus(deadline, tz) helper
    rsvpServer.ts            → Server-only Supabase client + types
    calendar.ts              → Calendar URL/ICS builders
    brandImage.ts            → ImageResponse helpers (font loader, etc.)
  themes/sageLuxury.ts       → Palette tokens
  types/wedding.ts           → WeddingConfig type
supabase/
  schema.sql                 → Tables + RLS lock
  seed-guests.sql            → 72 invite rows
public/
  images/couple/{hero,countdown}.jpg
  images/gallery/RZ9_*.jpg   → 12 engagement photos
```
