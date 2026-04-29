/**
 * Wedding template content model.
 *
 * Every piece of copy, imagery and toggle the template renders is described
 * here. The site reads from a single `WeddingConfig` object at build time, so
 * spinning up a new wedding is a matter of cloning `wedding.config.ts`.
 *
 * NOTE: The shape mirrors what we'd later expose through Sanity. When the
 * project graduates to a CMS, swap the local config import for a Sanity
 * fetcher that returns the same `WeddingConfig`.
 */

export type ISODateString = string;

export interface WeddingPerson {
  firstName: string;
  lastName: string;
  preferredName?: string;
  parents?: string;
  bio?: string;
  photo?: WeddingImage;
}

export interface WeddingImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface WeddingEvent {
  id: string;
  title: string;
  description?: string;
  startsAt: ISODateString;
  endsAt?: ISODateString;
  dressCode?: string;
  venue: WeddingVenue;
}

export interface WeddingVenue {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  country: string;
  mapsUrl?: string;
  coordinates?: { lat: number; lng: number };
}

export interface WeddingScheduleItem {
  id: string;
  title: string;
  description?: string;
  /** Start time as ISO string. Rendered via `formatTime`. */
  time: ISODateString;
  endTime?: ISODateString;
}

export interface WeddingStoryEntry {
  title: string;
  date?: ISODateString;
  body: string;
  image?: WeddingImage;
}

export interface WeddingNavItem {
  label: string;
  href: string;
}

export interface WeddingHero {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Optional second CTA shown beside the primary action. */
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  backgroundImage?: WeddingImage;
}

export interface WeddingRsvp {
  enabled: boolean;
  deadline?: ISODateString;
  formProvider?: "embed" | "external" | "form";
  formUrl?: string;
  description?: string;
  /** Options shown in the meal preference dropdown. */
  mealOptions?: string[];
  /** Cap shown in the "number of guests" picker. Defaults to 4. */
  maxGuestsPerInvite?: number;
}

export type RegistryLinkKind =
  | "registry"
  | "honeymoon"
  | "bank"
  | "cash"
  | "other";

export interface WeddingRegistryLink {
  label: string;
  /** Where the link points. Omit for bank/account info-only entries. */
  url?: string;
  description?: string;
  kind?: RegistryLinkKind;
  /** Free-form details (bank account info, swift code, etc.). */
  details?: string;
}

export interface WeddingRegistry {
  enabled: boolean;
  heading?: string;
  description?: string;
  links: WeddingRegistryLink[];
}

export interface WeddingFaq {
  question: string;
  answer: string;
}

export interface WeddingTravel {
  description?: string;
  accommodations?: Array<{
    name: string;
    description?: string;
    url?: string;
    address?: string;
  }>;
}

/**
 * Toggle which sections render on the home page. Keeps the template flexible
 * across couples without ripping components out of the tree.
 */
export interface WeddingSections {
  hero: boolean;
  story: boolean;
  /** Toggles `WeddingDetailsSection` (ceremony + reception cards). */
  events: boolean;
  /** Toggles `ScheduleSection` (wedding day timeline). */
  schedule: boolean;
  gallery: boolean;
  party: boolean;
  rsvp: boolean;
  registry: boolean;
  travel: boolean;
  faq: boolean;
}

export interface WeddingSeo {
  title: string;
  description: string;
  ogImage?: WeddingImage;
  themeColor?: string;
}

export interface WeddingTheme {
  name: string;
  fontHeading: string;
  fontBody: string;
  colors: {
    sage: string;
    sageDark: string;
    cream: string;
    gold: string;
    charcoal: string;
  };
}

export interface WeddingConfig {
  /** Identifier used for analytics, og tags, etc. */
  slug: string;

  couple: {
    partnerOne: WeddingPerson;
    partnerTwo: WeddingPerson;
    /** Display string e.g. "Craig & Monique". */
    displayName: string;
    hashtag?: string;
  };

  weddingDate: ISODateString;
  /** IANA timezone, used by date helpers. */
  timezone: string;

  seo: WeddingSeo;
  hero: WeddingHero;
  navigation: WeddingNavItem[];
  sections: WeddingSections;

  story: {
    heading: string;
    intro?: string;
    entries: WeddingStoryEntry[];
  };

  events: WeddingEvent[];

  schedule: {
    heading: string;
    description?: string;
    items: WeddingScheduleItem[];
  };

  gallery: {
    heading: string;
    description?: string;
    images: WeddingImage[];
  };

  party: {
    heading: string;
    description?: string;
    members: Array<WeddingPerson & { role: string }>;
  };

  rsvp: WeddingRsvp;
  registry: WeddingRegistry;
  travel: WeddingTravel;
  faq: WeddingFaq[];

  /** Footer copy + socials. */
  footer: {
    tagline?: string;
    credit?: string;
    socials?: Array<{ label: string; url: string }>;
  };

  theme: WeddingTheme;
}
