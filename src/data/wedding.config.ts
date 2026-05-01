import type { WeddingConfig } from "@/types/wedding";
import { sageLuxury } from "@/themes/sageLuxury";

/**
 * SOURCE OF TRUTH for the Craig & Monique site.
 *
 * Components never hard-code dates, names, or copy — they pull everything
 * from this object. To launch a new couple's site, copy this file, edit the
 * fields, and the rest of the template adapts.
 *
 * --- Sanity migration note ----------------------------------------------
 * When this template moves to a CMS, replace this static export with a
 * server-side fetch:
 *
 *   import { sanityClient } from "@/lib/sanity";
 *   export async function getWeddingConfig(): Promise<WeddingConfig> {
 *     return sanityClient.fetch(weddingConfigQuery);
 *   }
 *
 * The returned shape MUST match `WeddingConfig` so consumers don't change.
 * ------------------------------------------------------------------------
 */
export const weddingConfig: WeddingConfig = {
  slug: "craig-and-monique",

  couple: {
    displayName: "Craig & Monique",
    partnerOne: {
      firstName: "Craig",
      lastName: "Placeholder",
      preferredName: "Craig",
      parents: "Son of [Parent Names]",
      bio: "Placeholder bio for Craig — replace with the real story.",
    },
    partnerTwo: {
      firstName: "Monique",
      lastName: "Placeholder",
      preferredName: "Monique",
      parents: "Daughter of [Parent Names]",
      bio: "Placeholder bio for Monique — replace with the real story.",
    },
  },

  weddingDate: "2026-08-02T14:00:00",
  timezone: "America/Port_of_Spain",

  seo: {
    title: "Craig & Monique | Wedding",
    description:
      "Join Craig and Monique as they celebrate their wedding day. Find event details, RSVP, travel info and more.",
    themeColor: sageLuxury.colors.sage,
  },

  hero: {
    eyebrow: "We're getting married",
    heading: "Craig & Monique",
    subheading: "Sunday, 2 August 2026 — Save the date",
    ctaLabel: "RSVP",
    ctaHref: "#rsvp",
    secondaryCtaLabel: "View Details",
    secondaryCtaHref: "#events",
    tertiaryCtaLabel: "Gift Registry",
    tertiaryCtaHref: "#registry",
    backgroundImage: {
      src: "/images/couple/hero.jpg",
      alt: "Craig and Monique on a balcony surrounded by greenery",
      width: 2667,
      height: 4000,
    },
  },

  navigation: [
    { label: "Events", href: "#events" },
    { label: "Gallery", href: "#gallery" },
    { label: "Registry", href: "#registry" },
    { label: "RSVP", href: "#rsvp" },
  ],

  sections: {
    hero: true,
    story: true,
    events: true,
    schedule: false,
    gallery: true,
    party: true,
    rsvp: true,
    registry: true,
    travel: true,
    faq: true,
  },

  story: {
    heading: "Our Story",
    intro:
      "Placeholder intro text. Replace with the real how-we-met copy from Craig and Monique.",
    entries: [
      {
        title: "How we met",
        date: "2019-05-01",
        body: "Placeholder story chapter. Swap in the real moment.",
      },
      {
        title: "The proposal",
        date: "2024-12-24",
        body: "Placeholder proposal story. Swap in the real moment.",
      },
    ],
  },

  events: [
    {
      id: "ceremony",
      title: "The Ceremony",
      description:
        "Join us as we exchange vows surrounded by the people we love most.",
      startsAt: "2026-08-02T14:00:00",
      venue: {
        name: "Arima Seventh Day Adventist Church",
        addressLine1: "19 De Gannes Street",
        city: "Arima",
        country: "Trinidad and Tobago",
        mapsUrl:
          "https://www.google.com/maps/place/Arima+SDA/@10.6450528,-61.2817179,17z/data=!3m1!4b1!4m6!3m5!1s0x8c49ffa068bb8c09:0x1745f3d445ac6f82!8m2!3d10.6450528!4d-61.2817179!16s%2Fg%2F11c44chvd9?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D",
        coordinates: { lat: 10.6450528, lng: -61.2817179 },
      },
    },
    {
      id: "reception",
      title: "The Reception",
      description:
        "Cocktails, dinner, dancing and toasts to celebrate the day.",
      startsAt: "2026-08-02T18:00:00",
      venue: {
        name: "Spazi Versatili",
        addressLine1: "39A Lynton Gardens",
        addressLine2: "Phase 1",
        city: "Arima",
        country: "Trinidad and Tobago",
        mapsUrl:
          "https://www.google.com/maps/place/Spazi+Versatili/@10.6435162,-61.3025837,17z/data=!3m1!4b1!4m6!3m5!1s0x8c49ffb73b46683f:0xc9bc3d2562721cba!8m2!3d10.6435162!4d-61.3025837!16s%2Fg%2F11zkgcbj7_?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D",
        coordinates: { lat: 10.6435162, lng: -61.3025837 },
      },
    },
  ],

  schedule: {
    heading: "Our Wedding Day",
    description:
      "A gentle rhythm to the day so you can move with us from vows to dinner.",
    items: [
      {
        id: "welcome",
        title: "Welcome & Seating",
        description: "Arrive, settle in and find your seat",
        time: "2026-08-02T13:30:00",
      },
      {
        id: "ceremony",
        title: "Ceremony",
        description: "We exchange vows surrounded by the people we love most.",
        time: "2026-08-02T14:00:00",
      },
      {
        id: "photographs",
        title: "Photography Session",
        description: "Family and bridal party portraits",
        time: "2026-08-02T15:30:00",
      },
      {
        id: "cocktails",
        title: "Cocktail Hour",
        description: "Drinks at the reception as the sun begins to set.",
        time: "2026-08-02T17:00:00",
      },
      {
        id: "dinner",
        title: "Dinner",
        description:
          "A long-table dinner and a few words from those closest to us.",
        time: "2026-08-02T18:00:00",
      },
    ],
  },

  gallery: {
    heading: "Gallery",
    description: "A small collection of our favourite moments together.",
    images: [
      {
        src: "/images/gallery/RZ9_7069.jpg",
        alt: "Craig and Monique on a balcony with greenery behind",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7076.jpg",
        alt: "Craig and Monique looking out together",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7101.jpg",
        alt: "Craig and Monique walking through the garden",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7108.jpg",
        alt: "Craig and Monique sharing a moment",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7128.jpg",
        alt: "Craig and Monique in front of a heritage manor",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7208.jpg",
        alt: "Craig and Monique laughing together",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7209.jpg",
        alt: "Craig and Monique holding hands",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7252.jpg",
        alt: "Craig and Monique in an embrace",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7389.jpg",
        alt: "Craig and Monique outside an elegant building",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7428.jpg",
        alt: "Craig and Monique against architectural detailing",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7493.jpg",
        alt: "Craig and Monique with an architectural backdrop",
        width: 1500,
        height: 2000,
      },
      {
        src: "/images/gallery/RZ9_7602.jpg",
        alt: "Craig and Monique together",
        width: 1500,
        height: 2000,
      },
    ],
  },

  party: {
    heading: "Wedding Party",
    description: "The people standing with us on the day.",
    members: [
      {
        firstName: "Placeholder",
        lastName: "Name",
        role: "Maid of Honour",
        bio: "Placeholder bio.",
      },
      {
        firstName: "Placeholder",
        lastName: "Name",
        role: "Best Man",
        bio: "Placeholder bio.",
      },
    ],
  },

  rsvp: {
    enabled: true,
    deadline: "2026-06-28T23:59:00",
    formProvider: "form",
    description: "Kindly respond by 28 June 2026.",
    mealOptions: ["Vegetarian", "Chicken"],
  },

  registry: {
    enabled: true,
    heading: "Gift Registry",
    description:
      "Your presence is truly the greatest gift. If you'd like to contribute towards our next chapter, a few options below.",
    links: [
      {
        label: "Amazon",
        url: "https://www.amazon.com/wedding/guest-view/1EAIKV876SHTW",
        description:
          "Our curated online registry — you can purchase online and it will be delivered to us.",
        kind: "registry",
      },
      {
        label: "Dwellings",
        url: "https://www.dwellingstrinidad.com/gift_registry/rid2755-2755",
        description:
          "Our curated local registry — you can purchase online or in-store.",
        kind: "registry",
      },
      {
        label: "Direct Contribution",
        description: "If you prefer a direct contribution.",
        kind: "bank",
        details:
          "Account Holder: Craig Batson\nBank: Republic Bank Limited\nAccount Number: 870044976301",
      },
    ],
  },

  travel: {
    description: "Travelling in for the weekend? Here are our recommendations.",
    accommodations: [
      {
        name: "Placeholder Hotel",
        description: "Walking distance from the venue.",
        url: "https://example.com",
        address: "Placeholder address",
      },
    ],
  },

  faq: [
    {
      question: "Are children welcome?",
      answer: "Placeholder answer — confirm with Craig and Monique.",
    },
    {
      question: "Will the ceremony be outdoors?",
      answer: "Placeholder answer — confirm with Craig and Monique.",
    },
  ],

  footer: {
    tagline: "With love",
    socials: [],
  },

  theme: sageLuxury,
};

export default weddingConfig;
