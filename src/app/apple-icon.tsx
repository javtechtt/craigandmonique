import { ImageResponse } from "next/og";
import { brand, getMonogram, loadGoogleFont } from "@/lib/brandImage";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS / iPadOS home-screen icon. More breathing room than the favicon
 * to support the larger render size — adds a small "wedding" caption
 * under the monogram so the tile reads as a wedding bookmark, not a
 * generic app.
 */
export default async function AppleIcon() {
  const { left, right } = getMonogram();
  const cormorant = await loadGoogleFont("Cormorant Garamond", 600).catch(
    () => null,
  );

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
          background: brand.sageDark,
          color: brand.cream,
          borderRadius: 38,
          fontFamily: cormorant ? "Cormorant" : "serif",
          boxShadow: `inset 0 0 0 4px ${brand.gold}`,
          paddingTop: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 84,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          <span style={{ display: "flex" }}>{left}</span>
          <span
            style={{
              display: "flex",
              color: brand.gold,
              fontSize: 50,
              margin: "0 4px",
              transform: "translateY(-4px)",
            }}
          >
            &
          </span>
          <span style={{ display: "flex" }}>{right}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            color: brand.gold,
            fontSize: 12,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          <span style={{ display: "flex", width: 14, height: 1, background: brand.gold }} />
          <span style={{ display: "flex" }}>Wedding</span>
          <span style={{ display: "flex", width: 14, height: 1, background: brand.gold }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: cormorant
        ? [
            {
              name: "Cormorant",
              data: cormorant,
              style: "normal",
              weight: 600,
            },
          ]
        : undefined,
    },
  );
}
