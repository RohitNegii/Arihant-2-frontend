"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import MouseFollower from "@/components/MouseFollower";
import Navbar from "@/components/sections/Navbar";

// Load 3D dynamic showroom canvas with SSR disabled
const ShowroomCanvas = dynamic(() => import("@/components/3d/ShowroomCanvas"), {
  ssr: false,
});

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [showEntranceCTA, setShowEntranceCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set delayed CTA reveal for the Entrance Hall
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEntranceCTA(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getScrollLimit = () => {
    if (typeof document === "undefined") return 1;
    return document.documentElement.scrollHeight - window.innerHeight || 1;
  };

  const progress = scrollY / getScrollLimit();
  
  // 13 scenes mapped evenly from 0.0 to 1.0
  const activeZone = Math.min(Math.floor(progress * 13), 12);

  const zones = [
    {
      title: "Entrance Hall",
      subtitle: "Jewelry Crafted Beyond Time",
      desc: "Welcome to VERDANT JEWELS. Explore our virtual showroom to discover the organic geometry of high craftsmanship.",
      cta: showEntranceCTA && (
        <div className="flex gap-4 pointer-events-auto">
          <a
            href="#explore"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: window.innerHeight * 1.5, behavior: "smooth" });
            }}
            className="gold-gradient-bg text-black px-6 py-2.5 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
          >
            Explore Exhibition <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ),
    },
    {
      title: "History Tunnel",
      subtitle: "The Archives of Creation",
      desc: "Hover pictures on the left wall to inspect heritage paper sketches, and frames on the right wall to see modern renders.",
    },
    {
      title: "Floating Gallery",
      subtitle: "Gemstone Levitations",
      desc: "Hover over the glass jewelry boxes floating in space. Watch the lids lift and gems slide upwards on organic rings.",
    },
    {
      title: "Diamond Laboratory",
      subtitle: "GIA Crystallization",
      desc: "Scroll to watch a raw carbon structure explode and rebuild into a faceted emerald gem. We guarantee Cut, Clarity, Color, and Carat purity.",
    },
    {
      title: "Craftsmanship Atelier",
      subtitle: "From fire to form",
      desc: "Scroll to watch raw gold casting melt, morph, and solidify into a mirror-polished luxury band.",
    },
    {
      title: "Signature Collections",
      subtitle: "Sown in Botany",
      desc: "Witness Rings, Necklaces, Bracelets, and Earrings floating on giant pedestals. Click pedestals to rotate them.",
    },
    {
      title: "Virtual Try-On Mirror",
      subtitle: "Interactive Reflexes",
      desc: "A floating physical mirror coordinates styling and contour wraps. Custom adjustments hug the skin like a second tissue.",
    },
    {
      title: "Atelier Museum",
      subtitle: "Best Sellers Selection",
      desc: "Hover over the museum display glass cubes to open them, floating the jewelry upwards and showing boutique prices.",
    },
    {
      title: "Voices of Elegance",
      subtitle: "Customer Testaments",
      desc: "Hover over the crystal bubbles floating around you to expand verified letters from art collectors and designers.",
    },
    {
      title: "Earth to Mine Sourcing",
      subtitle: "Botanical Integrity",
      desc: "We fly underground to Colomban veins. Emerald crystals and gold ores are extracted under conflict-free Kimberly promises.",
    },
    {
      title: "The Luxury Promise",
      subtitle: "Stone Pillars of Trust",
      desc: "Four stone columns light up, confirming Hallmarked Gold, GIA Certified Diamonds, Lifetime Warranty, and Insured Worldwide Shipping.",
    },
    {
      title: "Masterpiece Arena",
      subtitle: "The Crown Jewel",
      desc: "Enter a massive circular arena. The most detailed custom ring floats in golden stardust under spotlight matrices.",
    },
    {
      title: "Create Your Forever Story",
      subtitle: "VERDANT JEWELS",
      desc: "Begin your bespoke design consultation with our Milan master craftsmen today.",
      cta: (
        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto mt-4">
          <button className="gold-gradient-bg text-black px-8 py-3.5 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-lg">
            Explore Collection <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button className="glass-effect hover:bg-white/5 border border-verdant-emerald/20 text-[#5D7A68] px-8 py-3.5 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2">
            Book Appointment <Calendar className="w-3.5 h-3.5 text-verdant-gold" />
          </button>
        </div>
      ),
    },
  ];

  const currentZone = zones[activeZone] || zones[0];

  return (
    <div className="relative min-h-[1400vh] bg-transparent overflow-x-hidden select-none">
      <LoadingScreen />
      <MouseFollower />
      <Navbar />

      {/* FIXED 3D BACKGROUND CANVAS */}
      <ShowroomCanvas />

      {/* SCROLL TRANSITION CARD OVERLAYS */}
      <div className="fixed top-1/2 left-6 md:left-16 -translate-y-1/2 w-[90%] max-w-sm md:max-w-md z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 30, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-effect p-8 md:p-10 rounded-3xl border border-verdant-emerald/5 bg-[#F6F2EA]/65 shadow-lg text-left"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-verdant-gold/20 bg-verdant-gold/5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5D7A68] animate-pulse" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#5D7A68] font-semibold">
                {currentZone.title}
              </span>
            </div>

            {/* Subtitle / Big header */}
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight text-verdant-emerald font-light mb-4">
              {currentZone.subtitle}
            </h3>

            {/* Description */}
            <p className="text-verdant-emerald/70 text-xs md:text-sm font-light leading-relaxed tracking-wide mb-8">
              {currentZone.desc}
            </p>

            {/* CTA wrapper */}
            {currentZone.cta && currentZone.cta}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* PERSISTENT PROGRESS SCROLL INDICATOR */}
      <div className="fixed bottom-8 right-8 z-10 flex items-center gap-4 text-[9px] uppercase tracking-[0.25em] text-[#5D7A68]/60">
        <span>Exhibition Progress</span>
        <div className="w-32 h-[1px] bg-[#5D7A68]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-verdant-gold shadow-[0_0_8px_#C8A96A] transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-verdant-gold font-bold">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}
