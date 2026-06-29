"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Sparkles, ZoomIn, RefreshCw } from "lucide-react";

// Load 3D interactive viewer dynamically to prevent SSR errors
const InteractiveViewer = dynamic(() => import("../3d/InteractiveViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-verdant-emerald/20 border-t-verdant-emerald rounded-full animate-spin" />
    </div>
  ),
});

export default function InteractiveSection() {
  const metals = [
    { name: "Yellow Gold", color: "#D4AF37", desc: "18K Classic Solitaire Gold" },
    { name: "White Gold", color: "#E5E4E2", desc: "Pure Polished White Gold & Platinum" },
    { name: "Rose Gold", color: "#B76E79", desc: "Bespoke Warm Copper Alloys" },
  ];

  const gems = [
    { name: "Aurora Diamond", color: "#ffffff", desc: "GIA Certified Pure D-Flawless" },
    { name: "Empress Ruby", color: "#FF1493", desc: "Vibrant Deep Pink Flame Crystal" },
    { name: "Forest Emerald", color: "#50C878", desc: "Rare Translucent Green Hexagonal" },
  ];

  const [activeMetal, setActiveMetal] = useState(metals[0]);
  const [activeGem, setActiveGem] = useState(gems[0]);

  return (
    <section id="showcase" className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-verdant-emerald/5">
      <div className="absolute top-[20%] right-[-15%] w-[45vw] h-[45vw] bg-radial from-verdant-gold/3 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-3 font-light">
            Bespoke Customizer
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald font-light">
            Configure Your Masterpiece
          </h2>
          <p className="text-verdant-emerald/60 text-xs md:text-sm max-w-lg mt-4 font-light leading-relaxed tracking-wider">
            Interact directly with the digital render. Modify the precious metal alloy and gemstone cut to match your aesthetic preference.
          </p>
          <div className="w-12 h-[1px] bg-verdant-gold/50 mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: 3D interactive viewer canvas wrapper */}
          <div className="lg:col-span-7 w-full h-[450px] md:h-[550px] glass-effect rounded-3xl overflow-hidden relative border border-verdant-emerald/5 bg-[#F8F4EA]/20 flex flex-col justify-between">
            {/* Guide overlay */}
            <div className="absolute top-6 left-6 z-20 flex gap-4 pointer-events-none">
              <div className="glass-effect rounded-full px-4 py-2 flex items-center gap-2 border border-verdant-emerald/10 text-[9px] uppercase tracking-[0.15em] text-verdant-emerald/60">
                <RefreshCw className="w-3.5 h-3.5 text-verdant-gold animate-spin" style={{ animationDuration: '6s' }} />
                Drag to rotate
              </div>
              <div className="glass-effect rounded-full px-4 py-2 flex items-center gap-2 border border-verdant-emerald/10 text-[9px] uppercase tracking-[0.15em] text-verdant-emerald/60">
                <ZoomIn className="w-3.5 h-3.5 text-verdant-gold" />
                Scroll to zoom
              </div>
            </div>

            {/* Render Canvas */}
            <div className="flex-1 w-full h-full">
              <InteractiveViewer
                metalColor={activeMetal.color}
                gemColor={activeGem.color}
              />
            </div>

            {/* Bottom active spec details panel */}
            <div className="glass-effect-gold p-6 border-t border-verdant-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F8F4EA]/80 z-20">
              <div className="text-left">
                <span className="text-[9px] tracking-widest uppercase text-verdant-gold font-light">
                  Active Configuration
                </span>
                <h4 className="font-serif text-lg tracking-wide text-verdant-emerald font-light mt-1">
                  {activeMetal.name} &times; {activeGem.name}
                </h4>
              </div>
              <span className="text-verdant-emerald/70 text-xs tracking-widest uppercase font-light border border-verdant-emerald/10 rounded-full px-4 py-1.5 bg-white/5">
                Atelier Grade Spec
              </span>
            </div>
          </div>

          {/* Right Side: Alloy and Gem selection tabs */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            
            {/* Metal Select Group */}
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-verdant-gold" />
                <span className="text-[10px] tracking-[0.25em] uppercase text-verdant-emerald/80 font-light">
                  Select Alloy Base
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                {metals.map((metal) => (
                  <button
                    key={metal.name}
                    onClick={() => setActiveMetal(metal)}
                    className={`hover-target glass-effect flex items-center gap-5 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                      activeMetal.name === metal.name
                        ? "border-verdant-gold/60 bg-verdant-gold/5 shadow-[0_0_15px_rgba(200,169,106,0.1)]"
                        : "border-verdant-emerald/5 bg-transparent hover:border-verdant-emerald/20"
                    }`}
                  >
                    {/* Metal Color Indicator circle */}
                    <div
                      className="w-8 h-8 rounded-full border border-verdant-emerald/25 shadow-xs flex-shrink-0"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${metal.color} 50%, #000000 100%)`,
                      }}
                    />
                    <div>
                      <h4 className="text-sm font-medium tracking-wide text-verdant-emerald">
                        {metal.name}
                      </h4>
                      <p className="text-[10px] tracking-wide text-verdant-emerald/40 font-light mt-0.5">
                        {metal.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gem Select Group */}
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-verdant-gold" />
                <span className="text-[10px] tracking-[0.25em] uppercase text-verdant-emerald/80 font-light">
                  Select Gemstone Cut
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {gems.map((gem) => (
                  <button
                    key={gem.name}
                    onClick={() => setActiveGem(gem)}
                    className={`hover-target glass-effect flex items-center gap-5 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                      activeGem.name === gem.name
                        ? "border-verdant-gold/60 bg-verdant-gold/5 shadow-[0_0_15px_rgba(200,169,106,0.1)]"
                        : "border-verdant-emerald/5 bg-transparent hover:border-verdant-emerald/20"
                    }`}
                  >
                    {/* Gem Color Indicator circle */}
                    <div
                      className="w-8 h-8 rounded-full border border-verdant-emerald/25 shadow-xs flex-shrink-0"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${gem.color} 50%, #000000 100%)`,
                      }}
                    />
                    <div>
                      <h4 className="text-sm font-medium tracking-wide text-verdant-emerald">
                        {gem.name}
                      </h4>
                      <p className="text-[10px] tracking-wide text-verdant-emerald/40 font-light mt-0.5">
                        {gem.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
}
