"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import MouseFollower from "@/components/MouseFollower";
import Navbar from "@/components/sections/Navbar";
import ShowroomCanvas from "@/components/3d/ShowroomCanvas";
import { useScroll } from "framer-motion";

export default function Home() {
  const [showEntranceCTA, setShowEntranceCTA] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEntranceCTA(true);
    }, 2000);
    
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

  const progress = scrollY / getScrollLimit();
  
  // 13 scenes mapped evenly from 0.0 to 1.0
  const activeZone = Math.min(Math.floor(progress * 13), 12);

  const scrollToZone = (index: number) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const targetScroll = (index / 12) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const zones = [
    {
      title: "Entrance Hall",
      subtitle: "Jewelry Crafted Beyond Time",
      desc: "Welcome to VERDANT JEWELS. Explore our virtual showroom to discover the organic geometry of high craftsmanship.",
      specs: [
        { key: "Scene Code", val: "ZN-100 (Entrance)" },
        { key: "Exhibiting", val: "3D Solitaire Diamond" },
        { key: "Refraction Index", val: "2.42 (Diamond Spec)" },
        { key: "Atmosphere", val: "Basalt Gallery" }
      ],
      cta: showEntranceCTA && (
        <div className="flex gap-4 pointer-events-auto">
          <a
            href="#explore"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: window.innerHeight * 1.5, behavior: "smooth" });
            }}
            className="gold-gradient-bg text-black px-5 py-2 rounded-full text-[9px] tracking-widest uppercase font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
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
      specs: [
        { key: "Timeline Era", val: "2001 - 2004" },
        { key: "Drafts Loaded", val: "4 Blueprint Frames" },
        { key: "Drawing Style", val: "CAD Grid Lines" },
        { key: "Authentication", val: "Gold Seal Certified" }
      ]
    },
    {
      title: "Floating Gallery",
      subtitle: "Gemstone Levitations",
      desc: "Hover over the glass jewelry boxes floating in space. Watch the lids lift and gems slide upwards on organic rings.",
      specs: [
        { key: "Z-Depth Axis", val: "-24.00 Units" },
        { key: "Float Speed", val: "0.25 Hz Sine Wave" },
        { key: "Lid Actuators", val: "Dynamic Hover Triggers" },
        { key: "Enclosure Type", val: "Glass Bevel Box" }
      ]
    },
    {
      title: "Diamond Laboratory",
      subtitle: "GIA Crystallization",
      desc: "Scroll to watch a raw carbon structure explode and rebuild into a faceted emerald gem. We guarantee Cut, Clarity, Color, and Carat purity.",
      specs: [
        { key: "Core Specimen", val: "Crystalline Carbon" },
        { key: "Dispersion Index", val: "0.044 (Very High)" },
        { key: "Explosion Physics", val: "3D Fragment Matrices" },
        { key: "Calibrated Facets", val: "58 Standard Facets" }
      ]
    },
    {
      title: "Craftsmanship Atelier",
      subtitle: "From fire to form",
      desc: "Scroll to watch raw gold casting melt, morph, and solidify into a mirror-polished luxury band.",
      specs: [
        { key: "Smelt Heat", val: "1064°C Thermal" },
        { key: "Metal Base", val: "18K Golden Casting" },
        { key: "Deformation Rate", val: "WebGL Morph Target" },
        { key: "Labor Duration", val: "140 Craft Hours" }
      ]
    },
    {
      title: "Signature Collections",
      subtitle: "Sown in Botany",
      desc: "Witness Rings, Necklaces, Bracelets, and Earrings floating on giant pedestals. Click pedestals to rotate them.",
      specs: [
        { key: "Collection Name", val: "Sown In Botany" },
        { key: "Models Loaded", val: "4 Organic Components" },
        { key: "Helix Helix", val: "Double-Helix Vine Link" },
        { key: "Gem Settings", val: "Leaf Prong Claws" }
      ]
    },
    {
      title: "Virtual Try-On Mirror",
      subtitle: "Interactive Reflexes",
      desc: "A floating physical mirror coordinates styling and contour wraps. Custom adjustments hug the skin like a second tissue.",
      specs: [
        { key: "Mirror Depth", val: "-72.00 Coordinates" },
        { key: "AR Projection", val: "Active Try-on Plane" },
        { key: "Skin Wrapping", val: "Contour Matrix Fit" },
        { key: "Reflection rate", val: "99% Refraction Clear" }
      ]
    },
    {
      title: "Atelier Museum",
      subtitle: "Best Sellers Selection",
      desc: "Hover over the museum display glass cubes to open them, floating the jewelry upwards and showing boutique prices.",
      specs: [
        { key: "Exhibitors Count", val: "4 Museum Glass Cubes" },
        { key: "Lid Clearance", val: "0.85m Float Height" },
        { key: "Average Price", val: "$9,225 USD Catalog" },
        { key: "Lighting Angle", val: "Top Dual Spot Matrix" }
      ]
    },
    {
      title: "Voices of Elegance",
      subtitle: "Customer Testaments",
      desc: "Hover over the crystal bubbles floating around you to expand verified letters from art collectors and designers.",
      specs: [
        { key: "Feedback Loop", val: "Voices of Elegance" },
        { key: "Container Class", val: "Floating Glass Bubbles" },
        { key: "Letter Registry", val: "Verified Blockchain" },
        { key: "Average Rating", val: "5.0 / 5.0 Standard" }
      ]
    },
    {
      title: "Earth to Mine Sourcing",
      subtitle: "Botanical Integrity",
      desc: "We fly underground to Colomban veins. Emerald crystals and gold ores are extracted under conflict-free Kimberly promises.",
      specs: [
        { key: "Mine Coordinates", val: "Muzo, Colombia Veins" },
        { key: "Kimberly Code", val: "KC-992 Regulatory" },
        { key: "Ecology Index", val: "Carbon Offset Sourced" },
        { key: "Refinement Rate", val: "99.8% Pure Emerald" }
      ]
    },
    {
      title: "The Luxury Promise",
      subtitle: "Stone Pillars of Trust",
      desc: "Four stone columns light up, confirming Hallmarked Gold, GIA Certified Diamonds, Lifetime Warranty, and Insured Worldwide Shipping.",
      specs: [
        { key: "Trust Columns", val: "4 Monolith Pillars" },
        { key: "Certificate", val: "GIA Lab Authenticated" },
        { key: "Warranty Scope", val: "Lifetime Atelier Cover" },
        { key: "Delivery Insured", val: "Brink's Worldwide Secure" }
      ]
    },
    {
      title: "Masterpiece Arena",
      subtitle: "The Crown Jewel",
      desc: "Enter a massive circular arena. The most detailed custom ring floats in golden stardust under spotlight matrices.",
      specs: [
        { key: "Exhibit Title", val: "Imperial Crown Ring" },
        { key: "Micro-pavé stones", val: "120 White Diamonds" },
        { key: "Spotlights", val: "6 Matrix Matrix Angles" },
        { key: "Particle Density", val: "400 Stardust Clones" }
      ]
    },
    {
      title: "Create Your Forever Story",
      subtitle: "VERDANT JEWELS",
      desc: "Begin your bespoke design consultation with our Milan master craftsmen today.",
      specs: [
        { key: "Atelier HQ", val: "Milan / Rajkot Hubs" },
        { key: "Concierge Contact", val: "concierge@aurum.art" },
        { key: "Response Target", val: "Within 12 Hours" },
        { key: "Draft Fee", val: "Complimentary Initial" }
      ],
      cta: (
        <div className="flex flex-col sm:flex-row gap-3 pointer-events-auto mt-4">
          <button className="gold-gradient-bg text-black px-5 py-2.5 rounded-full text-[9px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-lg">
            Explore Collection <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button className="glass-effect hover:bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-[9px] tracking-widest uppercase font-bold flex items-center justify-center gap-2">
            Book Appointment <Calendar className="w-3.5 h-3.5 text-[#ff5a1f]" />
          </button>
        </div>
      ),
    },
  ];

  const currentZone = zones[activeZone] || zones[0];

  return (
    <div className="relative min-h-[1400vh] bg-[#080808] overflow-x-hidden select-none">
      {/* FILM GRAIN OVERLAY */}
      <div className="grain-overlay" />

      {/* VERTICAL GRIDLINES */}
      <div className="fixed inset-0 pointer-events-none z-1 flex justify-between px-[6vw]">
        <div className="w-[1px] h-full bg-white/[0.03]" />
        <div className="w-[1px] h-full bg-white/[0.03] hidden md:block" />
        <div className="w-[1px] h-full bg-white/[0.03] hidden md:block" />
        <div className="w-[1px] h-full bg-white/[0.03]" />
      </div>

      <LoadingScreen />
      <MouseFollower />
      <Navbar />

      {/* SIDEBAR ROTATED TYPOGRAPHY */}
      <div className="fixed left-6 md:left-[4vw] top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[9px] uppercase tracking-[0.35em] text-white/25 select-none z-10 pointer-events-none hidden xl:block">
        AURUM ART ATELIER // EXHIBITION // BESPOKE COLLECTION 2026
      </div>

      {/* FIXED 3D BACKGROUND CANVAS */}
      <ShowroomCanvas />

      {/* LEFT SIDE SCROLL TRANSITION CARD OVERLAYS */}
      <div className="fixed top-1/2 left-6 md:left-24 -translate-y-1/2 w-[90%] max-w-xs md:max-w-[300px] z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: -100, y: 50, rotate: -8, scale: 0.85, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -80, y: -40, rotate: 6, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.8 }}
            className="glass-effect p-6 md:p-6 rounded-2xl border border-white/8 bg-[#151515]/75 shadow-lg text-left"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 mb-3">
              <span className="w-1 h-1 rounded-full bg-[#ff5a1f] animate-pulse" />
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#ff5a1f] font-bold font-serif">
                {currentZone.title}
              </span>
            </div>

            {/* Subtitle / Big header */}
            <h3 className="font-serif text-lg md:text-xl font-light tracking-wide capitalize mb-2 text-white">
              {currentZone.subtitle}
            </h3>

            {/* Description */}
            <p className="text-white/70 text-[10px] md:text-[11px] font-light leading-relaxed tracking-wide mb-5">
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
            className="glass-effect p-6 md:p-6 rounded-2xl border border-white/8 bg-[#151515]/75 shadow-lg text-left"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 mb-3">
              <span className="w-1 h-1 rounded-full bg-[#ff5a1f] animate-pulse" />
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#ff5a1f] font-bold font-serif">
                EXHIBIT SPECIFICATIONS
              </span>
            </div>

            {/* Subtitle / Big header */}
            <h3 className="font-serif text-lg md:text-xl font-light tracking-wide capitalize mb-4 text-white">
              Technical Data
            </h3>

            {/* Technical specs list matching left side design layout */}
            <div className="flex flex-col gap-2.5 font-mono text-[8px] text-white/85 tracking-wide mt-1">
              {currentZone.specs.map((sp, idx) => (
                <div key={idx} className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-white/40 uppercase tracking-wider">{sp.key}</span>
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
              <span className={`text-[8px] uppercase tracking-[0.2em] font-semibold text-white/80 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-350 pointer-events-none absolute right-6 whitespace-nowrap bg-[#151515]/95 border border-white/10 px-2 py-0.5 rounded-sm shadow-xs ${isActive ? "text-[#ff5a1f]" : ""}`}>
                {zone.title}
              </span>
              
              {/* Dynamic dot element */}
              <div className="w-4 h-4 flex items-center justify-center relative">
                {isActive ? (
                  <>
                    <motion.div
                      layoutId="activeDotOutline"
                      className="absolute inset-0 rounded-full border border-[#ff5a1f]/45"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f]" />
                  </>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors duration-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* PERSISTENT PROGRESS SCROLL INDICATOR */}
      <div className="fixed bottom-8 right-8 z-10 flex items-center gap-4 text-[9px] uppercase tracking-[0.25em] text-white/60">
        <span>Exhibition Progress</span>
        <div className="w-32 h-[1px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#ff5a1f] shadow-[0_0_8px_#ff5a1f] transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[#ff5a1f] font-bold">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}
