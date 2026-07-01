"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Story", href: "#story" },
    { name: "Craftsmanship", href: "#craftsmanship" },
    { name: "Materials", href: "#materials" },
    { name: "Collection", href: "#collection" },
    { name: "Showcase", href: "#showcase" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "py-4 bg-[#0D0D0D]/85 backdrop-blur-xl border-b border-[#F5F0E8]/5 shadow-lg"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="hover-target flex flex-col items-start select-none">
            <span className="font-serif font-light text-xl tracking-[0.35em] text-[#F5F0E8] uppercase leading-none">
              A U R A
            </span>
            <span className="text-[6.5px] tracking-[0.25em] text-[#C7A66A] font-sans uppercase font-medium mt-1">
              HAUTE JOAILLERIE
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-9">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover-target text-[9px] tracking-[0.25em] uppercase text-[#F5F0E8]/85 hover:text-[#C7A66A] transition-colors duration-300 font-medium luxury-underline"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Call to Action Button */}
          <div className="hidden md:block">
            <a
              href="#appointment"
              className="hover-target shimmer-btn px-6 py-2.5 rounded-full text-[9px] tracking-[0.2em] uppercase hover:bg-[#F5F0E8]/5 transition-all duration-300 flex items-center gap-2 border border-[#F5F0E8]/10 hover:border-[#C7A66A]/40 text-[#F5F0E8] font-medium"
            >
              Book Appointment
              <ArrowRight className="w-3 h-3 text-[#C7A66A] transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover-target md:hidden text-[#F5F0E8]/85 hover:text-white transition-colors p-1"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 top-[70px] z-40 bg-[#0D0D0D]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-7 md:hidden border-t border-[#F5F0E8]/5"
          >
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-xs tracking-[0.25em] uppercase text-[#F5F0E8]/85 hover:text-[#C7A66A] transition-colors duration-300 font-semibold"
              >
                {item.name}
              </a>
            ))}
            <a
              href="#appointment"
              onClick={() => setIsOpen(false)}
              className="px-7 py-3.5 rounded-full text-[9px] tracking-[0.2em] uppercase bg-[#C7A66A] text-[#0D0D0D] font-bold shadow-lg flex items-center gap-2 mt-4"
            >
              Book Appointment
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
