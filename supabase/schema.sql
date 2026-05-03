-- Wedding RSVP schema
-- Run once in the Supabase SQL editor (or via `supabase db push`) to
-- create the table that the site writes to. Designed to support
-- multiple couples sharing the same Supabase project via wedding_slug.

create table if not exists rsvps (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),
  wedding_slug    text not null,
  full_name       text not null check (length(full_name) between 1 and 200),
  contact         text not null check (length(contact) between 1 and 200),
  attending       boolean not null default true,
  guest_count     int not null default 1 check (guest_count between 1 and 20),
  meal_preference text,
  message         text check (message is null or length(message) <= 2000)
);

create index if not exists rsvps_wedding_slug_created_at_idx
  on rsvps (wedding_slug, created_at desc);

-- Row-level security: clients never read this table directly. The
-- Next.js server uses the service role key (bypasses RLS), so we lock
-- everything else down.
alter table rsvps enable row level security;

-- (Intentionally no policies. Service role is the only writer; the
--  /admin dashboard runs on the server and uses the same key.)
