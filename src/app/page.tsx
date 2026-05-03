import { weddingConfig } from "@/data/wedding.config";
import type { WeddingConfig } from "@/types/wedding";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { CountdownSection } from "@/components/sections/CountdownSection";
import { WeddingDetailsSection } from "@/components/sections/WeddingDetailsSection";
import { ScheduleSection } from "@/components/sections/ScheduleSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { RSVPSection } from "@/components/sections/RSVPSection";
import { RegistrySection } from "@/components/sections/RegistrySection";

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

  return (
    <>
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
          <RSVPSection config={publicConfig} />
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
