import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface HeroSectionProps {
  config: WeddingConfig;
}

/**
 * Hero — full-bleed editorial layout.
 *
 * Pulls names, date, hero image, and CTA copy from `WeddingConfig`. The
 * decorative blurred shapes and thin gold rule give the soft luxury feel
 * referenced in the design brief without leaning on extra dependencies.
 *
 * Sanity migration: when content moves to a CMS, the same `WeddingConfig`
 * shape arrives from the fetcher — this component does not change.
 */
export function HeroSection({ config }: HeroSectionProps) {
  const { hero, couple } = config;

  const primaryCta =
    hero.ctaLabel && hero.ctaHref
      ? { label: hero.ctaLabel, href: hero.ctaHref }
      : null;
  const secondaryCta =
    hero.secondaryCtaLabel && hero.secondaryCtaHref
      ? { label: hero.secondaryCtaLabel, href: hero.secondaryCtaHref }
      : null;

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      {/* Decorative background shapes — pure CSS, no extra layout cost. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute -top-40 -left-32 size-[28rem] rounded-full blur-3xl opacity-40"
          style={{
            backgroundColor: "var(--color-sage)",
            animation: "hero-float 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-48 -right-24 size-[34rem] rounded-full blur-3xl opacity-35"
          style={{
            backgroundColor: "var(--color-sage-dark)",
            animation: "hero-float 18s ease-in-out infinite",
            animationDelay: "1.5s",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 hidden size-40 rounded-full blur-2xl opacity-30 md:block"
          style={{
            backgroundColor: "var(--color-gold)",
            animation: "hero-shimmer 8s ease-in-out infinite",
          }}
        />
      </div>

      <Container
        size="xl"
        className="relative grid gap-14 py-20 sm:py-24 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-32"
      >
        {/* Copy column */}
        <div
          className="flex flex-col gap-8 text-center lg:col-span-6 lg:text-left"
          style={{ animation: "hero-fade-up 1.1s ease-out both" }}
        >
          {hero.eyebrow ? (
            <div className="flex items-center justify-center gap-4 lg:justify-start">
              <span
                aria-hidden
                className="hidden h-px w-10 lg:block"
                style={{
                  backgroundColor: "var(--color-gold)",
                  opacity: 0.7,
                }}
              />
              <span
                className="text-[0.7rem] font-medium uppercase tracking-[0.5em]"
                style={{ color: "var(--color-gold)" }}
              >
                {hero.eyebrow}
              </span>
              <span
                aria-hidden
                className="hidden h-px w-10 lg:block"
                style={{
                  backgroundColor: "var(--color-gold)",
                  opacity: 0.7,
                }}
              />
            </div>
          ) : null}

          <h1
            className="font-serif text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-[6.5rem]"
            style={{ color: "var(--color-charcoal)" }}
          >
            {hero.heading}
          </h1>

          {hero.subheading ? (
            <p
              className="mx-auto max-w-md text-base leading-relaxed sm:text-lg lg:mx-0"
              style={{ color: "var(--color-sage-dark)" }}
            >
              {hero.subheading}
            </p>
          ) : null}

          {(primaryCta || secondaryCta) && (
            <div className="mt-2 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
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
              {primaryCta ? (
                <Button
                  href={primaryCta.href}
                  size="md"
                  variant="primary"
                  className="sm:order-2"
                >
                  {primaryCta.label}
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* Image column */}
        {hero.backgroundImage ? (
          <div
            className="relative lg:col-span-6"
            style={{ animation: "hero-fade-in 1.4s ease-out both" }}
          >
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[2rem] sm:max-w-lg lg:max-w-none">
              <Image
                src={hero.backgroundImage.src}
                alt={hero.backgroundImage.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 80vw, 100vw"
                className="object-cover"
              />
              {/* Soft cream wash to keep the image editorial and on-brand. */}
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-soft-light"
                style={{
                  background:
                    "linear-gradient(140deg, color-mix(in srgb, var(--color-cream) 30%, transparent), transparent 55%)",
                }}
              />
            </div>

            {/* Floating monogram card */}
            <div
              className="absolute -bottom-6 left-6 hidden items-center gap-3 rounded-full px-5 py-3 backdrop-blur-md sm:flex lg:-bottom-8 lg:left-10"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-cream) 85%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-gold) 50%, transparent)",
                boxShadow:
                  "0 20px 40px -24px color-mix(in srgb, var(--color-charcoal) 30%, transparent)",
              }}
            >
              <span
                className="font-serif text-2xl"
                style={{ color: "var(--color-charcoal)" }}
              >
                {couple.partnerOne.firstName.charAt(0)}
                <span className="mx-1" style={{ color: "var(--color-gold)" }}>
                  &
                </span>
                {couple.partnerTwo.firstName.charAt(0)}
              </span>
              <span
                className="text-[0.65rem] uppercase tracking-[0.32em]"
                style={{ color: "var(--color-sage-dark)" }}
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

export default HeroSection;
