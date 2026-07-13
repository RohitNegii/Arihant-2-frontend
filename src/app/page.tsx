"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import MouseFollower from "@/components/MouseFollower";
import Navbar from "@/components/sections/Navbar";
import { scrollToOffset } from "@/store/scroll-store";
import { JEWELRY_IMAGES, type JewelryImage } from "@/content/jewelry";

interface Zone {
  title: string;
  subtitle: string;
  desc: string;
  cta?: React.ReactNode;
  /** Photography shown in the fixed side showcase while this zone is active. */
  image?: JewelryImage;
}

// Load 3D dynamic showroom canvas with SSR disabled
const ShowroomCanvas = dynamic(() => import("@/components/3d/ShowroomCanvas"), {
  ssr: false,
});

export default function Home() {
  const [activeZone, setActiveZone] = useState(0);
  const [showEntranceCTA, setShowEntranceCTA] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
      }
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.round(progress * 100)}%`;
      }

      setActiveZone(Math.min(Math.floor(progress * 13), 12));
    };
    handleScroll();
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

  // 13 scenes mapped evenly from 0.0 to 1.0
  const zones: Zone[] = [
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
              scrollToOffset(window.innerHeight * 1.5);
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
      desc: "Drift between gilded frames of our signature heirlooms — six handcrafted pieces photographed in the atelier, hanging along both gallery walls.",
    },
    {
      title: "Floating Gallery",
      subtitle: "Gemstone Levitations",
      desc: "Hover over the glass jewelry boxes floating in space. Watch the lids lift and gems slide upwards on organic rings.",
      image: JEWELRY_IMAGES.royalPeacock,
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
      image: JEWELRY_IMAGES.peacockHexagon,
    },
    {
      title: "Signature Collections",
      subtitle: "Sown in Botany",
      desc: "Witness Rings, Necklaces, Bracelets, and Earrings floating on giant pedestals. Click pedestals to rotate them.",
      image: JEWELRY_IMAGES.emeraldGoddess,
    },
    {
      title: "Virtual Try-On Mirror",
      subtitle: "Interactive Reflexes",
      desc: "The atelier mirror previews a styled look — jade medallions reflected back as if already worn.",
    },
    {
      title: "Atelier Museum",
      subtitle: "Best Sellers Selection",
      desc: "Hover over the museum display glass cubes to open them, floating the jewelry upwards and showing boutique prices.",
      image: JEWELRY_IMAGES.rubyChandbali,
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
      image: JEWELRY_IMAGES.turquoiseChandelier,
    },
    {
      title: "Create Your Forever Story",
      subtitle: "VERDANT JEWELS",
      desc: "Begin your bespoke design consultation with our Milan master craftsmen today.",
      cta: (
        <div className="pointer-events-auto mt-2">
          {/* Farewell strip of the collection */}
          <div className="flex gap-2.5 mb-6">
            {[
              JEWELRY_IMAGES.abaloneElephant,
              JEWELRY_IMAGES.jadeMedallion,
              JEWELRY_IMAGES.lapisBloom,
            ].map((img) => (
              <div
                key={img.src}
                className="relative flex-1 aspect-[4/5] rounded-xl overflow-hidden ring-1 ring-verdant-gold/40 shadow-md"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="10rem"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="gold-gradient-bg text-black px-8 py-3.5 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-lg">
              Explore Collection <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="glass-effect hover:bg-white/5 border border-verdant-emerald/20 text-[#5D7A68] px-8 py-3.5 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2">
              Book Appointment <Calendar className="w-3.5 h-3.5 text-verdant-gold" />
            </button>
          </div>
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

      {/* SCROLL TRANSITION CARD OVERLAYS — bottom sheet on mobile, left panel on desktop */}
      <div className="fixed z-10 pointer-events-none left-1/2 -translate-x-1/2 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] w-[calc(100%-2rem)] max-w-sm md:left-16 md:translate-x-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 30, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-effect-gold p-5 sm:p-8 md:p-10 rounded-3xl border border-verdant-gold/30 bg-gradient-to-br from-[#FAF4E6]/85 to-[#F1E6CC]/75 shadow-[0_8px_40px_rgba(200,169,106,0.18)] text-left"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-verdant-gold/40 bg-verdant-gold/10 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold animate-pulse" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#5D7A68] font-semibold">
                {currentZone.title}
              </span>
            </div>

            {/* Subtitle / Big header */}
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight text-verdant-emerald font-light mb-4">
              {currentZone.subtitle}
            </h3>

            {/* Description */}
            <p className="text-verdant-emerald/70 text-xs md:text-sm font-light leading-relaxed tracking-wide mb-5 md:mb-8">
              {currentZone.desc}
            </p>

            {/* CTA wrapper */}
            {currentZone.cta && currentZone.cta}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* SIDE JEWELRY SHOWCASE — real photography easing in beside the 3D scene */}
      <div className="hidden lg:block fixed right-10 xl:right-16 top-1/2 -translate-y-1/2 z-10 pointer-events-none w-60 xl:w-72">
        <AnimatePresence mode="wait">
          {currentZone.image && (
            <motion.div
              key={currentZone.image.src}
              initial={{ opacity: 0, x: 60, rotate: 3, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 60, rotate: -3, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-verdant-gold/40 shadow-[0_20px_60px_rgba(200,169,106,0.28)]">
                  <Image
                    src={currentZone.image.src}
                    alt={currentZone.image.alt}
                    fill
                    sizes="(min-width: 1280px) 18rem, 15rem"
                    className="object-cover"
                  />
                  {/* Soft gradient so the caption stays legible */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[8px] tracking-[0.3em] uppercase text-verdant-gold font-bold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5" /> Verdant Jewels
                    </p>
                    <p className="font-serif text-lg text-white leading-snug">
                      {currentZone.image.name}
                    </p>
                  </div>
                </div>
                {/* Gold corner accents */}
                <div className="absolute -top-3 -right-3 w-10 h-10 border-t-2 border-r-2 border-verdant-gold/70 rounded-tr-[1.75rem]" />
                <div className="absolute -bottom-3 -left-3 w-10 h-10 border-b-2 border-l-2 border-verdant-gold/70 rounded-bl-[1.75rem]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PERSISTENT PROGRESS SCROLL INDICATOR */}
      <div className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-8 md:right-8 z-10 flex items-center gap-3 md:gap-4 text-[9px] uppercase tracking-[0.25em] text-verdant-emerald/70">
        <span className="hidden sm:inline">Exhibition Progress</span>
        <div className="w-20 md:w-32 h-[1px] bg-[#5D7A68]/10 rounded-full overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-verdant-gold shadow-[0_0_8px_#C8A96A]"
            style={{ width: "0%" }}
          />
        </div>
        <span ref={progressTextRef} className="text-verdant-gold font-bold">
          0%
        </span>
      </div>
    </div>
  );
}
