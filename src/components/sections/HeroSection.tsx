import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LeafSprig } from "@/components/ui/LeafSprig";
import { formatWeddingDate } from "@/lib/formatDate";

interface HeroSectionProps {
  config: WeddingConfig;
}

/**
 * Hero — centered editorial save-the-date card.
 *
 * Pulls names, date, and CTA copy from `WeddingConfig`. The decorative
 * blurred shapes and botanical sprig keep the soft luxury feel without
 * leaning on extra dependencies.
 *
 * Sanity migration: when content moves to a CMS, the same `WeddingConfig`
 * shape arrives from the fetcher — this component does not change.
 */
export function HeroSection({ config }: HeroSectionProps) {
  const { hero, couple, weddingDate, timezone } = config;
  const formattedDate = formatWeddingDate(weddingDate, { timezone });

  const primaryCta =
    hero.ctaLabel && hero.ctaHref
      ? { label: hero.ctaLabel, href: hero.ctaHref }
      : null;
  const secondaryCta =
    hero.secondaryCtaLabel && hero.secondaryCtaHref
      ? { label: hero.secondaryCtaLabel, href: hero.secondaryCtaHref }
      : null;
  const tertiaryCta =
    hero.tertiaryCtaLabel && hero.tertiaryCtaHref
      ? { label: hero.tertiaryCtaLabel, href: hero.tertiaryCtaHref }
      : null;

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: "#f5f1ea" }}
    >
      {/* Decorative background shapes — pure CSS, no extra layout cost. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute -top-40 -left-32 size-[28rem] rounded-full blur-3xl opacity-40"
          style={{
            backgroundColor: "#a7b5a0",
            animation: "hero-float 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-48 -right-24 size-[34rem] rounded-full blur-3xl opacity-35"
          style={{
            backgroundColor: "#6f7f69",
            animation: "hero-float 18s ease-in-out infinite",
            animationDelay: "1.5s",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 hidden size-40 rounded-full blur-2xl opacity-30 md:block"
          style={{
            backgroundColor: "#b8975a",
            animation: "hero-shimmer 8s ease-in-out infinite",
          }}
        />
      </div>

      <Container
        size="xl"
        className="relative grid items-center gap-12 py-24 sm:py-28 lg:grid-cols-2 lg:gap-16 lg:py-36"
      >
        {/* Copy column — stays centered even when paired with the image
            on desktop, keeping the editorial card composition. */}
        <div
          className="flex flex-col items-center gap-8 text-center sm:gap-10"
          style={{ animation: "hero-fade-up 1.1s ease-out both" }}
        >
          <div className="flex flex-col items-center gap-8 sm:gap-10">
            {hero.eyebrow ? (
              <span
                className="text-[0.7rem] font-medium uppercase tracking-[0.5em] sm:text-xs"
                style={{ color: "#b8975a" }}
              >
                {hero.eyebrow}
              </span>
            ) : null}

            <LeafSprig className="w-40" />

            <h1
              className="font-serif leading-[0.95] text-[3.25rem] sm:text-7xl lg:text-[5rem] xl:text-[6rem]"
              style={{ color: "#2e2e2c" }}
            >
              {hero.heading}
            </h1>

            <DotDivider />

            <p
              className="text-sm font-medium uppercase tracking-[0.4em] sm:text-base sm:tracking-[0.5em]"
              style={{ color: "#6f7f69" }}
            >
              {formattedDate}
            </p>
          </div>

          {(primaryCta || secondaryCta || tertiaryCta) && (
            <div
              className="mt-4 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              style={{ animation: "hero-fade-up 1.1s 0.2s ease-out both" }}
            >
              {secondaryCta ? (
                <Button
                  href={secondaryCta.href}
                  size="md"
                  variant="secondary"
                  className="sm:order-1"
                >
                  {secondaryCta.label}
                </Button>
              ) : null}
              {tertiaryCta ? (
                <Button
                  href={tertiaryCta.href}
                  size="md"
                  variant="secondary"
                  className="sm:order-2"
                >
                  {tertiaryCta.label}
                </Button>
              ) : null}
              {primaryCta ? (
                <Button
                  href={primaryCta.href}
                  size="md"
                  variant="primary"
                  className="sm:order-3"
                >
                  {primaryCta.label}
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* Image column — hidden on mobile/tablet so the invitation card
            keeps focus, restored on lg+ as a tall portrait alongside. */}
        {hero.backgroundImage ? (
          <div
            className="relative hidden lg:block"
            style={{ animation: "hero-fade-in 1.4s ease-out both" }}
          >
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[2rem] xl:max-w-lg">
              <Image
                src={hero.backgroundImage.src}
                alt={hero.backgroundImage.alt}
                fill
                priority
                sizes="(min-width: 1280px) 32rem, (min-width: 1024px) 28rem, 100vw"
                className="object-cover"
              />
              {/* Soft cream wash to keep the photo on-brand. */}
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-soft-light"
                style={{
                  background:
                    "linear-gradient(140deg, rgba(245, 241, 234, 0.3), transparent 55%)",
                }}
              />
            </div>

            {/* Floating C & M / Forever monogram pill */}
            <div
              className="absolute -bottom-8 left-10 flex items-center gap-3 rounded-full px-5 py-3 backdrop-blur-md"
              style={{
                backgroundColor: "rgba(245, 241, 234, 0.85)",
                border: "1px solid rgba(184, 151, 90, 0.5)",
                boxShadow: "0 20px 40px -24px rgba(46, 46, 44, 0.3)",
              }}
            >
              <span
                className="font-serif text-2xl"
                style={{ color: "#2e2e2c" }}
              >
                {couple.partnerOne.firstName.charAt(0)}
                <span className="mx-1" style={{ color: "#b8975a" }}>
                  &
                </span>
                {couple.partnerTwo.firstName.charAt(0)}
              </span>
              <span
                className="text-[0.65rem] uppercase tracking-[0.32em]"
                style={{ color: "#6f7f69" }}
              >
                Forever
              </span>
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/**
 * Thin rule + gold dot + thin rule, set on a single row. Used as a
 * decorative separator between the names and the date.
 */
function DotDivider() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="h-px w-16 sm:w-24"
        style={{ backgroundColor: "#6f7f69", opacity: 0.4 }}
      />
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ backgroundColor: "#b8975a" }}
      />
      <span
        aria-hidden
        className="h-px w-16 sm:w-24"
        style={{ backgroundColor: "#6f7f69", opacity: 0.4 }}
      />
    </div>
  );
}

export default HeroSection;
