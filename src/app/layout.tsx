import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { weddingConfig } from "@/data/wedding.config";
import { getWeddingMoment } from "@/lib/formatDate";
import "./globals.css";

/* Elegant serif for headings, clean sans for body — see design direction.
 * Both are exposed as CSS variables and consumed by globals.css. */
const fontHeading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/* Metadata is sourced from the wedding config so each couple's site renders
 * the right title/description without touching components.
 *
 * The OG and Twitter image references are auto-injected by Next.js from
 * the `opengraph-image.tsx` / `twitter-image.tsx` files in this folder —
 * we only set the textual fields here. */
export const metadata: Metadata = {
  title: weddingConfig.seo.title,
  description: weddingConfig.seo.description,
  openGraph: {
    title: weddingConfig.seo.title,
    description: weddingConfig.seo.description,
    type: "website",
    siteName: weddingConfig.couple.displayName,
  },
  twitter: {
    card: "summary_large_image",
    title: weddingConfig.seo.title,
    description: weddingConfig.seo.description,
  },
};

export const viewport: Viewport = {
  themeColor: weddingConfig.seo.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const eventLd = buildEventJsonLd();

  return (
    <html
      lang="en"
      className={`${fontHeading.variable} ${fontBody.variable} h-full antialiased`}
    >
      <head>
        {/* Schema.org Event structured data — surfaces the wedding date,
            location, and description as a Google rich result. Built from
            the wedding config so it stays in sync with on-page copy. */}
        {eventLd ? (
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
          />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

/**
 * Build a Schema.org Event payload from the wedding config. Returns
 * null if there are no events to anchor on. Uses the ceremony as the
 * primary venue and event start; if a reception event with `endsAt`
 * is present, that becomes the event end so the rich-result card
 * spans the whole day.
 */
function buildEventJsonLd(): Record<string, unknown> | null {
  const ceremony = weddingConfig.events.find((e) => e.id === "ceremony")
    ?? weddingConfig.events[0];
  if (!ceremony) return null;

  const reception =
    weddingConfig.events.find((e) => e.id === "reception") ?? ceremony;
  const lastEnd = reception.endsAt ?? ceremony.endsAt ?? null;

  const startMs = getWeddingMoment(
    ceremony.startsAt,
    weddingConfig.timezone,
  );
  const endMs = lastEnd
    ? getWeddingMoment(lastEnd, weddingConfig.timezone)
    : null;

  if (startMs === null) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${weddingConfig.couple.displayName} Wedding`,
    description: weddingConfig.seo.description,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    startDate: new Date(startMs).toISOString(),
    endDate: endMs ? new Date(endMs).toISOString() : undefined,
    location: {
      "@type": "Place",
      name: ceremony.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: [
          ceremony.venue.addressLine1,
          ceremony.venue.addressLine2,
        ]
          .filter(Boolean)
          .join(", "),
        addressLocality: ceremony.venue.city,
        addressRegion: ceremony.venue.region ?? undefined,
        addressCountry: ceremony.venue.country,
      },
      ...(ceremony.venue.coordinates
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: ceremony.venue.coordinates.lat,
              longitude: ceremony.venue.coordinates.lng,
            },
          }
        : {}),
    },
    organizer: {
      "@type": "Person",
      name: weddingConfig.couple.displayName,
    },
    isAccessibleForFree: true,
  };
}
