"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { PenTool, Layers, Hammer, Sparkles, Truck } from "lucide-react";

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const steps = [
    {
      title: "Sketch",
      icon: <PenTool className="w-5 h-5" />,
      desc: "Our design team conceptualises initial geometry by hand, capturing organic curves and lighting intentions on paper.",
    },
    {
      title: "Design",
      icon: <Layers className="w-5 h-5" />,
      desc: "Sketches are modeled into high-precision 3D CAD renders, running stress-test physics to optimize structural prongs and support.",
    },
    {
      title: "Crafting",
      icon: <Hammer className="w-5 h-5" />,
      desc: "Our gold artisans cast the precious alloy, utilizing microscopic tools to build and setting each diamond with precision.",
    },
    {
      title: "Polishing",
      icon: <Sparkles className="w-5 h-5" />,
      desc: "Each facet is meticulously hand-buffed using custom compound abrasives, achieving our trademark brilliant mirror sheen.",
    },
    {
      title: "Delivery",
      icon: <Truck className="w-5 h-5" />,
      desc: "Your bespoke creation is GIA authenticated, placed in a hand-crafted leather chest, and delivered via secure diplomatic courier.",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-verdant-emerald/5"
    >
      <div className="absolute top-[40%] left-[-15%] w-[45vw] h-[45vw] bg-radial from-verdant-gold/3 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20 md:mb-28">
          <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-3 font-light">
            Atelier Chronicles
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald font-light">
            The Journey of Creation
          </h2>
          <div className="w-12 h-[1px] bg-verdant-gold/50 mt-6" />
        </div>

        {/* Vertical Timeline Wrapper */}
        <div className="relative">
          {/* Main track line (grey/muted) */}
          <div className="absolute left-[30px] md:left-1/2 top-4 bottom-4 w-[1px] bg-verdant-emerald/10 -translate-x-1/2" />
          
          {/* Active gold line drawn on scroll */}
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="absolute left-[30px] md:left-1/2 top-4 bottom-4 w-[1.5px] bg-verdant-gold shadow-[0_0_10px_#C8A96A] -translate-x-1/2"
          />

          {/* Steps Timeline items */}
          <div className="flex flex-col gap-16 md:gap-24">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={step.title}
                  className={`flex flex-col md:flex-row relative items-start md:items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Timeline node circle */}
                  <div className="absolute left-[30px] md:left-1/2 top-1.5 md:top-auto -translate-x-1/2 w-7 h-7 rounded-full bg-[#F8F4EA] border border-verdant-emerald/20 hover:border-verdant-gold flex items-center justify-center text-verdant-emerald/40 hover:text-verdant-gold shadow-xs z-20 transition-all duration-300">
                    <span className="text-[9px] font-bold">{idx + 1}</span>
                  </div>

                  {/* Spacer or Card content */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="hover-target glass-effect p-6 md:p-8 rounded-2xl border border-verdant-emerald/5 hover:border-verdant-gold/30 bg-[#F8F4EA]/30 hover:bg-[#F8F4EA]/60 transition-all duration-500 group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 rounded-lg bg-verdant-emerald/3 border border-verdant-emerald/5 text-verdant-gold group-hover:bg-verdant-gold/5 group-hover:border-verdant-gold/20 transition-colors duration-300">
                          {step.icon}
                        </div>
                        <h3 className="font-serif text-lg md:text-xl tracking-wide text-verdant-emerald group-hover:text-verdant-gold transition-colors duration-300 text-left">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-verdant-emerald/60 text-xs md:text-sm font-light leading-relaxed tracking-wide text-left">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>

                  {/* Empty spacer column for desktop layout */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </section>
  );
}
