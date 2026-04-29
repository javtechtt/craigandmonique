"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { formatWeddingDate } from "@/lib/formatDate";

interface CountdownSectionProps {
  config: WeddingConfig;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ZERO: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function diff(target: number, now: number): TimeLeft {
  const ms = Math.max(0, target - now);
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / (60 * 60 * 24)),
    hours: Math.floor((totalSeconds / (60 * 60)) % 24),
    minutes: Math.floor((totalSeconds / 60) % 60),
    seconds: totalSeconds % 60,
  };
}

function isValidWeddingDate(iso: string | undefined): iso is string {
  if (!iso) return false;
  const time = Date.parse(iso);
  return Number.isFinite(time);
}

const UNITS: Array<{ key: keyof TimeLeft; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

/**
 * Countdown — client component because it ticks every second.
 *
 * Reads the wedding date and image from `WeddingConfig`. If the configured
 * date is missing or unparseable the section renders a graceful fallback
 * instead of a broken NaN counter. Past dates collapse to zeros.
 */
export function CountdownSection({ config }: CountdownSectionProps) {
  const { weddingDate, timezone, couple } = config;
  const valid = isValidWeddingDate(weddingDate);
  const target = valid ? Date.parse(weddingDate) : null;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    target !== null ? diff(target, Date.now()) : ZERO,
  );

  useEffect(() => {
    if (target === null) return;
    // Snap to the next whole second to avoid drift on initial paint.
    setTimeLeft(diff(target, Date.now()));
    const id = window.setInterval(() => {
      setTimeLeft(diff(target, Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const formattedDate = valid
    ? formatWeddingDate(weddingDate, { timezone })
    : null;

  return (
    <section
      id="countdown"
      className="relative isolate overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-sage) 22%, var(--color-cream))",
      }}
    >
      {/* Decorative background image — subtle, washed to the palette. */}
      {config.hero.backgroundImage ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25">
          <Image
            src={config.hero.backgroundImage.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-2xl"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, transparent, color-mix(in srgb, var(--color-cream) 65%, transparent))",
            }}
          />
        </div>
      ) : null}

      <Container size="lg" className="flex flex-col items-center gap-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-[0.7rem] font-medium uppercase tracking-[0.5em]"
            style={{ color: "var(--color-gold)" }}
          >
            Counting the moments
          </span>
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl"
            style={{ color: "var(--color-charcoal)" }}
          >
            Until {couple.displayName} say I do
          </h2>
          {formattedDate ? (
            <p
              className="text-xs uppercase tracking-[0.32em]"
              style={{ color: "var(--color-sage-dark)" }}
            >
              {formattedDate}
            </p>
          ) : null}
        </div>

        {valid ? (
          <ul
            role="timer"
            aria-live="polite"
            aria-label={`Time remaining until ${couple.displayName}'s wedding`}
            className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
          >
            {UNITS.map(({ key, label }, idx) => (
              <li
                key={key}
                className="relative flex flex-col items-center justify-center gap-2 rounded-2xl px-4 py-8 backdrop-blur-sm sm:py-10"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-cream) 90%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-sage) 60%, transparent)",
                  boxShadow:
                    "0 20px 50px -32px color-mix(in srgb, var(--color-sage-dark) 40%, transparent)",
                  animation: `hero-fade-up 0.9s ${0.05 * idx}s ease-out both`,
                }}
              >
                <span
                  className="font-serif text-5xl tabular-nums leading-none sm:text-6xl"
                  style={{ color: "var(--color-charcoal)" }}
                >
                  {String(timeLeft[key]).padStart(2, "0")}
                </span>
                <span
                  className="text-[0.65rem] font-medium uppercase tracking-[0.4em]"
                  style={{ color: "var(--color-sage-dark)" }}
                >
                  {label}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-10 bottom-3 h-px"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    opacity: 0.45,
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="mx-auto max-w-lg rounded-2xl px-8 py-10"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-cream) 90%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--color-sage) 60%, transparent)",
            }}
          >
            <p
              className="font-serif text-2xl sm:text-3xl"
              style={{ color: "var(--color-charcoal)" }}
            >
              The date is on its way.
            </p>
            <p
              className="mt-3 text-sm uppercase tracking-[0.32em]"
              style={{ color: "var(--color-sage-dark)" }}
            >
              Save the date — details to follow.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}

export default CountdownSection;
