"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  return (
    <footer
      className="relative bg-verdant-cream pt-6 pb-4 md:pt-14 md:pb-7 border-t border-verdant-gold/20 overflow-hidden select-none"
    >
      {/* Luxury Background Watermark */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=80"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center opacity-25"
        />
        {/* Soft, semi-transparent gradient overlays to showcase the image watermark clearly */}
        <div className="absolute inset-0 bg-gradient-to-b from-verdant-cream/10 via-verdant-cream/60 to-verdant-cream" />
      </div>

      {/* Decorative Glows */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[35vw] h-[35vw] bg-radial from-verdant-gold/8 to-transparent blur-[120px] pointer-events-none z-0"
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[35vw] h-[35vw] bg-radial from-verdant-emerald/6 to-transparent blur-[120px] pointer-events-none z-0"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col gap-5 md:gap-8">
        {/* Top Section with Staggered Viewport Entrance */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8"
        >
          {/* Brand Info Column */}
          <motion.div variants={itemVariants} className="md:col-span-7 flex flex-col items-start gap-3 md:gap-6">
            <span className="font-serif text-xl tracking-wide font-light text-verdant-emerald">
              GEETEJVIRAASAT
            </span>
            <p className="text-verdant-emerald/60 text-[13px] md:text-[15px] font-normal leading-snug md:leading-relaxed max-w-md tracking-wide text-left">
              Forging the boundary between organic botany and high-fashion aesthetics. Crafting timeless jewelry masterpieces since 2001.
            </p>
            {/* Social Links with Bounce Animations */}
            <div className="flex gap-3 md:gap-4 items-center mt-1 md:mt-2">
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
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ scale: 1.12, y: -3, rotate: 4 }}
                  whileTap={{ scale: 0.95 }}
                  className="hover-target w-7 h-7 md:w-8 md:h-8 rounded-full bg-verdant-emerald/5 border border-verdant-emerald/10 hover:border-verdant-gold/50 hover:bg-verdant-gold/5 flex items-center justify-center text-verdant-emerald/60 hover:text-verdant-gold shadow-2xs transition-all duration-300 cursor-pointer"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Legal / Pages Column */}
          <motion.div variants={itemVariants} className="md:col-span-5 grid grid-cols-2 gap-4 text-left">
            <div className="flex flex-col gap-1.5 md:gap-3">
              <span className="text-xs md:text-sm tracking-[0.25em] text-verdant-emerald/90 uppercase font-bold">
                Atelier
              </span>
              <Link
                href="/products"
                className="hover-target text-xs md:text-sm tracking-[0.12em] text-verdant-emerald/60 hover:text-verdant-emerald transition-colors font-medium relative group w-fit py-0 md:py-1"
              >
                Collections
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-verdant-gold group-hover:w-full transition-all duration-300 ease-out" />
              </Link>
              <Link
                href="/contact"
                className="hover-target text-xs md:text-sm tracking-[0.12em] text-verdant-emerald/60 hover:text-verdant-emerald transition-colors font-medium relative group w-fit py-0 md:py-1"
              >
                Contact Us
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-verdant-gold group-hover:w-full transition-all duration-300 ease-out" />
              </Link>
            </div>
            <div className="flex flex-col gap-1.5 md:gap-3">
              <span className="text-xs md:text-sm tracking-[0.25em] text-verdant-emerald/90 uppercase font-bold">
                Legal
              </span>
              {[
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms of Use", href: "/terms-of-use" },
                { name: "Refund Policy", href: "/refund-policy" },
              ].map((p) => (
                <Link
                  key={p.name}
                  href={p.href}
                  className="hover-target text-xs md:text-sm tracking-[0.12em] text-verdant-emerald/60 hover:text-verdant-emerald transition-colors font-medium relative group w-fit py-0 md:py-1"
                >
                  {p.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-verdant-gold group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <div className="border-t border-verdant-emerald/5 pt-4 md:pt-6 flex flex-col gap-2 md:gap-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3 text-center md:text-left">
            <span className="text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] text-verdant-emerald/50 font-medium uppercase">
              &copy; {new Date().getFullYear()} GEETEJVIRAASAT Boutique Inc. All rights reserved.
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.25em] text-verdant-gold font-semibold uppercase">
              Sown in Nature, Reaped in Elegance
            </span>
          </div>

          <a
            href="https://www.infiinofy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-target group mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-verdant-emerald/40 hover:text-verdant-emerald/70 transition-colors duration-300"
          >
            <span className="hidden sm:block h-px w-6 bg-verdant-emerald/15 group-hover:bg-verdant-gold/40 transition-colors duration-300" />
            <span>Designed &amp; developed by</span>
            <span className="font-bold tracking-[0.25em] text-verdant-emerald/65 group-hover:text-verdant-gold transition-colors duration-300">
              INFIINOFY
            </span>
            <span className="hidden sm:block h-px w-6 bg-verdant-emerald/15 group-hover:bg-verdant-gold/40 transition-colors duration-300" />
          </a>
        </div>
      </div>
    </footer>
  );
}
