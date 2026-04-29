import { weddingConfig } from "@/data/wedding.config";

/**
 * Shared helpers for the runtime-generated favicon and social images.
 *
 * The monogram + names + date are read from the wedding config so any
 * couple cloning this template gets their own brand assets without
 * touching component code.
 */

export const brand = {
  sage: weddingConfig.theme.colors.sage,
  sageDark: weddingConfig.theme.colors.sageDark,
  cream: weddingConfig.theme.colors.cream,
  gold: weddingConfig.theme.colors.gold,
  charcoal: weddingConfig.theme.colors.charcoal,
};

export function getMonogram(): { left: string; right: string } {
  return {
    left: weddingConfig.couple.partnerOne.firstName.charAt(0).toUpperCase(),
    right: weddingConfig.couple.partnerTwo.firstName.charAt(0).toUpperCase(),
  };
}

/**
 * Fetch a Google Font binary at build/request time so `ImageResponse`
 * can render with the site's serif. Accepts whichever format
 * fonts.googleapis.com returns (woff2, woff, or ttf) — satori reads
 * any of them.
 */
export async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
  ).then((r) => r.text());

  const match = css.match(
    /src:\s*url\((https:\/\/[^)]+\.(?:woff2|woff|ttf))\)/,
  );
  if (!match) {
    throw new Error(`Could not resolve font URL for ${family} (${weight})`);
  }
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(`Font fetch failed: ${fontRes.status}`);
  }
  return fontRes.arrayBuffer();
}
