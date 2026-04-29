import { ImageResponse } from "next/og";
import { brand, getMonogram, loadGoogleFont } from "@/lib/brandImage";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Browser tab favicon — sage-dark roundel with cream serif monogram and a
 * tiny gold ampersand. Letters come from the couple's first names in
 * `wedding.config.ts`, so cloning the template re-monograms automatically.
 */
export default async function Icon() {
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
          alignItems: "center",
          justifyContent: "center",
          background: brand.sageDark,
          color: brand.cream,
          borderRadius: 14,
          fontFamily: cormorant ? "Cormorant" : "serif",
          fontSize: 38,
          fontWeight: 600,
          letterSpacing: -1,
          // Inner gold ring — drawn with box-shadow so satori renders it.
          boxShadow: `inset 0 0 0 1.5px ${brand.gold}`,
        }}
      >
        <span style={{ display: "flex" }}>{left}</span>
        <span
          style={{
            display: "flex",
            color: brand.gold,
            fontSize: 22,
            margin: "0 2px",
            transform: "translateY(-2px)",
          }}
        >
          &
        </span>
        <span style={{ display: "flex" }}>{right}</span>
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
