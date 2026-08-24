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
 * The section index for the legal pages, on phones.
 *
 * The three policy pages each carry a `hidden lg:block` sidebar index, which
 * left a ~220-line document with no navigation at all below `lg` — you could
 * only scroll. This is the same list as a collapsed disclosure, so it costs
 * one row of vertical space until it is asked for. Desktop keeps the sidebar;
 * this is `lg:hidden`.
 */
export default function PolicyTOCMobile({
  sections,
  activeSection,
  onSelect,
}: PolicyTOCMobileProps) {
  const [open, setOpen] = useState(false);

  const current = sections.find((s) => s.id === activeSection);

  return (
    <div className="lg:hidden glass-card border border-verdant-emerald/10 rounded-2xl overflow-hidden mb-6 text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full min-h-11 px-5 py-3.5 flex items-center justify-between gap-3 cursor-pointer"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <List className="w-4 h-4 text-verdant-gold shrink-0" />
          <span className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald/60 shrink-0">
            Sections
          </span>
          {current && (
            <span className="text-xs text-verdant-emerald font-semibold truncate">
              &middot; {current.title.replace(/^\d+\.\s*/, "")}
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-verdant-emerald/10"
          >
            <div className="flex flex-col p-2">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    onSelect(sec.id);
                    setOpen(false);
                    document
                      .getElementById(sec.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`flex items-center gap-3 px-3 min-h-11 rounded-lg text-xs tracking-wider text-left transition-colors duration-200 cursor-pointer ${
                    activeSection === sec.id
                      ? "bg-verdant-emerald/10 text-verdant-emerald font-semibold border-l-2 border-verdant-gold"
                      : "text-verdant-emerald/65 hover:text-verdant-emerald hover:bg-verdant-emerald/5"
                  }`}
                >
                  <span className="shrink-0">{sec.icon}</span>
                  <span className="truncate">
                    {sec.title.replace(/^\d+\.\s*/, "")}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
