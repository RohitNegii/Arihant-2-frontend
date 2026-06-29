"use client";

import { motion } from "framer-motion";

export default function VideoShowcase() {
  return (
    <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-black border-t border-verdant-emerald/5">
      {/* Parallax / Zooming Cinematic Background */}
      <motion.div
        initial={{ scale: 1.15, opacity: 0.3 }}
        whileInView={{ scale: 1.0, opacity: 0.45 }}
        viewport={{ once: false }}
        transition={{ duration: 2.0, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center select-none pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80')`,
        }}
      />

      {/* Cinematic Golden Radial Lens Flare Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8F4EA] via-transparent to-[#F8F4EA] pointer-events-none z-10 opacity-30" />
      <div className="absolute inset-0 bg-radial from-verdant-gold/10 via-transparent to-transparent pointer-events-none z-10 animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="max-w-4xl mx-auto px-6 relative z-20 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-verdant-gold/30 bg-verdant-gold/5 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold" />
          <span className="text-[9px] tracking-[0.25em] uppercase text-verdant-gold font-light">
            ateliers de cinema
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
          className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-white leading-tight font-light mb-6"
        >
          Forged in Fire,
          <br />
          <span className="gold-gradient-text font-serif italic">Refined in Silence</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
          className="text-white/70 text-xs md:text-sm font-light leading-relaxed tracking-wider max-w-xl"
        >
          Watch our artisans operate at microscopic scales. In the stillness of our Swiss labs, coal crystals undergo high-temperature crystallization to become flawless diamonds, hand-set into gold filaments.
        </motion.p>
      </div>
    </section>
  );
}
