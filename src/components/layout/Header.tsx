import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";

interface HeaderProps {
  config: WeddingConfig;
}

/**
 * Top navigation. Reads names + nav items + CTA from `WeddingConfig` so the
 * same component renders for any couple.
 */
export function Header({ config }: HeaderProps) {
  const { couple, navigation, hero } = config;

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-cream) 92%, transparent)",
        borderColor: "color-mix(in srgb, var(--color-sage) 40%, transparent)",
      }}
    >
      <Container size="xl" className="flex items-center justify-between py-5">
        <Link
          href="/"
          aria-label={`${couple.displayName} — home`}
          className="inline-flex items-center font-serif text-2xl leading-none tracking-tight sm:text-3xl"
          style={{ color: "var(--color-charcoal)" }}
        >
          <span className="leading-none">
            {couple.partnerOne.firstName.charAt(0)}
          </span>
          <span
            className="mx-0.5 leading-none"
            style={{ color: "var(--color-gold)" }}
          >
            &
          </span>
          <span className="leading-none">
            {couple.partnerTwo.firstName.charAt(0)}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium uppercase tracking-[0.28em] transition-colors hover:text-[color:var(--color-gold)]"
              style={{ color: "var(--color-charcoal)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {hero.ctaLabel && hero.ctaHref ? (
          <div className="hidden md:block">
            <Button href={hero.ctaHref} size="sm" variant="secondary">
              {hero.ctaLabel}
            </Button>
          </div>
        ) : (
          <span className="hidden md:block" aria-hidden />
        )}

        <MobileNav brand={couple.displayName} items={navigation} />
      </Container>
    </header>
  );
}

export default Header;
