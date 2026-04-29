"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { WeddingEvent } from "@/types/wedding";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildOutlookCalendarUrl,
  downloadIcsFile,
} from "@/lib/calendar";

interface AddToCalendarButtonProps {
  event: WeddingEvent;
  timezone: string;
  weddingSlug?: string;
  className?: string;
}

/**
 * Drop-down "Add to Calendar" trigger.
 *
 * Click reveals three options — Google Calendar (deep link), Apple
 * Calendar (.ics download), and Microsoft / Outlook (deep link). The
 * underlying URL/ICS payloads come from `lib/calendar.ts` so any
 * `WeddingEvent` from the config can be dropped in unchanged.
 */
export function AddToCalendarButton({
  event,
  timezone,
  weddingSlug = "wedding",
  className,
}: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointer(target: EventTarget | null) {
      if (!wrapperRef.current) return;
      if (target instanceof Node && wrapperRef.current.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onMouseDown(event: MouseEvent) {
      handlePointer(event.target);
    }
    function onTouchStart(event: TouchEvent) {
      handlePointer(event.target);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  function handleAppleClick() {
    const ics = buildIcsContent(event, timezone);
    const filename = `${weddingSlug}-${event.id}.ics`;
    downloadIcsFile(filename, ics);
    close();
  }

  return (
    <div
      ref={wrapperRef}
      className={cn("relative inline-flex", className)}
    >
      <Button
        variant="primary"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        Add to Calendar
        <ChevronIcon open={open} />
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`Add ${event.title} to calendar`}
          className="absolute left-1/2 top-full z-30 mt-3 w-60 -translate-x-1/2 overflow-hidden rounded-2xl p-1.5 text-left"
          style={{
            backgroundColor: "var(--color-cream)",
            border:
              "1px solid color-mix(in srgb, var(--color-sage) 60%, transparent)",
            boxShadow:
              "0 22px 50px -28px color-mix(in srgb, var(--color-sage-dark) 60%, transparent)",
            animation: "hero-fade-up 0.18s ease-out both",
          }}
        >
          <MenuItem
            href={buildGoogleCalendarUrl(event, timezone)}
            onSelect={close}
          >
            <CalendarGlyph variant="google" />
            Google Calendar
          </MenuItem>
          <MenuItem onClick={handleAppleClick}>
            <CalendarGlyph variant="apple" />
            Apple Calendar
          </MenuItem>
          <MenuItem
            href={buildOutlookCalendarUrl(event, timezone)}
            onSelect={close}
          >
            <CalendarGlyph variant="outlook" />
            Outlook
          </MenuItem>
        </div>
      ) : null}
    </div>
  );
}

interface MenuItemProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  onSelect?: () => void;
}

function MenuItem({ children, href, onClick, onSelect }: MenuItemProps) {
  const className =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm tracking-wide transition-colors hover:bg-[color:var(--color-sage)] hover:text-[color:var(--color-cream)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-sage-dark)]";

  const style: React.CSSProperties = { color: "var(--color-charcoal)" };

  if (href) {
    return (
      <a
        role="menuitem"
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={onSelect}
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        "size-3.5 transition-transform duration-200",
        open ? "rotate-180" : "rotate-0",
      )}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CalendarGlyph({
  variant,
}: {
  variant: "google" | "apple" | "outlook";
}) {
  const fill =
    variant === "google"
      ? "var(--color-gold)"
      : variant === "apple"
        ? "var(--color-charcoal)"
        : "var(--color-sage-dark)";

  return (
    <span
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-md"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-sage) 20%, var(--color-cream))",
        border:
          "1px solid color-mix(in srgb, var(--color-sage) 50%, transparent)",
        color: fill,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 3v4M16 3v4" />
      </svg>
    </span>
  );
}

export default AddToCalendarButton;
