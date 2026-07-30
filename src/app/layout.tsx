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
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF7F2",
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
      <body className="min-h-full flex flex-col bg-luxury-black text-white overflow-x-hidden">
        <DevConsoleFilter />
        <AuthInitializer />
        <Toaster position="top-right" richColors />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
