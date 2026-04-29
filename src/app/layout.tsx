import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { weddingConfig } from "@/data/wedding.config";
import "./globals.css";

/* Elegant serif for headings, clean sans for body — see design direction.
 * Both are exposed as CSS variables and consumed by globals.css. */
const fontHeading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/* Metadata is sourced from the wedding config so each couple's site renders
 * the right title/description without touching components.
 *
 * The OG and Twitter image references are auto-injected by Next.js from
 * the `opengraph-image.tsx` / `twitter-image.tsx` files in this folder —
 * we only set the textual fields here. */
export const metadata: Metadata = {
  title: weddingConfig.seo.title,
  description: weddingConfig.seo.description,
  openGraph: {
    title: weddingConfig.seo.title,
    description: weddingConfig.seo.description,
    type: "website",
    siteName: weddingConfig.couple.displayName,
  },
  twitter: {
    card: "summary_large_image",
    title: weddingConfig.seo.title,
    description: weddingConfig.seo.description,
  },
};

export const viewport: Viewport = {
  themeColor: weddingConfig.seo.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontHeading.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
