import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import ShowroomHost from "@/components/ShowroomHost";
import DevConsoleFilter from "@/components/DevConsoleFilter";
import AuthInitializer from "@/components/AuthInitializer";
import { Toaster } from "sonner";
import { PALETTES, DEFAULT_THEME, paletteCss } from "@/theme/palette";
import ThemeVars from "@/theme/ThemeVars";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://geetviraasat.com"),
  title: {
    default: "GEETEJ VIRAASAT | Immersive Luxury Jewelry Showroom",
    template: "%s | GEETEJ VIRAASAT",
  },
  description:
    "Experience timeless craftsmanship with modern elegance. Walk through our immersive 3D showroom of custom diamond rings, necklaces, and bespoke luxury jewelry.",
  openGraph: {
    title: "GEETEJ VIRAASAT | Immersive Luxury Jewelry Showroom",
    description:
      "Walk through an immersive 3D showroom of custom diamond rings, necklaces, and bespoke luxury jewelry.",
    type: "website",
    siteName: "GEETEJ VIRAASAT",
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "GEETEJ VIRAASAT | Immersive Luxury Jewelry Showroom",
    description:
      "Walk through an immersive 3D showroom of custom diamond rings, necklaces, and bespoke luxury jewelry.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: PALETTES[DEFAULT_THEME].uiShell,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased font-sans overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col bg-verdant-cream text-verdant-emerald overflow-x-hidden">

        <style href="palette" precedence="high">
          {paletteCss()}
        </style>
        <ThemeVars />
        <DevConsoleFilter />
        <AuthInitializer />
        <Toaster position="top-right" richColors />
        <SmoothScroll>
          <ShowroomHost />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
