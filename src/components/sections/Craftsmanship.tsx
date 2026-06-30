"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function Craftsmanship() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth springs for translation coordinates
  const yText = useSpring(useTransform(scrollYProgress, [0, 1], [50, -50]), { stiffness: 90, damping: 25 });
  const xTitle = useSpring(useTransform(scrollYProgress, [0, 1], [-60, 60]), { stiffness: 90, damping: 25 });
  const yGlow = useSpring(useTransform(scrollYProgress, [0, 1], [-100, 100]), { stiffness: 90, damping: 25 });

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] w-full flex items-center justify-center bg-transparent overflow-hidden py-24 md:py-32 border-t border-verdant-emerald/5"
    >
      {/* Shifting Gradient Backdrop with vertical parallax offset */}
      <div className="absolute inset-0 bg-transparent pointer-events-none" />
      <motion.div
        style={{ y: yGlow, animationDuration: '8s' }}
        className="absolute top-1/4 left-1/4 w-[75vw] h-[75vw] bg-radial from-verdant-gold/5 via-transparent to-transparent blur-[160px] pointer-events-none animate-pulse"
      />

      {/* Floating Laser-Thin Gold Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Horizontal Line 1 */}
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          className="absolute top-[25%] left-0 w-[50%] h-[1px] bg-gradient-to-r from-transparent via-verdant-gold/25 to-transparent"
        />
        {/* Horizontal Line 2 */}
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[35%] right-0 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-verdant-gold/20 to-transparent"
        />
        {/* Vertical Line 1 */}
        <motion.div
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-[15%] w-[1px] h-[50%] bg-gradient-to-b from-transparent via-verdant-gold/15 to-transparent"
        />
        {/* Vertical Line 2 */}
        <motion.div
          animate={{ y: ["100%", "-100%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-[20%] w-[1px] h-[40%] bg-gradient-to-b from-transparent via-verdant-gold/20 to-transparent"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-12 relative z-10">
        
        {/* Left Column - Large Typography (Horizontal Parallax) */}
        <motion.div style={{ x: xTitle }} className="lg:col-span-7 flex flex-col items-start">
          <div className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-4 font-light text-left">
            Artisanal Heritage
          </div>

          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[0.95] text-verdant-emerald font-light mb-8 text-left">
            The Physics of
            <br />
            <span className="gold-gradient-text font-serif italic">Bespoke Elegance</span>
          </h2>
        </motion.div>

        {/* Right Column - Sub-copy (Vertical Parallax) */}
        <motion.div style={{ y: yText }} className="lg:col-span-5 flex flex-col gap-6 lg:mt-16 text-left">
          <p className="text-verdant-emerald/80 text-sm md:text-base font-light leading-relaxed tracking-wide">
            Every piece engineered in our atelier is a delicate balance of physical chemistry and structural art. We forge gold and refine diamonds down to micro-millimeter alignment tolerances, ensuring each reflection is exactly as designed.
          </p>
          <p className="text-verdant-emerald/50 text-xs md:text-sm font-light leading-relaxed tracking-wide">
            Our master jewelers combine decades of hand-crafted technique with digital modeling instruments. The result is structural integrity that defies gravity, and facets that capture light rays with cinematic intensity.
          </p>
          
          <div className="w-full h-[1px] bg-verdant-emerald/5 my-4" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-verdant-gold/70 font-light">
            AURUM LABS // GENÈVE
          </span>
        </motion.div>
        
      </div>
    </section>
  );
}
