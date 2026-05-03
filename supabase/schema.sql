-- Wedding RSVP schema
-- Run once in the Supabase SQL editor (or via `supabase db push`) to
-- create the tables that the site writes to. Designed to support
-- multiple couples sharing the same Supabase project via wedding_slug.

-- ===========================================================
-- rsvps — one row per person who has responded.
-- ===========================================================
create table if not exists rsvps (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),
  wedding_slug    text not null,
  full_name       text not null check (length(full_name) between 1 and 200),
  contact         text not null check (length(contact) between 1 and 200),
  attending       boolean not null default true,
  guest_count     int not null default 1 check (guest_count between 1 and 20),
  meal_preference text,
  message         text check (message is null or length(message) <= 2000),
  -- Personalised invite that this RSVP came from. Null for an
  -- anonymous (untokenised) submission.
  guest_token     text
);

create index if not exists rsvps_wedding_slug_created_at_idx
  on rsvps (wedding_slug, created_at desc);

create index if not exists rsvps_guest_token_idx
  on rsvps (guest_token);

-- ===========================================================
-- guests — invite list. One row per invitation, identified by
-- a URL-safe token. party_size = number of people on this
-- invitation (1 for a single guest, 2 for "+1", 3 for "+2").
-- responded flips true when ANY rsvp row is filed under the
-- token, even if only the primary attended.
-- ===========================================================
create table if not exists guests (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),
  wedding_slug    text not null,
  token           text not null unique,
  full_name       text not null check (length(full_name) between 1 and 200),
  party_size      int not null default 1 check (party_size between 1 and 10),
  responded       boolean not null default false,
  responded_at    timestamptz
);

create index if not exists guests_wedding_slug_idx on guests (wedding_slug);
create index if not exists guests_responded_idx on guests (wedding_slug, responded);

-- Row-level security: clients never read these tables directly.
-- The Next.js server uses the service role key (bypasses RLS), so we
-- lock everything else down.
alter table rsvps enable row level security;
alter table guests enable row level security;

-- (Intentionally no policies. Service role is the only reader/writer;
--  the /admin dashboard runs on the server and uses the same key.)

-- Idempotent migration for deployments that ran an earlier version of
-- this file before `guests` and `guest_token` existed.
alter table rsvps
  add column if not exists guest_token text;
