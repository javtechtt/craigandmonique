import type { WeddingConfig, WeddingEvent } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { AddToCalendarButton } from "@/components/ui/AddToCalendarButton";
import { formatTime, formatShortDate } from "@/lib/formatDate";

interface WeddingDetailsSectionProps {
  config: WeddingConfig;
}

/**
 * Wedding Details — one card per `event` in the config.
 *
 * Reads ceremony, reception (and any future formal events) from
 * `config.events`. Time, address, and dress code come straight from
 * each event; nothing is hardcoded in markup.
 *
 * Sanity migration: when the config moves to a CMS, the same `events`
 * array shape arrives from the fetcher — this component does not change.
 */
export function WeddingDetailsSection({ config }: WeddingDetailsSectionProps) {
  const { events, timezone } = config;
  if (events.length === 0) return null;

  return (
    <section
      id="events"
      // `z-10` keeps the AddToCalendar dropdown above the next section's
      // stacking context if it ever extends past this section's bounds.
      className="relative isolate z-10 py-24 sm:py-28"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-sage) 18%, var(--color-cream))",
      }}
    >
      <Container size="xl" className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Save the dates"
          title="Wedding Details"
          description="Where and when to find us on the day."
        />

        <ul
          className={`grid gap-6 sm:gap-8 ${
            events.length === 1 ? "max-w-xl mx-auto" : "md:grid-cols-2"
          }`}
        >
          {events.map((event, idx) => (
            <li key={event.id}>
              <DetailsCard
                event={event}
                timezone={timezone}
                weddingSlug={config.slug}
                index={idx}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

interface DetailsCardProps {
  event: WeddingEvent;
  timezone: string;
  weddingSlug: string;
  index: number;
}

function DetailsCard({
  event,
  timezone,
  weddingSlug,
  index,
}: DetailsCardProps) {
  const startTime = formatTime(event.startsAt, { timezone });
  const endTime = event.endsAt
    ? formatTime(event.endsAt, { timezone })
    : null;
  const date = formatShortDate(event.startsAt, { timezone });
  const directionsHref = buildDirectionsUrl(event);

  return (
    <article
      className="group relative flex h-full flex-col gap-6 rounded-3xl px-7 py-10 sm:px-10 sm:py-12"
      style={{
        backgroundColor: "var(--color-cream)",
        border:
          "1px solid color-mix(in srgb, var(--color-sage) 60%, transparent)",
        boxShadow:
          "0 30px 60px -40px color-mix(in srgb, var(--color-sage-dark) 60%, transparent)",
        animation: `hero-fade-up 0.9s ${0.05 * index}s ease-out both`,
      }}
    >
      {/* Decorations clip wrapper — keeps the blurred flourish inside the
          card edges while letting the AddToCalendar dropdown escape. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      >
        <span
          className="absolute -right-20 -top-20 size-56 rounded-full blur-3xl opacity-40"
          style={{ backgroundColor: "var(--color-sage)" }}
        />
      </div>

      <header className="relative flex flex-col items-center gap-3 text-center">
        <span
          className="text-[0.7rem] font-medium uppercase tracking-[0.5em]"
          style={{ color: "var(--color-gold)" }}
        >
          {date}
        </span>
        <h3
          className="font-serif text-3xl sm:text-4xl"
          style={{ color: "var(--color-charcoal)" }}
        >
          {event.title}
        </h3>
        <span
          aria-hidden
          className="block h-px w-12"
          style={{ backgroundColor: "var(--color-gold)", opacity: 0.6 }}
        />
      </header>

      <dl
        className="relative grid gap-5 text-center sm:gap-6"
        style={{ color: "var(--color-charcoal)" }}
      >
        <DetailRow label="Time">
          {startTime}
          {endTime ? (
            <span className="opacity-70"> — {endTime}</span>
          ) : null}
        </DetailRow>

        <DetailRow label="Location">
          <span className="font-medium">{event.venue.name}</span>
        </DetailRow>

        <DetailRow label="Address">
          <span className="not-italic leading-relaxed">
            {event.venue.addressLine1}
            {event.venue.addressLine2 ? (
              <>
                <br />
                {event.venue.addressLine2}
              </>
            ) : null}
            <br />
            {[event.venue.city, event.venue.region]
              .filter(Boolean)
              .join(", ")}
            <br />
            {event.venue.country}
          </span>
        </DetailRow>

        {event.description ? (
          <p
            className="mt-2 text-sm italic leading-relaxed sm:text-base"
            style={{ color: "var(--color-sage-dark)" }}
          >
            {event.description}
          </p>
        ) : null}
      </dl>

      <div className="relative mt-auto flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
        <Button
          href={directionsHref}
          variant="secondary"
          size="sm"
          target="_blank"
          rel="noreferrer"
        >
          Directions
        </Button>
        <AddToCalendarButton
          event={event}
          timezone={timezone}
          weddingSlug={weddingSlug}
        />
      </div>
    </article>
  );
}

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <dt
        className="text-[0.65rem] font-medium uppercase tracking-[0.4em]"
        style={{ color: "var(--color-sage-dark)" }}
      >
        {label}
      </dt>
      <dd className="text-sm sm:text-base">{children}</dd>
    </div>
  );
}

/**
 * Prefer the explicit `mapsUrl` from the venue. Fall back to a Google Maps
 * search URL built from the address parts so the button still does
 * something meaningful when content is added without a custom maps link.
 */
function buildDirectionsUrl(event: WeddingEvent): string {
  if (event.venue.mapsUrl) return event.venue.mapsUrl;
  const query = [
    event.venue.name,
    event.venue.addressLine1,
    event.venue.addressLine2,
    event.venue.city,
    event.venue.region,
    event.venue.country,
  ]
    .filter((part): part is string => Boolean(part))
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default WeddingDetailsSection;
