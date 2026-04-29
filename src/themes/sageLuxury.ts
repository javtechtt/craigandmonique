import type { WeddingTheme } from "@/types/wedding";

/**
 * Sage Luxury palette — soft sage, cream and muted gold.
 *
 * Values are surfaced as CSS custom properties in `globals.css`
 * (--color-sage, --color-sage-dark, --color-cream, --color-gold,
 * --color-charcoal). Update both this object and the matching `:root`
 * block when tweaking colours so SSR styles stay in sync.
 */
export const sageLuxury: WeddingTheme = {
  name: "sageLuxury",
  fontHeading: "var(--font-heading)",
  fontBody: "var(--font-body)",
  colors: {
    sage: "#A7B5A0",
    sageDark: "#6F7F69",
    cream: "#F5F1EA",
    gold: "#B8975A",
    charcoal: "#2E2E2C",
  },
};
