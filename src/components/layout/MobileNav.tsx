"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { WeddingNavItem } from "@/types/wedding";

interface MobileNavProps {
  brand: string;
  monogram: { left: string; right: string };
  items: WeddingNavItem[];
}

const BACKDROP_IMAGE = "/images/gallery/RZ9_7128.jpg";

/**
 * Mobile navigation — full-screen takeover rendered into `document.body`
 * via `createPortal` so it escapes any ancestor stacking context. The
 * overlay covers the viewport with a solid cream surface, layered with a
 * softened wedding photograph and the brand's editorial accents.
 */
export function MobileNav({ brand, monogram, items }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  // Portal target only exists after mount; gate to avoid SSR mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      html.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const overlay = open ? (
    <section
      role="dialog"
      aria-modal="true"
      aria-label={`${brand} navigation`}
      aria-labelledby={titleId}
      className="fixed inset-0 z-[99999] flex h-screen w-screen flex-col overflow-hidden"
      style={{
        backgroundColor: "#f5f1ea",
        animation: "hero-fade-in 0.25s ease-out both",
      }}
    >
      {/* Softened wedding photograph as the backdrop. The cream section
          fill underneath guarantees the surface is opaque even before
          the image loads. */}
      <Image
        src={BACKDROP_IMAGE}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        loading="eager"
        className="pointer-events-none object-cover"
        style={{
          opacity: 0.2,
          // Nudge the visible crop ~20px right of centre to better
          // frame the couple within the viewport.
          objectPosition: "calc(50% + 20px) center",
        }}
      />
      {/* Soft cream wash kept light so the photo reads through. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "rgba(245, 241, 234, 0.18)" }}
      />

      <header className="relative flex items-center justify-between px-6 py-6">
        <span
          id={titleId}
          className="inline-flex items-center font-serif text-2xl leading-none tracking-tight"
          style={{ color: "#2e2e2c" }}
        >
          <span className="leading-none">{monogram.left}</span>
          <span
            className="mx-0.5 leading-none"
            style={{ color: "#b8975a" }}
          >
            &
          </span>
          <span className="leading-none">{monogram.right}</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            color: "#2e2e2c",
            backgroundColor: "#f5f1ea",
            border: "1px solid rgba(111, 127, 105, 0.5)",
          }}
        >
          <TriggerCross />
        </button>
      </header>

      <div
        className="relative flex items-center justify-center gap-3 pt-1 pb-3"
        aria-hidden
      >
        <span
          className="h-px w-12"
          style={{ backgroundColor: "#6f7f69", opacity: 0.4 }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "#b8975a" }}
        />
        <span
          className="h-px w-12"
          style={{ backgroundColor: "#6f7f69", opacity: 0.4 }}
        />
      </div>

      <ol className="relative flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-16">
        {items.map((item, index) => (
          <li
            key={item.href}
            style={{
              animation: `hero-fade-up 0.45s ${0.07 * index + 0.05}s ease-out both`,
            }}
          >
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-serif tracking-tight transition-colors"
              style={{
                color: "#2e2e2c",
                fontSize: "2.5rem",
                lineHeight: 1.1,
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  ) : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          color: "#2e2e2c",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(111, 127, 105, 0.45)",
        }}
      >
        <TriggerLines />
      </button>

      {mounted && overlay
        ? createPortal(overlay, document.body)
        : null}
    </div>
  );
}

function TriggerLines() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      width="20"
      height="20"
    >
      <line x1="4" y1="8" x2="18" y2="8" />
      <line x1="4" y1="14" x2="18" y2="14" />
    </svg>
  );
}

function TriggerCross() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      width="18"
      height="18"
    >
      <line x1="5" y1="5" x2="17" y2="17" />
      <line x1="17" y1="5" x2="5" y2="17" />
    </svg>
  );
}

export default MobileNav;
