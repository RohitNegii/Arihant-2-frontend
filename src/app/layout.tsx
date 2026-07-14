import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import DevConsoleFilter from "@/components/DevConsoleFilter";
import AuthInitializer from "@/components/AuthInitializer";
import { Toaster } from "sonner";

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
  title: {
    default: "VERDANT JEWELS | Immersive Luxury Jewelry Showroom",
    template: "%s | VERDANT JEWELS",
  },
  description:
    "Experience timeless craftsmanship with modern elegance. Walk through our immersive 3D showroom of custom diamond rings, necklaces, and bespoke luxury jewelry.",
  openGraph: {
    title: "VERDANT JEWELS | Immersive Luxury Jewelry Showroom",
    description:
      "Walk through an immersive 3D showroom of custom diamond rings, necklaces, and bespoke luxury jewelry.",
    type: "website",
    siteName: "VERDANT JEWELS",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F4EA",
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
      <body className="min-h-full flex flex-col bg-luxury-black text-white">
        <DevConsoleFilter />
        <AuthInitializer />
        <Toaster position="top-right" richColors />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
