import type { WeddingConfig, WeddingScheduleItem } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatTime } from "@/lib/formatDate";
import { cn } from "@/lib/cn";

interface ScheduleSectionProps {
  config: WeddingConfig;
}

/**
 * Schedule — the wedding day timeline.
 *
 * Vertical timeline on mobile (line on the left, items stacked).
 * Alternating timeline on desktop (line down the centre, items
 * flipping left/right). Time, title, and copy all come from
 * `config.schedule.items` — no hardcoded times in markup.
 */
export function ScheduleSection({ config }: ScheduleSectionProps) {
  const { schedule, timezone } = config;
  if (schedule.items.length === 0) return null;

  return (
    <section
      id="schedule"
      className="relative isolate overflow-hidden py-24 sm:py-28"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      {/* Soft sage glow drifting behind the timeline */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 size-[28rem] -translate-x-1/2 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: "var(--color-sage)" }}
      />

      <Container size="lg" className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="The day, hour by hour"
          title={schedule.heading}
          description={schedule.description}
        />

        <div className="relative mx-auto w-full max-w-3xl">
          {/* Spine — left on mobile, centred on desktop */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-4 w-px md:left-1/2 md:-translate-x-1/2"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--color-gold) 70%, transparent) 8%, color-mix(in srgb, var(--color-gold) 70%, transparent) 92%, transparent)",
            }}
          />

          <ol className="relative flex flex-col gap-10 sm:gap-12">
            {schedule.items.map((item, idx) => (
              <TimelineItem
                key={item.id}
                item={item}
                index={idx}
                timezone={timezone}
              />
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

interface TimelineItemProps {
  item: WeddingScheduleItem;
  index: number;
  timezone: string;
}

function TimelineItem({ item, index, timezone }: TimelineItemProps) {
  const isLeft = index % 2 === 0;
  const startTime = formatTime(item.time, { timezone });
  const endTime = item.endTime
    ? formatTime(item.endTime, { timezone })
    : null;

  return (
    <li
      className="relative md:grid md:grid-cols-2 md:gap-x-12"
      style={{ animation: `hero-fade-up 0.9s ${0.05 * index}s ease-out both` }}
    >
      {/* Marker dot — sits on the spine */}
      <span
        aria-hidden
        className="absolute top-3 left-4 size-3 -translate-x-1/2 rounded-full md:left-1/2"
        style={{
          backgroundColor: "var(--color-gold)",
          boxShadow:
            "0 0 0 4px var(--color-cream), 0 0 0 5px color-mix(in srgb, var(--color-gold) 50%, transparent)",
        }}
      />

      <div
        className={cn(
          "pl-12 md:pl-0",
          isLeft
            ? "md:col-start-1 md:pr-10 md:text-right"
            : "md:col-start-2 md:pl-10",
        )}
      >
        <article
          className="rounded-2xl p-6 sm:p-7"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-cream) 92%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--color-sage) 50%, transparent)",
            boxShadow:
              "0 18px 40px -28px color-mix(in srgb, var(--color-sage-dark) 50%, transparent)",
          }}
        >
          <time
            dateTime={item.time}
            className="block text-[0.7rem] font-medium uppercase tracking-[0.4em]"
            style={{ color: "var(--color-gold)" }}
          >
            {startTime}
            {endTime ? (
              <span style={{ color: "var(--color-sage-dark)" }}>
                {" "}
                — {endTime}
              </span>
            ) : null}
          </time>

          <h3
            className="mt-2 font-serif text-2xl sm:text-3xl"
            style={{ color: "var(--color-charcoal)" }}
          >
            {item.title}
          </h3>

          {item.description ? (
            <p
              className="mt-3 text-sm leading-relaxed sm:text-base"
              style={{ color: "var(--color-sage-dark)" }}
            >
              {item.description}
            </p>
          ) : null}
        </article>
      </div>
    </li>
  );
}

export default ScheduleSection;
