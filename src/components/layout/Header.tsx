import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

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
          className="font-serif text-lg tracking-[0.2em] sm:text-xl"
          style={{ color: "var(--color-charcoal)" }}
        >
          {couple.displayName}
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

        {/* Mobile-first: simple anchor list collapses below md.
            A proper drawer can replace this when we wire client interactivity. */}
        <Link
          href={navigation[0]?.href ?? "#"}
          className="text-xs font-medium uppercase tracking-[0.28em] md:hidden"
          style={{ color: "var(--color-charcoal)" }}
        >
          Menu
        </Link>
      </Container>
    </header>
  );
}

export default Header;
