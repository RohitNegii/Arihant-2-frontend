"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function BrandStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth springs for image layers parallax
  const yImageBottom = useSpring(useTransform(scrollYProgress, [0, 1], [80, -80]), { stiffness: 90, damping: 25 });
  const yImageTop = useSpring(useTransform(scrollYProgress, [0, 1], [-80, 80]), { stiffness: 90, damping: 25 });

  const leaves = [
    { id: 1, size: 24, left: "10%", delay: 0, duration: 18, rotate: 45, colorClass: "text-verdant-emerald" },
    { id: 2, size: 16, left: "25%", delay: 3, duration: 15, rotate: -30, colorClass: "text-verdant-gold" },
    { id: 3, size: 20, left: "60%", delay: 1, duration: 22, rotate: 60, colorClass: "text-verdant-emerald" },
    { id: 4, size: 28, left: "80%", delay: 5, duration: 17, rotate: 15, colorClass: "text-verdant-gold" },
    { id: 5, size: 18, left: "90%", delay: 2, duration: 20, rotate: -45, colorClass: "text-verdant-emerald" },
  ];

  return (
    <section
      ref={containerRef}
      id="story"
      className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-verdant-emerald/5"
    >
      
      {/* Floating Leaves (Organic multi-color leaf drift) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {leaves.map((leaf) => (
          <motion.svg
            key={leaf.id}
            style={{ left: leaf.left, rotate: leaf.rotate }}
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 24 24"
            fill="none"
            className={`absolute -top-10 opacity-20 ${leaf.colorClass}`}
            animate={{
              y: ["-5vh", "105vh"],
              x: [0, 40, -30, 20, 0],
            }}
            transition={{
              y: {
                duration: leaf.duration,
                repeat: Infinity,
                ease: "linear",
                delay: leaf.delay,
              },
              x: {
                duration: leaf.duration * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <path
              d="M12,2 C17,6 21,12 12,22 C3,12 7,6 12,2 Z"
              fill="currentColor"
            />
          </motion.svg>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Typography Story */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-4 font-light">
              our heritage
            </span>
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald leading-tight font-light mb-8">
              Sown in Nature,
              <br />
              <span className="gold-gradient-text font-serif italic">Reaped in Elegance</span>
            </h2>
            <div className="w-12 h-[1px] bg-verdant-gold/50 mb-8" />
            <p className="text-verdant-emerald/80 text-sm md:text-base font-light leading-relaxed tracking-wide mb-6">
              VERDANT JEWELS was founded on the belief that luxury should harmonize with the earth. We draw inspiration from raw botany, translating structural plant fibers, cascading water ripples, and leaf veins into precious metal lattices.
            </p>
            <p className="text-verdant-emerald/50 text-xs md:text-sm font-light leading-relaxed tracking-wide">
              Every emerald is carefully hand-selected from responsible family-owned mines in Colombia, and set in gold alloys configured to capture warm forest lighting. Our design atelier in Milan ensures every contour hugs the body like a second skin.
            </p>
          </div>

          {/* Right Column: Layered Parallax Photos */}
          <div className="lg:col-span-6 relative h-[450px] md:h-[550px] w-full flex items-center justify-center">
            
            {/* Background card frame */}
            <div className="absolute w-[80%] h-[80%] border border-verdant-gold/20 rounded-3xl -rotate-3 translate-x-4 pointer-events-none" />

            {/* Bottom Image (Parallax layer 1 - Drifts Upward) */}
            <motion.div
              style={{ y: yImageBottom }}
              className="absolute left-6 bottom-6 w-[60%] aspect-3/4 rounded-2xl overflow-hidden shadow-lg border border-white/10 z-10"
            >
              <img
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
                alt="Sketching Atelier design"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 select-none"
              />
            </motion.div>

            {/* Top Image (Parallax layer 2 - Drifts Downward) */}
            <motion.div
              style={{ y: yImageTop }}
              className="absolute right-6 top-6 w-[55%] aspect-3/4 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-20"
            >
              <img
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80"
                alt="Jewelry benchwork crafting"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 select-none"
              />
            </motion.div>
            
          </div>
          
        </div>
      </div>
    </section>
  );
}
