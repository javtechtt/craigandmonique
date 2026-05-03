"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WeddingNavItem } from "@/types/wedding";
import { cn } from "@/lib/cn";

interface DesktopNavProps {
  items: WeddingNavItem[];
}

/**
 * Desktop nav with smooth-scroll anchor links and an active-section
 * indicator. While scrolling, the link whose anchor's `id` is most
 * "in view" gets a gold underline + colour shift via an
 * IntersectionObserver tuned to fire when a section is roughly
 * centred in the viewport.
 */
export function DesktopNav({ items }: DesktopNavProps) {
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    // Resolve hash hrefs ("#events" → element with id="events"). Skip
    // any nav items that don't point at an existing in-page anchor.
    const lookup = items
      .filter((item) => item.href.startsWith("#") && item.href.length > 1)
      .map((item) => {
        const id = item.href.slice(1);
        const el =
          typeof document !== "undefined"
            ? document.getElementById(id)
            : null;
        return el ? { item, el } : null;
      })
      .filter((entry): entry is { item: WeddingNavItem; el: Element } =>
        entry !== null,
      );

    if (lookup.length === 0) return;

    // The viewport band that triggers "this section is active". Top
    // offset accounts for the sticky header; bottom offset means the
    // section is considered active until it's well past the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        // Track every entry's intersection ratio so when several
        // sections are in view we pick the largest visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const top = visible[0].target.id;
        if (top) setActiveHref(`#${top}`);
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    lookup.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {items.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "relative text-xs font-medium uppercase tracking-[0.28em] transition-colors",
              "hover:text-[color:var(--color-gold)]",
            )}
            style={{
              color: isActive
                ? "var(--color-gold)"
                : "var(--color-charcoal)",
            }}
          >
            {item.label}
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-0 h-px transition-all duration-300"
              style={{
                width: isActive ? "100%" : "0%",
                backgroundColor: "var(--color-gold)",
              }}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export default DesktopNav;
