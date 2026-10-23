"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { List, ChevronDown } from "lucide-react";

export interface PolicySection {
  id: string;
  title: string;
  icon: ReactNode;
}

interface PolicyTOCMobileProps {
  sections: PolicySection[];
  activeSection: string;
  onSelect: (id: string) => void;
}

/**
 * Mobile Table of Contents for legal pages.
 * Displays a clean, compact accordion button on mobile that allows readers
 * to jump to any section without long scrolling.
 */
export default function PolicyTOCMobile({
  sections,
  activeSection,
  onSelect,
}: PolicyTOCMobileProps) {
  const [open, setOpen] = useState(false);

  const current = sections.find((s) => s.id === activeSection);

  return (
    <div className="lg:hidden bg-white border border-[#EAE2D8] rounded-xl shadow-2xs overflow-hidden mb-6 text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full min-h-11 px-4 py-3 flex items-center justify-between gap-3 cursor-pointer bg-white hover:bg-[#FAF8F5] transition-colors"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded-md bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center shrink-0">
            <List className="w-3.5 h-3.5 text-verdant-gold" />
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-verdant-emerald/60 shrink-0">
            Contents
          </span>
          {current && (
            <span className="text-xs text-verdant-emerald font-semibold truncate">
              &bull; {current.title.replace(/^\d+\.\s*/, "")}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden
          className={`w-4 h-4 text-verdant-emerald/50 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-[#EAE2D8]"
          >
            <div className="flex flex-col p-2 bg-[#FAF8F5]">
              {sections.map((sec, idx) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      onSelect(sec.id);
                      setOpen(false);
                      const el = document.getElementById(sec.id);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-wide text-left transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? "bg-verdant-emerald text-white font-semibold shadow-2xs"
                        : "text-verdant-emerald/75 hover:text-verdant-emerald hover:bg-white"
                    }`}
                  >
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? "bg-white/20 text-white" : "bg-verdant-emerald/5 text-verdant-emerald/60"
                    }`}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">
                      {sec.title.replace(/^\d+\.\s*/, "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
