"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import MouseFollower from "@/components/MouseFollower";
import Navbar from "@/components/sections/Navbar";
import ShowroomCanvas from "@/components/3d/ShowroomCanvas";

export default function Home() {
  const [showEntranceCTA, setShowEntranceCTA] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEntranceCTA(true);
    }, 1500);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Set initial scroll value
    setScrollY(window.scrollY);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getScrollLimit = () => {
    if (typeof document === "undefined") return 1;
    return document.documentElement.scrollHeight - window.innerHeight || 1;
  };

  const progress = Math.min(Math.max(scrollY / getScrollLimit(), 0), 1);
  
  // 11 rooms mapped evenly from 0.0 to 1.0
  const activeZone = Math.min(Math.floor(progress * 11), 10);

  const scrollToZone = (index: number) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const targetScroll = (index / 10) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const zones = [
    {
      title: "Outside Boutique",
      subtitle: "The Grand Portal",
      desc: "Welcome to VERDANT. Stand before the architectural gateway of our luxury house. The air is still, the lighting warm. Scroll to open the entrance.",
      specs: [
        { key: "Door Height", val: "4.5 Meters" },
        { key: "Wall Finish", val: "Limestone Stone" },
        { key: "Ambient Temp", val: "21°C Controlled" },
        { key: "Access Status", val: "Authorized Guests" }
      ],
      cta: showEntranceCTA && (
        <div className="flex gap-4 pointer-events-auto mt-2">
          <a
            href="#explore"
            onClick={(e) => {
              e.preventDefault();
              const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
              window.scrollTo({ top: maxScroll * 0.15, behavior: "smooth" });
            }}
            className="gold-gradient-bg text-black px-5 py-2 rounded-full text-[9px] tracking-widest uppercase font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform duration-300"
          >
            Request Entrance <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ),
    },
    {
      title: "Entrance Vestibule",
      subtitle: "Opening the Threshold",
      desc: "As you start scrolling, the massive emerald double doors slowly swing open. Feel the soft glow welcoming you inside.",
      specs: [
        { key: "Door Angle", val: "90° Swing" },
        { key: "Ceiling Structure", val: "Vaulted Archway" },
        { key: "Material", val: "Satin Lacquered Wood" },
        { key: "Entry Mode", val: "Automatic Sensor" }
      ]
    },
    {
      title: "Reception Gallery",
      subtitle: "The Archives of Creation",
      desc: "Explore our history. Hand-drawn designer blueprints on cream cotton paper document the botanical genesis of our collection.",
      specs: [
        { key: "Timeline Era", val: "2001 - Present" },
        { key: "Exhibits Loaded", val: "4 Framed Sketches" },
        { key: "Ink Style", val: "Fine Sepia Ink" },
        { key: "Trim Detail", val: "Warm Gold Foil" }
      ]
    },
    {
      title: "Exhibition Hall",
      subtitle: "A Masterpiece in Solitude",
      desc: "Step forward into the main circular hall. Positioned under a precise spotlight, our signature Solitaire Diamond Ring floats with slow confidence.",
      specs: [
        { key: "Carat Weight", val: "4.02 Carats" },
        { key: "Clarity Rating", val: "FL (Flawless)" },
        { key: "Refraction Index", val: "2.42 GIA Certified" },
        { key: "Exhibit Mount", val: "Nero Marquina Marble" }
      ]
    },
    {
      title: "Floating Gallery",
      subtitle: "Ethereal Suspensions",
      desc: "Observe our botanical bracelets floating inside lead glass display boxes. Hovering over a box lifts its lid for a closer look.",
      specs: [
        { key: "Metal Base", val: "18K Brushed Gold" },
        { key: "Gem Setting", val: "Vine Prong Mounts" },
        { key: "Float Mechanism", val: "Linear Magnetics" },
        { key: "Glass Thickness", val: "8mm Polished Bevel" }
      ]
    },
    {
      title: "Earring Showcase Room",
      subtitle: "Delicate Cascades",
      desc: "Orbit around the hero display cases. Each showcase holds matched pairs of botanical drop earrings tipped with Muzo emeralds.",
      specs: [
        { key: "Emerald Purity", val: "99.8% Muzo Green" },
        { key: "Symmetry Match", val: "Perfect Twin Pair" },
        { key: "Dolly Angle", val: "45° Orbit Sweep" },
        { key: "Accents", val: "Micro-pavé Diamonds" }
      ]
    },
    {
      title: "Necklace Exhibition",
      subtitle: "The Imperial Collar",
      desc: "Pass between elegant, heavy satin curtains. In the alcove, an extraordinary double-helix diamond necklace rests on a dark velvet bust.",
      specs: [
        { key: "Fabric Weight", val: "320gsm Silk Satin" },
        { key: "Necklace Length", val: "42cm Choker Loop" },
        { key: "Pendant Gem", val: "12-Carat Pear Cut" },
        { key: "Security", val: "Laser Grid Monitored" }
      ]
    },
    {
      title: "Craftsmanship Studio",
      subtitle: "From Fire to Form",
      desc: "Peer onto the jeweler's table. Watch raw 18K gold cast melt, smelt, and solidify into a mirror-polished wedding ring.",
      specs: [
        { key: "Smelt Heat", val: "1064°C Thermal" },
        { key: "Smelt Base", val: "18K Golden Casting" },
        { key: "Morph State", val: "WebGL Morph Vector" },
        { key: "Labor Duration", val: "140 Craft Hours" }
      ]
    },
    {
      title: "Premium Room",
      subtitle: "Sown in Botany Series",
      desc: "Behold the full signature line. High pillars of rich green serpentinite marble showcase botanical rings, bracelets, and earrings.",
      specs: [
        { key: "Column Stone", val: "Verde Alpi Marble" },
        { key: "Collection Size", val: "4 Core Pieces" },
        { key: "Gold Finish", val: "Satin Brushed Gold" },
        { key: "Atmosphere", val: "Volumetric Light Shafts" }
      ]
    },
    {
      title: "VIP Private Showroom",
      subtitle: "Bespoke Reflection",
      desc: "Step into the private styling room. Stand before our custom luxury mirror, projecting clear real-time reflections of your silhouette.",
      specs: [
        { key: "Mirror Depth", val: "-62.00 Units" },
        { key: "Reflection Rate", val: "99.5% Silver Nitrate" },
        { key: "Enclosure Bezel", val: "Brushed Champagne Gold" },
        { key: "Lighting", val: "Halo Diffused LED" }
      ]
    },
    {
      title: "Checkout Lounge",
      subtitle: "Secure Your Masterpiece",
      desc: "Rest in the final checkout lounge. Purchase your selected item securely, or reserve a private concierge consultation in Milan.",
      specs: [
        { key: "Bespoke Fee", val: "Complimentary Initial" },
        { key: "Secure Transit", val: "Brink's Insured Delivery" },
        { key: "Response Target", val: "Within 12 Hours" },
        { key: "Concierge Email", val: "concierge@verdant.art" }
      ],
      cta: (
        <div className="flex flex-col sm:flex-row gap-3 pointer-events-auto mt-4">
          <button className="gold-gradient-bg text-black px-5 py-2.5 rounded-full text-[9px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform duration-300">
            Acquire Masterpiece <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button className="glass-effect-gold text-[#014421] px-5 py-2.5 rounded-full text-[9px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 border border-[#C8A96A]/60 hover:bg-[#FFF1E2]/30 transition-all duration-300">
            Book VIP Appointment <Calendar className="w-3.5 h-3.5 text-[#014421]" />
          </button>
        </div>
      ),
    },
  ];

  const currentZone = zones[activeZone] || zones[0];

  return (
    <div className="relative min-h-[1200vh] bg-[#FFF1E2] overflow-x-hidden select-none">
      {/* FILM GRAIN OVERLAY */}
      <div className="grain-overlay" />

      {/* VERTICAL GRIDLINES */}
      <div className="fixed inset-0 pointer-events-none z-1 flex justify-between px-[6vw]">
        <div className="w-[1px] h-full bg-[#014421]/[0.03]" />
        <div className="w-[1px] h-full bg-[#014421]/[0.03] hidden md:block" />
        <div className="w-[1px] h-full bg-[#014421]/[0.03] hidden md:block" />
        <div className="w-[1px] h-full bg-[#014421]/[0.03]" />
      </div>

      <LoadingScreen />
      <MouseFollower />
      <Navbar />

      {/* SIDEBAR ROTATED TYPOGRAPHY */}
      <div className="fixed left-6 md:left-[4vw] top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[9px] uppercase tracking-[0.35em] text-[#014421]/25 select-none z-10 pointer-events-none hidden xl:block">
        VERDANT LUXURY JEWELRY HOUSE // MILAN HQ // COLLECTION 2026
      </div>

      {/* FIXED 3D BACKGROUND CANVAS */}
      <ShowroomCanvas />

      {/* LEFT SIDE SCROLL TRANSITION CARD OVERLAYS */}
      <div className="fixed top-1/2 left-6 md:left-24 -translate-y-1/2 w-[90%] max-w-xs md:max-w-[320px] z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: -100, y: 50, rotate: -8, scale: 0.85, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -80, y: -40, rotate: 6, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.8 }}
            className="glass-effect p-6 md:p-7 rounded-2xl border border-[#C8A96A]/30 text-left"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#C8A96A]/20 bg-[#FFF1E2]/5 mb-3">
              <span className="w-1 h-1 rounded-full bg-[#C8A96A] animate-pulse" />
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#C8A96A] font-bold font-serif">
                {currentZone.title}
              </span>
            </div>

            {/* Subtitle / Big header */}
            <h3 className="font-serif text-lg md:text-xl font-light tracking-wide capitalize mb-2 text-white">
              {currentZone.subtitle}
            </h3>

            {/* Description */}
            <p className="text-white/80 text-[10px] md:text-[11px] font-light leading-relaxed tracking-wide mb-5">
              {currentZone.desc}
            </p>

            {/* CTA wrapper */}
            {currentZone.cta && currentZone.cta}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT SIDE SCROLL TRANSITION CARD OVERLAYS */}
      <div className="fixed top-1/2 right-6 md:right-28 -translate-y-1/2 w-[90%] max-w-xs md:max-w-[300px] z-10 pointer-events-none hidden lg:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: 100, y: 50, rotate: 8, scale: 0.85, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 80, y: -40, rotate: -6, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.8 }}
            className="glass-effect p-6 md:p-7 rounded-2xl border border-[#C8A96A]/30 text-left"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#C8A96A]/20 bg-[#FFF1E2]/5 mb-3">
              <span className="w-1 h-1 rounded-full bg-[#C8A96A] animate-pulse" />
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#C8A96A] font-bold font-serif">
                MUSEUM ARCHIVES
              </span>
            </div>

            {/* Subtitle / Big header */}
            <h3 className="font-serif text-lg md:text-xl font-light tracking-wide capitalize mb-4 text-white">
              Specifications
            </h3>

            {/* Technical specs list matching left side design layout */}
            <div className="flex flex-col gap-2.5 font-mono text-[8px] text-white/90 tracking-wide mt-1">
              {currentZone.specs.map((sp, idx) => (
                <div key={idx} className="flex justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
                  <span className="text-white/50 uppercase tracking-wider">{sp.key}</span>
                  <span className="text-white font-semibold text-right">{sp.val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* INTERACTIVE VERTICAL DOT NAVIGATION */}
      <div className="fixed right-6 md:right-[72px] top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3.5 items-end hidden md:flex">
        {zones.map((zone, idx) => {
          const isActive = idx === activeZone;
          return (
            <button
              key={idx}
              onClick={() => scrollToZone(idx)}
              className="group flex items-center gap-3 focus:outline-hidden cursor-pointer relative"
              aria-label={`Go to ${zone.title}`}
            >
              {/* Zone title tooltip shown on hover */}
              <span className={`text-[8px] uppercase tracking-[0.2em] font-semibold text-[#014421] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-350 pointer-events-none absolute right-6 whitespace-nowrap bg-[#FFF1E2] border border-[#C8A96A]/30 px-2 py-0.5 rounded-sm shadow-xs ${isActive ? "text-[#C8A96A] font-bold" : ""}`}>
                {zone.title}
              </span>
              
              {/* Dynamic dot element */}
              <div className="w-4 h-4 flex items-center justify-center relative">
                {isActive ? (
                  <>
                    <motion.div
                      layoutId="activeDotOutline"
                      className="absolute inset-0 rounded-full border border-[#C8A96A]/50"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A]" />
                  </>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-[#014421]/20 group-hover:bg-[#014421]/70 transition-colors duration-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* PERSISTENT PROGRESS SCROLL INDICATOR */}
      <div className="fixed bottom-8 right-8 z-10 flex items-center gap-4 text-[9px] uppercase tracking-[0.25em] text-[#014421]/60">
        <span>Boutique Journey</span>
        <div className="w-32 h-[1px] bg-[#014421]/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C8A96A] shadow-[0_0_8px_#C8A96A] transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[#C8A96A] font-bold">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}
