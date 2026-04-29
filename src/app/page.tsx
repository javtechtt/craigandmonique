import { weddingConfig } from "@/data/wedding.config";
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
 * Home page — Phase 6.
 *
 * Renders Header, Hero, Countdown, Wedding Details, Schedule, RSVP,
 * Registry, and Footer. Remaining sections (Story, Gallery, Party,
 * Travel, FAQ) are scheduled for future phases.
 *
 * --- Sanity migration note ----------------------------------------------
 * Replace the static `weddingConfig` import with a server-side fetch:
 *
 *   const config = await getWeddingConfig();
 *
 * Section components consume the same `WeddingConfig` shape, so swapping
 * the source does not change their props.
 * ------------------------------------------------------------------------
 */
export default function HomePage() {
  // const config = await getWeddingConfig(); // future Sanity-backed call
  const config = weddingConfig;
  const { sections, rsvp, registry } = config;

  return (
    <>
      <Header config={config} />

      <main className="flex flex-col">
        {sections.hero ? <HeroSection config={config} /> : null}
        <CountdownSection config={config} />
        {sections.events ? <WeddingDetailsSection config={config} /> : null}
        {sections.schedule ? <ScheduleSection config={config} /> : null}
        {sections.gallery ? <GallerySection config={config} /> : null}
        {sections.rsvp && rsvp.enabled ? (
          <RSVPSection config={config} />
        ) : null}
        {sections.registry && registry.enabled ? (
          <RegistrySection config={config} />
        ) : null}
      </main>

      <Footer config={config} />
    </>
  );
}
