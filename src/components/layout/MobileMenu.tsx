"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { WeddingNavItem } from "@/types/wedding";

interface MobileMenuProps {
  brand: string;
  items: WeddingNavItem[];
  /** Optional CTA shown at the foot of the drawer (e.g. RSVP). */
  cta?: { label: string; href: string };
}

/**
 * Hamburger trigger + slide-in drawer for the mobile header. Renders the
 * navigation items at body-text size with serif accents so the drawer
 * feels editorial rather than utilitarian.
 *
 * Body scroll locks while open; Escape, backdrop click, or selecting any
 * item closes the drawer.
 */
export function MobileMenu({ brand, items, cta }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-full md:hidden"
        style={{
          color: "var(--color-charcoal)",
          backgroundColor: "var(--color-cream)",
          border:
            "1px solid color-mix(in srgb, var(--color-sage) 55%, transparent)",
        }}
      >
        <HamburgerIcon />
      </button>

      {open ? (
        // z-[60] keeps the drawer above the sticky header (z-40) and any
        // other sticky elements that may exist further up the tree.
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[60] md:hidden"
        >
          {/* Backdrop — heavily darkened so the underlying page reads as
              "behind" rather than competing with the drawer copy.
              No backdrop-filter — on mobile Safari it's been observed to
              cause adjacent absolutely-positioned siblings (our drawer
              panel) to render with their backgrounds composited away. */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={close}
            className="absolute inset-0 size-full"
            style={{
              backgroundColor: "rgba(46, 46, 44, 0.85)",
              animation: "hero-fade-in 0.2s ease-out both",
            }}
          />

          {/* Drawer panel — solid white fill via every channel we can:
              Tailwind utility (bg-white), inline backgroundColor literal,
              an explicit white linear-gradient as a non-defeasible
              background-image, and `isolation: isolate` to seal off the
              stacking context. */}
          <div
            className="absolute right-0 top-0 z-10 flex h-full w-[82vw] max-w-sm flex-col bg-white"
            style={{
              backgroundColor: "#ffffff",
              backgroundImage: "linear-gradient(#ffffff, #ffffff)",
              isolation: "isolate",
              opacity: 1,
              borderLeft: "1px solid rgba(167, 181, 160, 0.6)",
              boxShadow: "-30px 0 80px -20px rgba(46, 46, 44, 0.75)",
              animation:
                "drawer-slide-in 0.32s cubic-bezier(0.22, 0.61, 0.36, 1) both",
            }}
            role="presentation"
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{
                borderBottom:
                  "1px solid color-mix(in srgb, var(--color-sage) 40%, transparent)",
              }}
            >
              <span
                id={titleId}
                className="font-serif text-xl tracking-[0.05em]"
                style={{ color: "var(--color-charcoal)" }}
              >
                {brand}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close navigation"
                className="flex size-9 items-center justify-center rounded-full"
                style={{
                  color: "var(--color-charcoal)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-sage) 60%, transparent)",
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <nav
              aria-label="Mobile navigation"
              className="flex flex-1 flex-col gap-1 px-6 py-8"
            >
              {items.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="group flex items-center justify-between rounded-xl px-3 py-3 font-serif text-2xl transition-colors hover:bg-[color:var(--color-sage)] hover:text-[color:var(--color-cream)]"
                  style={{
                    color: "var(--color-charcoal)",
                    animation: `drawer-link-rise 0.4s ${0.04 * idx + 0.1}s ease-out both`,
                  }}
                >
                  <span>{item.label}</span>
                  <span
                    aria-hidden
                    className="text-sm tracking-[0.3em] opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: "var(--color-cream)" }}
                  >
                    &rarr;
                  </span>
                </Link>
              ))}
            </nav>

            {cta ? (
              <div
                className="px-6 pb-8"
                style={{
                  animation: `drawer-link-rise 0.4s ${0.04 * items.length + 0.15}s ease-out both`,
                }}
              >
                <Link
                  href={cta.href}
                  onClick={close}
                  className="flex h-12 w-full items-center justify-center rounded-full text-xs uppercase tracking-[0.32em]"
                  style={{
                    backgroundColor: "var(--color-sage-dark)",
                    color: "var(--color-cream)",
                  }}
                >
                  {cta.label}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-5"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
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
      aria-hidden
      className="size-4"
    >
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}

export default MobileMenu;
