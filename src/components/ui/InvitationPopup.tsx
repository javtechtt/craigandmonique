"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { lookupGuestByToken } from "@/app/actions/guest";
import { LeafSprig } from "@/components/ui/LeafSprig";

interface InvitationPopupProps {
  /**
   * Couple's display name. Rendered as the headline (e.g. "Craig & Monique").
   */
  coupleDisplayName: string;
  /**
   * Pretty-formatted wedding date for the hero line of the card
   * (e.g. "August 2nd, 2026").
   */
  weddingDateLabel: string;
}

const BACKDROP_IMAGE = "/images/gallery/RZ9_7108.jpg";

/**
 * Personalised invitation popup — appears on first visit when the URL
 * carries a recognised `?guest=token` param. Looks up the guest's name
 * via the existing `lookupGuestByToken` Server Action and renders a
 * landscape "card" modal with the wedding photograph as the backdrop.
 *
 * Intentionally NOT gated by sessionStorage yet — the couple wants to
 * preview the design across reloads. Once approved we can suppress
 * after the first dismissal.
 */
export function InvitationPopup({
  coupleDisplayName,
  weddingDateLabel,
}: InvitationPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const titleId = useId();

  const searchParams = useSearchParams();
  const token = searchParams.get("guest");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Look up the guest whenever the token in the URL changes. If the
  // token is missing or unrecognised we simply never open the popup.
  useEffect(() => {
    if (!token) {
      setOpen(false);
      setGuestName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await lookupGuestByToken(token);
      if (cancelled) return;
      if (result.ok) {
        setGuestName(result.guest.fullName);
        setOpen(true);
      } else {
        setGuestName(null);
        setOpen(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Lock body scroll + register ESC to dismiss while the modal is open.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      html.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!mounted || !open || !guestName) return null;

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
      style={{
        backgroundColor: "rgba(46, 46, 44, 0.78)",
        animation: "hero-fade-in 0.35s ease-out both",
      }}
      onClick={() => setOpen(false)}
    >
      {/* Card — landscape aspect on tablet+. On mobile the strict
          16:10 ratio forces the card too short to hold the copy, so we
          let the height grow with the content there and reinstate the
          landscape proportions from `sm:` upward. */}
      <article
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl sm:aspect-[16/10]"
        style={{
          backgroundColor: "#2e2e2c",
          animation: "hero-fade-up 0.55s ease-out both",
        }}
      >
        {/* Engagement photo as the backdrop. */}
        <Image
          src={BACKDROP_IMAGE}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 1024px) 100vw, 1024px"
          loading="eager"
          priority
          className="pointer-events-none object-cover"
          style={{ objectPosition: "center 35%" }}
        />

        {/* Soft cream-to-charcoal vignette so the centred copy reads
            against any part of the image. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(46,46,44,0.45) 0%, rgba(46,46,44,0.7) 70%, rgba(46,46,44,0.85) 100%)",
          }}
        />

        {/* Decorative gold corner border */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 sm:inset-4 rounded-xl"
          style={{
            border: "1px solid rgba(184, 151, 90, 0.45)",
          }}
        />

        {/* Dismiss (×) — keyboard users can also press ESC */}
        <button
          type="button"
          aria-label="Close invitation"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 inline-flex size-9 items-center justify-center rounded-full text-cream/80 transition hover:text-cream"
          style={{ backgroundColor: "rgba(46, 46, 44, 0.4)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M3 3 L13 13 M13 3 L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Content. On mobile (no aspect lock), flows top-to-bottom with
            natural spacing. From sm: upward, fills the landscape card
            and centres vertically. */}
        <div className="relative flex w-full flex-col items-center px-6 py-9 text-center sm:h-full sm:justify-center sm:px-12 sm:py-10">
          {/* Personalised "To:" line — opens the invitation with a
              direct address before the formal copy. */}
          <div className="flex flex-col items-center gap-1">
            <p
              className="font-serif text-sm italic sm:text-base"
              style={{ color: "rgba(245, 241, 234, 0.92)" }}
            >
              <span
                className="mr-2 text-[0.65rem] uppercase not-italic tracking-[0.32em]"
                style={{ color: "rgba(245, 241, 234, 0.55)" }}
              >
                To
              </span>
              {guestName}
            </p>
            <span
              aria-hidden
              className="block h-px w-16"
              style={{ backgroundColor: "rgba(245, 241, 234, 0.35)" }}
            />
          </div>

          {/* Sprig pair */}
          <div className="mt-3 flex w-full items-center justify-center gap-6 opacity-80 sm:mt-4">
            <LeafSprig
              className="w-24 sm:w-32 md:w-40"
              color="#d8c397"
              leafColor="#b8975a"
            />
            <LeafSprig
              className="w-24 sm:w-32 md:w-40"
              color="#d8c397"
              leafColor="#b8975a"
              flip
            />
          </div>

          <h2
            id={titleId}
            className="mt-3 font-serif text-3xl leading-tight tracking-wide sm:mt-4 sm:text-4xl md:text-5xl"
            style={{ color: "#f5f1ea" }}
          >
            {coupleDisplayName}
          </h2>

          <p
            className="mt-2 text-[0.68rem] uppercase tracking-[0.42em] sm:text-xs"
            style={{ color: "rgba(245, 241, 234, 0.75)" }}
          >
            invite you to
          </p>

          <p
            className="mt-3 font-serif text-xl italic sm:mt-4 sm:text-2xl md:text-3xl"
            style={{ color: "#f5f1ea" }}
          >
            our wedding celebration
          </p>

          {/* Hairline + date */}
          <div className="mt-3 flex items-center gap-4 sm:mt-4">
            <span
              aria-hidden
              className="block h-px w-10 sm:w-16"
              style={{ backgroundColor: "rgba(184, 151, 90, 0.7)" }}
            />
            <span
              className="font-serif text-base tracking-[0.2em] sm:text-lg md:text-xl"
              style={{ color: "#d8c397" }}
            >
              {weddingDateLabel}
            </span>
            <span
              aria-hidden
              className="block h-px w-10 sm:w-16"
              style={{ backgroundColor: "rgba(184, 151, 90, 0.7)" }}
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-5 inline-flex items-center justify-center rounded-full px-7 py-2.5 text-xs font-medium uppercase tracking-[0.32em] transition hover:scale-[1.02] sm:mt-6 sm:px-8 sm:py-3"
            style={{
              backgroundColor: "#b8975a",
              color: "#f5f1ea",
              boxShadow: "0 6px 24px rgba(184, 151, 90, 0.35)",
            }}
          >
            View Details
          </button>
        </div>
      </article>
    </div>
  );

  return createPortal(overlay, document.body);
}

export default InvitationPopup;
