"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { NAV_LINKS, NAV_CTA, zoneScrollTarget } from "@/content/navigation";
import { useScrollStore, scrollToOffset } from "@/store/scroll-store";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Drawer side effects: lock scrolling, close on Escape, close on resize
  // past the desktop breakpoint (so the drawer can't linger off-screen).
  useEffect(() => {
    if (!isOpen) return;

    const lenis = useScrollStore.getState().lenis;
    lenis?.stop();
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onDesktop = () => desktop.matches && setIsOpen(false);

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [isOpen]);

  const navigateToZone = useCallback((zone: number) => {
    setIsOpen(false);
    scrollToOffset(zoneScrollTarget(zone));
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 pt-[env(safe-area-inset-top)]">
      <motion.nav
        aria-label="Main"
        initial={prefersReducedMotion ? false : { y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full transition-all duration-500 ${
          isScrolled
            ? "py-3 md:py-4 bg-[#F8F2E2]/75 backdrop-blur-md border-b border-verdant-gold/25 shadow-[0_4px_24px_rgba(200,169,106,0.08)]"
            : "py-4 md:py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => navigateToZone(0)}
            className="hover-target flex items-center gap-2 min-h-11"
            aria-label="VERDANT JEWELS — back to entrance"
          >
            <span className="font-serif text-lg sm:text-xl tracking-[0.2em] font-light text-verdant-emerald">
              V E R D A N T
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(({ label, zone }) => (
              <button
                key={label}
                onClick={() => navigateToZone(zone)}
                className="hover-target text-xs tracking-[0.2em] uppercase text-verdant-emerald/70 hover:text-verdant-gold transition-colors duration-300 min-h-11"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Call to Action Button */}
          <div className="hidden md:block">
            <button
              onClick={() => navigateToZone(NAV_CTA.zone)}
              className="hover-target glass-effect-gold px-6 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase hover:bg-verdant-gold/10 transition-all duration-300 flex items-center gap-2 border border-verdant-gold/35 hover:border-verdant-gold/70 group text-verdant-emerald shadow-[0_2px_16px_rgba(200,169,106,0.12)]"
            >
              {NAV_CTA.label}
              <ArrowRight
                aria-hidden
                className="w-3.5 h-3.5 text-verdant-gold group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Mobile Menu Button — 44px+ touch target */}
          <button
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="hover-target md:hidden flex items-center justify-center w-11 h-11 -mr-2 text-verdant-emerald/80 hover:text-verdant-emerald transition-colors"
          >
            {isOpen ? (
              <X aria-hidden className="w-6 h-6" />
            ) : (
              <Menu aria-hidden className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-[calc(60px+env(safe-area-inset-top))] z-40 bg-[#F8F2E2]/95 backdrop-blur-lg flex flex-col items-center justify-center gap-6 md:hidden border-t border-verdant-gold/25 pb-[env(safe-area-inset-bottom)]"
          >
            {NAV_LINKS.map(({ label, zone }) => (
              <button
                key={label}
                onClick={() => navigateToZone(zone)}
                className="text-lg tracking-[0.2em] uppercase text-verdant-emerald/80 hover:text-verdant-gold transition-colors duration-300 py-2 min-h-11"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => navigateToZone(NAV_CTA.zone)}
              className="glass-effect-gold px-8 py-3 mt-2 rounded-full text-xs tracking-[0.15em] uppercase hover:bg-verdant-gold/10 flex items-center gap-2 border border-verdant-gold/35 text-verdant-emerald min-h-11 shadow-[0_2px_16px_rgba(200,169,106,0.12)]"
            >
              {NAV_CTA.label}
              <ArrowRight aria-hidden className="w-3.5 h-3.5 text-verdant-gold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
