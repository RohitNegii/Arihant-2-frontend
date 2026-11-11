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
  metadataBase: new URL("https://geetejviraasat.com"),
  title: {
    default: "GEETEJ VIRAASAT | Certified 92.5 Silver Jewellery",
    template: "%s | GEETEJ VIRAASAT",
  },
  description:
    "Discover certified 92.5 silver jewellery crafted with timeless elegance. Explore our immersive 3D showroom of 92.5 sterling silver rings, necklaces, earrings, and bespoke designs.",
  openGraph: {
    title: "GEETEJ VIRAASAT | Certified 92.5 Silver Jewellery",
    description:
      "Explore our immersive 3D showroom of certified 92.5 silver jewellery, from handcrafted rings and necklaces to earrings and bespoke designs.",
    type: "website",
    siteName: "GEETEJ VIRAASAT",
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "GEETEJ VIRAASAT | Certified 92.5 Silver Jewellery",
    description:
      "Explore our immersive 3D showroom of certified 92.5 silver jewellery, from handcrafted rings and necklaces to earrings and bespoke designs.",
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
      className={`${inter.variable} ${cormorant.variable} h-full antialiased font-sans`}
    >
      {/* Browser inspectors such as Locator can add head attributes before hydration. */}
      <head suppressHydrationWarning>
        <link rel="preload" href="/images/geetej-crest.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/necklace-muse.webp" as="image" type="image/webp" />
      </head>
      <body className="min-h-full flex flex-col bg-verdant-cream text-verdant-emerald">

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
