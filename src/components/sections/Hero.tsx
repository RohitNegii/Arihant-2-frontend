"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

function MagneticButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className: string;
  href: string;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.35, y: y * 0.35 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.a
      href={href}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.a>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-transparent overflow-hidden pt-20 md:pt-0">
      
      {/* Background Soft Glows */}
      <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] bg-radial from-[#0F4C3A]/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-radial from-[#C8A96A]/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Abstract Green Silk Waves (Morphing SVG Path) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 -z-10">
        <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none" preserveAspectRatio="none">
          <motion.path
            animate={{
              d: [
                "M0,300 C300,200 600,400 900,250 C1200,100 1350,350 1440,300 L1440,800 L0,800 Z",
                "M0,320 C320,240 580,360 880,280 C1180,200 1380,320 1440,340 L1440,800 L0,800 Z",
                "M0,300 C300,200 600,400 900,250 C1200,100 1350,350 1440,300 L1440,800 L0,800 Z"
              ]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            fill="url(#emerald-wave-grad)"
          />
          <defs>
            <linearGradient id="emerald-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F4C3A" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#C8A96A" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.15" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 relative z-10">
        
        {/* Left Column: Premium Headline Copy */}
        <div className="flex flex-col items-start text-left order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-verdant-gold/20 bg-verdant-gold/5 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-verdant-emerald animate-pulse" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-verdant-emerald font-light">
              Bespoke Nature Collection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.0] text-verdant-emerald mb-6 font-light"
          >
            Jewelry Crafted
            <br />
            To Tell Your{" "}
            <span className="gold-gradient-text font-serif italic font-light">Story</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
            className="text-verdant-emerald/70 text-sm md:text-base max-w-md font-light leading-relaxed mb-10 tracking-[0.03em]"
          >
            Discover jewelry that tells your story. Our bespoke creations redefine the boundary between luxury fashion and high art.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-20"
          >
            <MagneticButton
              href="#collections"
              className="hover-target gold-gradient-bg text-[#FAF7F2] font-semibold text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200,169,6,0.15)] hover:shadow-[0_0_30px_rgba(200,169,106,0.35)] transition-all duration-300"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 text-[#FAF7F2]" />
            </MagneticButton>
            <MagneticButton
              href="#story"
              className="hover-target glass-effect hover:bg-verdant-emerald/5 border border-verdant-emerald/10 hover:border-verdant-gold/50 text-verdant-emerald font-medium text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 bg-white/10"
            >
              Book Consultation
              <Calendar className="w-4 h-4 text-verdant-gold" />
            </MagneticButton>
          </motion.div>
        </div>

        {/* Right Column: Empty placeholder to let background canvas show through */}
        <div className="w-full order-1 lg:order-2 h-[400px] md:h-[500px] lg:h-[600px] relative pointer-events-none" />
        
      </div>

      {/* Scroll indicator at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-verdant-emerald/50">
        <span>Scroll to Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-1.5 h-1.5 rounded-full bg-verdant-gold"
        />
      </div>
    </section>
  );
}
