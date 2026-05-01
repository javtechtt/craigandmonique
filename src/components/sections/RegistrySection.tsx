import type {
  RegistryLinkKind,
  WeddingConfig,
  WeddingRegistryLink,
} from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VineCurl } from "@/components/ui/LeafSprig";
import { Button } from "@/components/ui/Button";

interface RegistrySectionProps {
  config: WeddingConfig;
}

const KIND_LABEL: Record<RegistryLinkKind, string> = {
  registry: "Online Registry",
  honeymoon: "Honeymoon Fund",
  bank: "Direct Transfer",
  cash: "Cash Gift",
  other: "Other",
};

/**
 * Registry — optional, gated by `config.registry.enabled` plus the
 * `sections.registry` toggle in `wedding.config.ts`.
 *
 * Iterates `config.registry.links`. Each entry can either be a real URL
 * (renders a CTA) or a `details` block (e.g., bank info — rendered as a
 * preformatted block instead).
 */
export function RegistrySection({ config }: RegistrySectionProps) {
  const { registry } = config;
  if (!registry.enabled || registry.links.length === 0) return null;

  const heading = registry.heading ?? "Registry";

  return (
    <section
      id="registry"
      className="relative isolate overflow-hidden py-24 sm:py-28"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 size-[26rem] -translate-x-1/2 rounded-full blur-3xl opacity-25"
        style={{ backgroundColor: "var(--color-sage)" }}
      />

      <Container size="lg" className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="With gratitude"
          title={heading}
          description={registry.description}
          sprig={<VineCurl className="my-1 w-32 sm:w-36" />}
        />

        <ul
          className={
            registry.links.length === 1
              ? "mx-auto grid max-w-md gap-6"
              : "grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
          }
        >
          {registry.links.map((link, idx) => (
            <li key={`${link.label}-${idx}`}>
              <RegistryCard link={link} index={idx} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

interface RegistryCardProps {
  link: WeddingRegistryLink;
  index: number;
}

function RegistryCard({ link, index }: RegistryCardProps) {
  const kindLabel = link.kind ? KIND_LABEL[link.kind] : null;

  return (
    <article
      className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl px-7 py-9 sm:px-8"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-cream) 92%, transparent)",
        border:
          "1px solid color-mix(in srgb, var(--color-sage) 55%, transparent)",
        boxShadow:
          "0 24px 50px -34px color-mix(in srgb, var(--color-sage-dark) 55%, transparent)",
        animation: `hero-fade-up 0.9s ${0.05 * index}s ease-out both`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-44 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: "var(--color-sage)" }}
      />

      <header className="relative flex flex-col gap-2">
        {kindLabel ? (
          <span
            className="text-[0.65rem] font-medium uppercase tracking-[0.4em]"
            style={{ color: "var(--color-gold)" }}
          >
            {kindLabel}
          </span>
        ) : null}
        <h3
          className="font-serif text-2xl sm:text-3xl"
          style={{ color: "var(--color-charcoal)" }}
        >
          {link.label}
        </h3>
        <span
          aria-hidden
          className="block h-px w-10"
          style={{ backgroundColor: "var(--color-gold)", opacity: 0.55 }}
        />
      </header>

      {link.description ? (
        <p
          className="relative text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--color-sage-dark)" }}
        >
          {link.description}
        </p>
      ) : null}

      {link.details ? (
        <pre
          className="relative whitespace-pre-wrap rounded-xl px-4 py-3 font-sans text-sm leading-relaxed"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-sage) 18%, var(--color-cream))",
            border:
              "1px solid color-mix(in srgb, var(--color-sage) 50%, transparent)",
            color: "var(--color-charcoal)",
          }}
        >
          {link.details}
        </pre>
      ) : null}

      {link.url ? (
        <div className="relative mt-auto flex">
          <Button
            href={link.url}
            variant="secondary"
            size="sm"
            target="_blank"
            rel="noreferrer"
          >
            Visit registry
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export default RegistrySection;
