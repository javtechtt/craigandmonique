import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
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
  const { hero, weddingDate, timezone } = config;
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

            <LeafSprig />

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
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/**
 * Botanical sprig drawn as a curved branch with paired leaves and a small
 * dot to the side. Pure SVG, scales with the surrounding text. Sage
 * stroke matches the wedding palette.
 */
function LeafSprig() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 36"
      width="160"
      height="36"
      className="opacity-90"
    >
      <g
        stroke="#6f7f69"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Tiny dot to the left of the branch */}
        <circle cx="6" cy="18" r="1.6" fill="#6f7f69" />

        {/* Main stem — gentle S-curve */}
        <path d="M16 18 C 40 8, 70 6, 92 10 C 110 13, 132 14, 154 18" />

        {/* Upper-side leaves */}
        <path d="M30 14 Q 33 6, 42 8 Q 38 14, 30 14 Z" fill="#6f7f69" fillOpacity="0.18" />
        <path d="M52 10 Q 56 2, 65 5 Q 60 12, 52 10 Z" fill="#6f7f69" fillOpacity="0.18" />
        <path d="M76 9 Q 80 1, 90 4 Q 84 11, 76 9 Z" fill="#6f7f69" fillOpacity="0.18" />
        <path d="M100 12 Q 104 4, 114 7 Q 108 14, 100 12 Z" fill="#6f7f69" fillOpacity="0.18" />
        <path d="M124 14 Q 130 6, 140 10 Q 132 17, 124 14 Z" fill="#6f7f69" fillOpacity="0.18" />

        {/* Lower-side leaves */}
        <path d="M40 22 Q 44 30, 51 27 Q 47 21, 40 22 Z" fill="#6f7f69" fillOpacity="0.18" />
        <path d="M64 22 Q 68 30, 75 27 Q 71 21, 64 22 Z" fill="#6f7f69" fillOpacity="0.18" />
        <path d="M88 22 Q 92 30, 100 27 Q 95 21, 88 22 Z" fill="#6f7f69" fillOpacity="0.18" />
        <path d="M112 23 Q 117 30, 124 27 Q 119 22, 112 23 Z" fill="#6f7f69" fillOpacity="0.18" />
      </g>
    </svg>
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
