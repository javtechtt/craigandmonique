import { weddingConfig } from "@/data/wedding.config";
import type { WeddingConfig } from "@/types/wedding";
import { computeRsvpStatus } from "@/lib/rsvpStatus";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { CountdownSection } from "@/components/sections/CountdownSection";
import { WeddingDetailsSection } from "@/components/sections/WeddingDetailsSection";
import { ScheduleSection } from "@/components/sections/ScheduleSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { RSVPSection } from "@/components/sections/RSVPSection";
import { RegistrySection } from "@/components/sections/RegistrySection";
import { InvitationPopup } from "@/components/ui/InvitationPopup";

// Force a fresh render so the live RSVP deadline status (open /
// ending-soon / closed) reflects the current time on each request.
// Without this Next.js can statically render the page once at build
// and the deadline banner never updates as the date approaches.
export const dynamic = "force-dynamic";

/**
 * Home page.
 *
 * Composes every visible section, gated by `config.sections.*`.
 *
 * Important: client components on this page (CountdownSection,
 * GallerySection, RSVPSection, MobileNav inside Header) receive their
 * data as serialised props — anything in `config` they're handed gets
 * embedded into the page's RSC payload and is therefore visible to any
 * scraper. Sensitive fields (currently the bank-transfer `details`
 * string on registry entries) are stripped via `toPublicConfig()`
 * before being passed across the client boundary. The only path to
 * those details is the `getBankDetails` Server Action, which renders
 * server-side and only returns when invoked.
 *
 * --- Sanity migration note ----------------------------------------------
 * Replace the static `weddingConfig` import with a server-side fetch:
 *
 *   const config = await getWeddingConfig();
 *
 * Then run it through `toPublicConfig()` for the client-bound props.
 * ------------------------------------------------------------------------
 */
export default function HomePage() {
  // const config = await getWeddingConfig(); // future Sanity-backed call
  const config = weddingConfig;
  const publicConfig = toPublicConfig(config);
  const { sections, rsvp, registry } = config;
  const rsvpStatus = computeRsvpStatus(rsvp.deadline, config.timezone);
  const invitationDateLabel = formatInvitationDate(
    config.weddingDate,
    config.timezone,
  );

  return (
    <>
      <InvitationPopup
        coupleDisplayName={config.couple.displayName}
        weddingDateLabel={invitationDateLabel}
      />
      <Header config={publicConfig} />

      <main className="flex flex-col">
        {sections.hero ? <HeroSection config={publicConfig} /> : null}
        <CountdownSection config={publicConfig} />
        {sections.events ? (
          <WeddingDetailsSection config={publicConfig} />
        ) : null}
        {sections.schedule ? <ScheduleSection config={publicConfig} /> : null}
        {sections.gallery ? <GallerySection config={publicConfig} /> : null}
        {sections.rsvp && rsvp.enabled ? (
          <RSVPSection config={publicConfig} rsvpStatus={rsvpStatus} />
        ) : null}
        {sections.registry && registry.enabled ? (
          // Registry is a server component, so it can hold the full config
          // (including bank `details`) without leaking — but it still
          // renders bank entries through the BankReveal Server Action,
          // not as inline text.
          <RegistrySection config={publicConfig} />
        ) : null}
      </main>

      <Footer config={publicConfig} />
    </>
  );
}

/**
 * Format the wedding date for the invitation popup as "Month Dth, YYYY"
 * (e.g. "August 2nd, 2026"). Uses the wedding timezone so the day lands
 * on the correct calendar date for any visitor.
 */
function formatInvitationDate(iso: string, timezone: string): string {
  const date = new Date(iso);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: timezone,
  }).format(date);
  const day = Number(
    new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      timeZone: timezone,
    }).format(date),
  );
  const year = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: timezone,
  }).format(date);
  const suffix = ordinalSuffix(day);
  return `${month} ${day}${suffix}, ${year}`;
}

function ordinalSuffix(day: number): string {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Returns a copy of the wedding config safe to serialise across the
 * server → client boundary. Strips the bank-transfer `details` string
 * (account number etc.) so it never enters the page HTML or RSC
 * payload. Other fields are passed through unchanged.
 */
function toPublicConfig(config: WeddingConfig): WeddingConfig {
  return {
    ...config,
    registry: {
      ...config.registry,
      links: config.registry.links.map((link) =>
        link.kind === "bank" ? { ...link, details: undefined } : link,
      ),
    },
  };
}
