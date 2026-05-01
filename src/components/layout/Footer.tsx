import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { SingleStem } from "@/components/ui/LeafSprig";
import { formatWeddingDate } from "@/lib/formatDate";

interface FooterProps {
  config: WeddingConfig;
}

export function Footer({ config }: FooterProps) {
  const { couple, weddingDate, timezone, footer } = config;
  const formatted = formatWeddingDate(weddingDate, { timezone });
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-24"
      style={{
        backgroundColor: "var(--color-sage-dark)",
        color: "var(--color-cream)",
      }}
    >
      <Container size="xl" className="flex flex-col gap-10 py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <SingleStem className="mb-1 w-10 sm:w-12" color="#f5f1ea" />
          <p
            className="text-xs uppercase tracking-[0.4em]"
            style={{ color: "var(--color-gold)" }}
          >
            {footer.tagline ?? "Save the date"}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl">{couple.displayName}</h2>
          <p className="text-sm tracking-[0.2em] opacity-80">{formatted}</p>
          {couple.hashtag ? (
            <p className="text-xs uppercase tracking-[0.32em] opacity-70">
              {couple.hashtag}
            </p>
          ) : null}
        </div>

        {footer.socials && footer.socials.length > 0 ? (
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {footer.socials.map((social) => (
              <li key={social.url}>
                <Link
                  href={social.url}
                  className="text-xs uppercase tracking-[0.28em] underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className="flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs uppercase tracking-[0.28em] sm:flex-row"
          style={{
            borderColor: "color-mix(in srgb, var(--color-cream) 25%, transparent)",
          }}
        >
          <span className="inline-flex items-center gap-2 opacity-70">
            <span>&copy; {year}</span>
            <span className="inline-flex items-center font-serif text-base normal-case tracking-tight">
              <span className="leading-none">
                {couple.partnerOne.firstName.charAt(0)}
              </span>
              <span
                className="mx-0.5 leading-none"
                style={{ color: "#b8975a" }}
              >
                &
              </span>
              <span className="leading-none">
                {couple.partnerTwo.firstName.charAt(0)}
              </span>
            </span>
          </span>
          {footer.credit ? <span className="opacity-70">{footer.credit}</span> : null}
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
