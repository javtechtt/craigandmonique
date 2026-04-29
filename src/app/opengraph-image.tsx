import { ImageResponse } from "next/og";
import { weddingConfig } from "@/data/wedding.config";
import { brand, getMonogram, loadGoogleFont } from "@/lib/brandImage";
import { formatWeddingDate } from "@/lib/formatDate";

export const alt = `${weddingConfig.couple.displayName} — Wedding`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Editorial save-the-date card rendered at request/build time.
 *
 * Layout mirrors the on-site hero: gold rule + "The wedding of",
 * large serif names with a gold ampersand, then the formatted date and
 * city beneath. Decorative corner blooms in soft sage match the home
 * page's blurred shapes.
 *
 * Everything is sourced from `wedding.config.ts` so any couple cloning
 * the template gets their own share image without component edits.
 */
export default async function OpengraphImage() {
  return renderShareCard();
}

async function renderShareCard() {
  const { couple, weddingDate, timezone, events } = weddingConfig;
  const { left, right } = getMonogram();

  const formattedDate = formatWeddingDate(weddingDate, { timezone });
  const venueCity = events[0]?.venue.city ?? null;
  const venueCountry = events[0]?.venue.country ?? null;
  const location = [venueCity, venueCountry].filter(Boolean).join(", ");

  const [cormorant500, cormorant600] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", 500).catch(() => null),
    loadGoogleFont("Cormorant Garamond", 600).catch(() => null),
  ]);

  const fonts: NonNullable<
    ConstructorParameters<typeof ImageResponse>[1]
  >["fonts"] = [];
  if (cormorant500) {
    fonts.push({
      name: "Cormorant",
      data: cormorant500,
      style: "normal",
      weight: 500,
    });
  }
  if (cormorant600) {
    fonts.push({
      name: "Cormorant",
      data: cormorant600,
      style: "normal",
      weight: 600,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${brand.cream} 0%, #ECE6DA 100%)`,
          fontFamily: cormorant500 ? "Cormorant" : "serif",
          color: brand.charcoal,
          position: "relative",
          padding: "80px 100px",
        }}
      >
        {/* Soft corner blooms */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -180,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: brand.sage,
            opacity: 0.45,
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -240,
            right: -160,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: brand.sageDark,
            opacity: 0.3,
            filter: "blur(100px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 220,
            right: 200,
            width: 160,
            height: 160,
            borderRadius: 9999,
            background: brand.gold,
            opacity: 0.25,
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            color: brand.gold,
            fontSize: 22,
            letterSpacing: 12,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
            fontWeight: 500,
          }}
        >
          <span style={{ display: "flex", width: 60, height: 1, background: brand.gold }} />
          <span style={{ display: "flex" }}>The wedding of</span>
          <span style={{ display: "flex", width: 60, height: 1, background: brand.gold }} />
        </div>

        {/* Names */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            marginTop: 36,
            fontSize: 168,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: -3,
            color: brand.charcoal,
          }}
        >
          <span style={{ display: "flex" }}>{couple.partnerOne.firstName}</span>
          <span
            style={{
              display: "flex",
              color: brand.gold,
              margin: "0 30px",
              fontSize: 140,
              transform: "translateY(-12px)",
            }}
          >
            &
          </span>
          <span style={{ display: "flex" }}>{couple.partnerTwo.firstName}</span>
        </div>

        {/* Monogram divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 36,
          }}
        >
          <span style={{ display: "flex", width: 80, height: 1, background: brand.gold, opacity: 0.6 }} />
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 9999,
              border: `1px solid ${brand.gold}`,
              color: brand.gold,
              fontSize: 14,
              letterSpacing: 1,
              fontWeight: 600,
            }}
          >
            {left}
            {right}
          </span>
          <span style={{ display: "flex", width: 80, height: 1, background: brand.gold, opacity: 0.6 }} />
        </div>

        {/* Date */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            color: brand.sageDark,
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
            fontWeight: 500,
          }}
        >
          {formattedDate}
        </div>

        {/* Location */}
        {location ? (
          <div
            style={{
              display: "flex",
              marginTop: 12,
              color: brand.sageDark,
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontFamily: "sans-serif",
              fontWeight: 400,
              opacity: 0.85,
            }}
          >
            {location}
          </div>
        ) : null}
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
