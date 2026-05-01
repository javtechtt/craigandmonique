"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { WeddingConfig, WeddingImage } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

interface GallerySectionProps {
  config: WeddingConfig;
}

/**
 * Gallery — grid of thumbnails opens an in-page lightbox.
 *
 * Client component because the lightbox tracks open state, keyboard
 * input, and body-scroll lock. Images come straight from
 * `config.gallery.images` — order, count and alt text are all
 * config-driven.
 */
export function GallerySection({ config }: GallerySectionProps) {
  const { gallery, couple } = config;
  const images = gallery.images;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = useCallback((idx: number) => setActiveIndex(idx), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);
  const prev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    );
  }, [images.length]);

  // Keyboard navigation + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, close, next, prev]);

  if (images.length === 0) return null;

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <section
      id="gallery"
      className="relative isolate overflow-hidden py-24 sm:py-28"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 -z-10 size-[28rem] rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: "var(--color-sage)" }}
      />

      <Container size="xl" className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Captured together"
          title={gallery.heading}
          description={gallery.description}
        />

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {images.map((image, idx) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => open(idx)}
                aria-label={`Open image ${idx + 1} of ${images.length}: ${image.alt}`}
                className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-sage) 30%, var(--color-cream))",
                  border:
                    "1px solid color-mix(in srgb, var(--color-sage) 50%, transparent)",
                  animation: `hero-fade-up 0.9s ${0.04 * idx}s ease-out both`,
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--color-charcoal) 35%, transparent), transparent 50%)",
                  }}
                />
              </button>
            </li>
          ))}
        </ul>
      </Container>

      {activeImage ? (
        <Lightbox
          image={activeImage}
          index={activeIndex!}
          total={images.length}
          coupleName={couple.displayName}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      ) : null}
    </section>
  );
}

interface LightboxProps {
  image: WeddingImage;
  index: number;
  total: number;
  coupleName: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function Lightbox({
  image,
  index,
  total,
  coupleName,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${coupleName} gallery, image ${index + 1} of ${total}`}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 sm:px-8"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-charcoal) 92%, transparent)",
        animation: "hero-fade-in 0.25s ease-out both",
      }}
    >
      {/* Backdrop click closes the lightbox */}
      <button
        type="button"
        aria-label="Close gallery"
        onClick={onClose}
        className="absolute inset-0 size-full cursor-zoom-out"
      />

      <LightboxIconButton
        ariaLabel="Close gallery"
        onClick={onClose}
        className="absolute right-4 top-4 sm:right-6 sm:top-6"
      >
        <CloseIcon />
      </LightboxIconButton>

      <LightboxIconButton
        ariaLabel="Previous image"
        onClick={onPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4"
      >
        <ChevronIcon direction="left" />
      </LightboxIconButton>

      <LightboxIconButton
        ariaLabel="Next image"
        onClick={onNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4"
      >
        <ChevronIcon direction="right" />
      </LightboxIconButton>

      <figure
        className="relative z-10 flex max-h-full w-full flex-col items-center gap-3"
        style={{ animation: "hero-fade-up 0.4s ease-out both" }}
      >
        <div className="relative flex max-h-[80vh] w-auto max-w-full items-center justify-center">
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={image.width ?? 1500}
            height={image.height ?? 2000}
            sizes="(min-width: 1024px) 60vw, 90vw"
            priority
            className="h-auto max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>

        <figcaption
          className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.4em]"
          style={{ color: "var(--color-cream)" }}
        >
          <span style={{ color: "var(--color-gold)" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span aria-hidden className="opacity-60">
            /
          </span>
          <span className="opacity-70">
            {String(total).padStart(2, "0")}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

interface LightboxIconButtonProps {
  ariaLabel: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function LightboxIconButton({
  ariaLabel,
  onClick,
  children,
  className,
}: LightboxIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "z-20 flex size-11 items-center justify-center rounded-full backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-cream) 18%, transparent)",
        color: "var(--color-cream)",
        border:
          "1px solid color-mix(in srgb, var(--color-cream) 40%, transparent)",
      }}
    >
      {children}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      {direction === "left" ? (
        <path d="M15 6l-6 6 6 6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

export default GallerySection;
