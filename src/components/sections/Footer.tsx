"use client";

import { MapPin } from "lucide-react";

export default function Footer() {
  const boutiques = [
    { city: "Paris", address: "Place Vendôme 18" },
    { city: "Milan", address: "Via Montenapoleone 12" },
    { city: "New York", address: "Fifth Avenue 712" },
    { city: "Tokyo", address: "Ginza Chome 5-8" },
  ];

  return (
    <footer className="relative bg-[#F2EDE0] pt-20 pb-12 border-t border-verdant-gold/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col gap-16">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-4 flex flex-col items-start gap-6">
            <span className="font-serif text-xl tracking-[0.2em] font-light text-verdant-emerald">
              V E R D A N T
            </span>
            <p className="text-verdant-emerald/60 text-xs md:text-sm font-light leading-relaxed max-w-sm tracking-wide text-left">
              Forging the boundary between organic botany and high-fashion aesthetics. Crafting timeless jewelry masterpieces since 2001.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 items-center mt-2">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  ),
                  href: "#"
                },
                {
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                  href: "#"
                },
                {
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  ),
                  href: "#"
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="hover-target w-8 h-8 rounded-full bg-verdant-emerald/3 border border-verdant-emerald/5 hover:border-verdant-gold/50 hover:bg-verdant-gold/5 flex items-center justify-center text-verdant-emerald/60 hover:text-verdant-gold shadow-xs hover:shadow-[0_0_15px_rgba(200,169,106,0.2)] transition-all duration-300 cursor-pointer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Boutiques */}
          <div className="md:col-span-5 grid grid-cols-2 gap-6 text-left">
            {boutiques.map((b) => (
              <div key={b.city} className="flex flex-col gap-1.5">
                <span className="font-serif text-sm tracking-wide text-verdant-emerald font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-verdant-gold" />
                  {b.city}
                </span>
                <span className="text-[10px] tracking-[0.05em] text-verdant-emerald/50 font-light">
                  {b.address}
                </span>
              </div>
            ))}
          </div>

          {/* Legal / Pages */}
          <div className="md:col-span-3 grid grid-cols-2 gap-4 text-left">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] tracking-[0.2em] text-verdant-emerald/80 uppercase font-medium">
                Atelier
              </span>
              {["Collections", "Showcase", "Story"].map((p) => (
                <a
                  key={p}
                  href={`#${p.toLowerCase()}`}
                  className="hover-target text-[10px] tracking-[0.1em] text-verdant-emerald/50 hover:text-verdant-emerald transition-colors font-light"
                >
                  {p}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[10px] tracking-[0.2em] text-verdant-emerald/80 uppercase font-medium">
                Legal
              </span>
              {["Privacy Policy", "Terms of Use", "GIA Guarantee"].map((p) => (
                <a
                  key={p}
                  href="#"
                  className="hover-target text-[10px] tracking-[0.1em] text-verdant-emerald/50 hover:text-verdant-emerald transition-colors font-light"
                >
                  {p}
                </a>
              ))}
            </div>
          </div>
          
        </div>

        {/* Bottom Section */}
        <div className="border-t border-verdant-emerald/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] tracking-[0.15em] text-verdant-emerald/40 font-light uppercase">
            &copy; {new Date().getFullYear()} VERDANT JEWELS Boutique Inc. All rights reserved.
          </span>
          <span className="text-[10px] tracking-[0.25em] text-verdant-gold font-light uppercase">
            Sown in Nature, Reaped in Elegance
          </span>
        </div>
        
      </div>
    </footer>
  );
}
