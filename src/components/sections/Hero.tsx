"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            triggerBlast();
            return 100;
          }
          return prev + 4; // Fill progress in ~750ms
        });
      }, 30);
    } else {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return Math.max(prev - 8, 0); // Deplete progress quickly
        });
      }, 20);
    }
    return () => clearInterval(interval);
  }, [isHolding]);

  const triggerBlast = () => {
    setIsHolding(false);
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const targetScroll = (1 / 12) * maxScroll;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-transparent overflow-hidden pt-20 md:pt-0">
      {/* BLAST ZOOM-BLUR FULLSCREEN OVERLAY */}
      <AnimatePresence>
        {holdProgress > 0 && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none bg-black/10"
            style={{
              backdropFilter: `blur(${holdProgress * 0.08}px)`,
              WebkitBackdropFilter: `blur(${holdProgress * 0.08}px)`,
              scale: 1 + (holdProgress * 0.0005),
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Background Soft Glows */}
      <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] bg-radial from-[#ff5a1f]/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-radial from-[#c300ff]/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Abstract Green Silk Waves (Morphing SVG Path) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 -z-10">
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
              <stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#c300ff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#080808" stopOpacity="0.15" />
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
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f] animate-pulse" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-white/80 font-light">
              Bespoke Nature Collection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.1] text-white mb-6 font-light capitalize text-left"
          >
            Designed
            <br />
            To Shine
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a1f] to-[#c300ff] font-serif italic">Depth.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
            className="text-white/60 text-sm md:text-base max-w-md font-light leading-relaxed mb-10 tracking-[0.03em]"
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
              href="#explore"
              className="hover-target bg-white hover:bg-white/90 text-black font-semibold text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
            >
              Start a Project
              <ArrowRight className="w-4 h-4 text-black" />
            </MagneticButton>
            <MagneticButton
              href="#consult"
              className="hover-target glass-effect hover:bg-white/5 border border-white/10 text-white font-medium text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300"
            >
              Book Consultation
              <Calendar className="w-4 h-4 text-[#ff5a1f]" />
            </MagneticButton>
          </motion.div>
        </div>

        {/* Right Column: Interactive Hold To Blast button */}
        <div className="w-full order-1 lg:order-2 h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center relative pointer-events-auto">
          <div
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onMouseLeave={() => setIsHolding(false)}
            onTouchStart={() => setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
            className="relative w-44 h-44 rounded-full flex flex-col items-center justify-center border border-white/10 hover:border-white/20 bg-white/5 cursor-pointer select-none transition-all duration-300 group shadow-lg hover:shadow-white/[0.02]"
          >
            {/* SVG Circular Progress Loader */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="2"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="46"
                stroke="#ff5a1f"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - holdProgress / 100)}
                transition={{ ease: "linear" }}
              />
            </svg>

            <span className="text-[10px] tracking-[0.3em] text-[#ff5a1f] uppercase font-bold group-hover:scale-105 transition-transform duration-300 mb-1">
              Hold To
            </span>
            <span className="text-sm tracking-[0.2em] text-white uppercase font-black group-hover:scale-105 transition-transform duration-300">
              Blast
            </span>

            {/* Progress percentage label */}
            <span className="text-[8px] tracking-[0.1em] text-white/40 uppercase absolute bottom-8">
              {Math.round(holdProgress)}%
            </span>
          </div>
        </div>
        
      </div>

      {/* Scroll indicator at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-white/50">
        <span>Scroll to Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f]"
        />
      </div>
    </section>
  );
}
