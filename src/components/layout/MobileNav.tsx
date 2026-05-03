"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WeddingNavItem } from "@/types/wedding";

interface MobileNavProps {
  brand: string;
  items: WeddingNavItem[];
}

/**
 * Mobile navigation — full-screen takeover.
 *
 * Tapping the trigger replaces the viewport with a single white surface
 * that contains the brand mark, a close control, and the nav links
 * stacked at editorial scale. There is no separate backdrop layer and
 * no drawer panel — the overlay itself is the only painted surface, so
 * there is no chance for compositing or stacking-context glitches to
 * leak the page through.
 */
export function MobileNav({ brand, items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

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

      {open ? (
        <section
          role="dialog"
          aria-modal="true"
          aria-label={`${brand} navigation`}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{
            backgroundColor: "#ffffff",
            backgroundImage: "linear-gradient(#ffffff, #ffffff)",
            isolation: "isolate",
            opacity: 1,
            animation: "hero-fade-in 0.25s ease-out both",
          }}
        >
          <header className="flex items-center justify-between px-6 py-6">
            <span
              className="font-serif text-2xl"
              style={{ color: "#2e2e2c" }}
            >
              {brand}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                color: "#2e2e2c",
                backgroundColor: "#ffffff",
                border: "1px solid rgba(111, 127, 105, 0.45)",
              }}
            >
              <TriggerCross />
            </button>
          </header>

          <ol className="flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-24">
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
                  className="font-serif tracking-tight"
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

          <footer
            className="flex justify-center px-6 pb-10 text-xs uppercase"
            style={{
              color: "#6f7f69",
              letterSpacing: "0.4em",
              animation: `hero-fade-up 0.45s ${0.07 * items.length + 0.1}s ease-out both`,
            }}
          >
            Tap a section to navigate
          </footer>
        </section>
      ) : null}
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
