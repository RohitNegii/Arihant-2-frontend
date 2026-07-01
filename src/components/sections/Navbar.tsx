"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
            ? "py-4 bg-[#FFF1E2]/85 backdrop-blur-md border-b border-[#C8A96A]/20"
            : "py-6 bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="hover-target flex items-center gap-2">
            <span className="font-serif font-light text-xl tracking-[0.25em] text-[#014421] uppercase">
              V E R D A N T
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {["Collections", "Showcase", "Story", "Aesthetics"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="hover-target text-[10px] tracking-[0.2em] uppercase text-[#014421]/80 hover:text-[#C8A96A] transition-colors duration-300 font-semibold"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Call to Action Button */}
          <div className="hidden md:block">
            <button className="hover-target glass-effect px-5 py-2 rounded-full text-[10px] tracking-[0.15em] uppercase hover:bg-white/5 transition-all duration-300 flex items-center gap-2 border border-[#C8A96A]/20 hover:border-[#C8A96A]/45 group text-white">
              Book Consultation
              <ArrowRight className="w-3.5 h-3.5 text-[#C8A96A] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover-target md:hidden text-[#014421]/80 hover:text-[#014421] transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-[70px] z-40 bg-[#FFF1E2]/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 md:hidden border-t border-[#C8A96A]/20"
          >
            {["Collections", "Showcase", "Story", "Aesthetics"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className="text-sm tracking-[0.2em] uppercase text-[#014421]/80 hover:text-[#C8A96A] transition-colors duration-300 font-semibold"
              >
                {link}
              </a>
            ))}
            <button
              onClick={() => setIsOpen(false)}
              className="glass-effect px-8 py-3 rounded-full text-[10px] tracking-[0.15em] uppercase hover:bg-white/5 flex items-center gap-2 border border-[#C8A96A]/20 text-white"
            >
              Book Consultation
              <ArrowRight className="w-3.5 h-3.5 text-[#C8A96A]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
