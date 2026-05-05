/**
 * Convert a guest's full name into the URL-safe token format used by
 * `?guest=...` invitation links: lowercase, ASCII-folded, non-
 * alphanumerics collapsed to single hyphens. Mirrors the slug rule
 * applied when generating the original `seed-guests.sql` so manually-
 * added invitations get tokens that look identical to the seeded ones.
 */
export function slugifyName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
