"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Diamond, Sparkles, Layers, PenTool } from "lucide-react";

// Load the 3D Canvas dynamically with SSR disabled
const ShowcaseModel = dynamic(() => import("../3d/ShowcaseModel"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-verdant-gold/30 border-t-verdant-gold rounded-full animate-spin" />
    </div>
  ),
});

export default function Showcase() {
  const points = [
    {
      icon: <Layers className="w-5 h-5 text-verdant-gold" />,
      title: "Premium Materials",
      desc: "Forged with custom-alloyed 18K champagne gold and pure platinum configurations for exceptional durability.",
    },
    {
      icon: <PenTool className="w-5 h-5 text-verdant-gold" />,
      title: "Handcrafted",
      desc: "Every gemstone setting is micro-soldered under high-magnification prisms by our master craftsmen.",
    },
    {
      icon: <Diamond className="w-5 h-5 text-verdant-gold" />,
      title: "Certified Diamonds",
      desc: "Sourced using strict GIA authentication grades, certifying ideal cut proportions and carbon purity.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-verdant-gold" />,
      title: "Lifetime Shine",
      desc: "Our proprietary polishing compound ensures an enduring mirror sheen resistant to natural tarnishing.",
    },
  ];

  return (
    <section
      id="showcase-section"
      className="relative py-24 md:py-32 bg-[#F8F4EA] overflow-hidden border-t border-verdant-emerald/5"
    >
      <div className="absolute top-[30%] left-[-10%] w-[50vw] h-[50vw] bg-radial from-verdant-gold/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header copy */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-3 font-light">
            Interactive Exhibition
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald font-light">
            Sculpting Nature & Light
          </h2>
          <p className="text-verdant-emerald/60 text-xs md:text-sm max-w-lg mt-4 font-light leading-relaxed tracking-wider">
            Scroll to zoom and interact. Witness the physical geometry shift as cinematic reflections dance across the crystalline core.
          </p>
          <div className="w-12 h-[1px] bg-verdant-gold/50 mt-6" />
        </div>

        {/* Showcase Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          
          {/* Left Column: 3D interactive model */}
          <div className="lg:col-span-7 w-full h-[400px] md:h-[500px] lg:h-[600px] glass-effect rounded-3xl overflow-hidden relative flex items-center justify-center border border-verdant-emerald/5 bg-[#F8F4EA]/20">
            {/* Ambient gold glow behind the canvas */}
            <div className="absolute inset-0 bg-radial from-verdant-gold/5 via-transparent to-transparent opacity-60 pointer-events-none" />
            <ShowcaseModel />
          </div>

          {/* Right Column: Spec Text Blocks */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {points.map((pt, i) => (
              <motion.div
                key={pt.title}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                className="glass-effect rounded-2xl p-6 md:p-8 border border-verdant-emerald/5 hover:border-verdant-gold/20 transition-all duration-300 group hover:translate-x-1"
              >
                <div className="flex items-start gap-5">
                  <div className="p-3.5 rounded-xl bg-verdant-emerald/3 border border-verdant-emerald/5 group-hover:border-verdant-gold/20 group-hover:bg-verdant-gold/5 transition-all duration-300">
                    {pt.icon}
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <h3 className="font-serif text-lg tracking-wide text-verdant-emerald group-hover:text-verdant-gold transition-colors duration-300">
                      {pt.title}
                    </h3>
                    <p className="text-verdant-emerald/60 text-xs md:text-sm font-light leading-relaxed tracking-wide">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
