"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import CrestMark from "@/components/global/CrestMark";

const COLLECTIONS_LINKS = [
  { name: "All Collections", href: "/products" },
  { name: "Rings & Bands", href: "/products?category=rings" },
  { name: "Necklaces & Pendants", href: "/products?category=necklaces" },
  { name: "Bracelets & Bangles", href: "/products?category=braceletsbangles" },
  { name: "Chains & Links", href: "/products?category=chains" },
  { name: "Earrings & Studs", href: "/products?category=earrings" },
];

const CONCIERGE_LINKS = [
  { name: "Client Concierge", href: "/contact" },
  { name: "Track My Orders", href: "/orders" },
  { name: "Bespoke Commissions", href: "/contact" },
  { name: "Ring Sizing Calibration", href: "/products" },
  { name: "Care & Cleaning Advice", href: "/refund-policy#guarantees" },
];

const LEGAL_LINKS = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Refund & Return Policy", href: "/refund-policy" },
  { name: "Terms of Use", href: "/terms-of-use" },
  { name: "GIA Certification Protocol", href: "/privacy-policy#data-security" },
  { name: "Secure Armored Shipping", href: "/refund-policy#order-integrity" },
];

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#2A1621] via-[#24121C] to-[#1C0D15] text-[#FAF7F2] border-t border-verdant-gold/25 overflow-hidden select-none">
      {/* Ambient Atmospheric Luxury Glows */}
      <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] bg-radial from-verdant-gold/10 to-transparent blur-[140px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[35vw] h-[35vw] bg-radial from-verdant-emerald/20 to-transparent blur-[150px] pointer-events-none -z-0" />

      {/* MAIN FOOTER CONTENT DIRECTORY */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-8 md:pt-14 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">

          {/* Left Column: Brand Emblem & Details (5 cols) */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col items-start text-left space-y-5">
            {/* Brand Title Lockup */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <CrestMark size={24} />
                <span className="font-serif text-xl sm:text-2xl tracking-wider font-normal text-[#FAF7F2]">
                  GEETEJ VIRAASAT
                </span>
              </div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-verdant-gold font-bold font-mono">
                Fine Jewelry &bull; Est. 2001
              </p>
            </div>

            <p className="text-[#FAF7F2]/70 text-xs sm:text-[13px] font-light leading-relaxed max-w-md tracking-wide">
              Forging the boundary between organic botany and high-fashion aesthetics. Crafting timeless jewelry masterpieces with unyielding diamond purity and artisanal mastery.
            </p>

            {/* Concierge Quick Links */}
            <div className="flex flex-col gap-2 pt-1 text-xs text-[#FAF7F2]/75">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-verdant-gold hover:text-white transition-colors group"
              >
                <Mail className="w-3.5 h-3.5 text-verdant-gold" />
                <span>Contact Client Concierge</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <span className="text-[11px] text-[#FAF7F2]/50 font-mono">
                Mon &ndash; Sat &bull; 10:00 AM &ndash; 8:00 PM IST
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#FAF7F2]/50 font-bold">
                Follow Us:
              </span>
              {[
                {
                  name: "Instagram",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  ),
                  href: "#",
                },
                {
                  name: "Facebook",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                  href: "#",
                },
                {
                  name: "Twitter / X",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  ),
                  href: "#",
                },
              ].map((item, idx) => (
                <motion.a
                  key={idx}
                  href={item.href}
                  aria-label={item.name}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-verdant-gold hover:bg-verdant-gold/15 hover:text-verdant-gold text-[#FAF7F2]/70 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs"
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right Columns: Structured Navigation (7 cols) */}
          <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            {/* Column 1: Fine Collections */}
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-verdant-gold font-mono block">
                Collections
              </span>
              <ul className="space-y-2.5">
                {COLLECTIONS_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#FAF7F2]/70 hover:text-[#FAF7F2] hover:translate-x-1 inline-flex items-center transition-all duration-200 tracking-wide font-normal group"
                    >
                      <span>{link.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-verdant-gold ml-1 transition-all duration-200 text-xs">
                        &rsaquo;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Concierge & Client Care */}
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-verdant-gold font-mono block">
                Concierge
              </span>
              <ul className="space-y-2.5">
                {CONCIERGE_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#FAF7F2]/70 hover:text-[#FAF7F2] hover:translate-x-1 inline-flex items-center transition-all duration-200 tracking-wide font-normal group"
                    >
                      <span>{link.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-verdant-gold ml-1 transition-all duration-200 text-xs">
                        &rsaquo;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal Charter & Compliance */}
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-verdant-gold font-mono block">
                Legal Charter
              </span>
              <ul className="space-y-2.5">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#FAF7F2]/70 hover:text-[#FAF7F2] hover:translate-x-1 inline-flex items-center transition-all duration-200 tracking-wide font-normal group"
                    >
                      <span>{link.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-verdant-gold ml-1 transition-all duration-200 text-xs">
                        &rsaquo;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM COPYRIGHT & SECURITY STRIP */}
      <div className="relative z-10 border-t border-white/10 bg-black/30 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Copyright Notice */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[11px] text-[#FAF7F2]/50 font-normal">
            <span>&copy; {new Date().getFullYear()} GEETEJ VIRAASAT Fine Jewelry Inc.</span>
            <span className="hidden sm:inline text-verdant-gold/40">&bull;</span>
            <span className="flex items-center gap-1 text-verdant-gold/80">
              <Lock className="w-3 h-3 text-verdant-gold" /> 256-Bit SSL Encrypted
            </span>
          </div>

          {/* Motto Tagline */}
          <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-verdant-gold font-bold font-mono">
            Sown in Nature, Reaped in Elegance
          </span>

          {/* Developer Credit */}
          <a
            href="https://www.infiinofy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-[#FAF7F2]/40 hover:text-[#FAF7F2]/80 transition-colors duration-200"
          >
            <span>Engineered by</span>
            <span className="font-bold text-verdant-gold tracking-widest group-hover:underline underline-offset-4">
              INFIINOFY
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
