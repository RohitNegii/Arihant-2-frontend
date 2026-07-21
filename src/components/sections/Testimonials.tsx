"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "VERDANT's organic structure philosophy is a revelation. Sown in botanical lines, the rings curve around the finger like hand-woven vines.",
      author: "Elena Rostova",
      role: "Art Curator",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      rotation: -4,
      floatDelay: 0,
      floatDuration: 4.5,
    },
    {
      quote: "The GIA emerald gemstone set in my custom champagne gold band disperses warm daylight beautifully. Sourcing integrity is unmatched.",
      author: "Julian Thorne",
      role: "Fine Collector",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      rotation: 0,
      floatDelay: 0.5,
      floatDuration: 5.2,
    },
    {
      quote: "The interactive 3D consult was a masterpiece of presentation. When the custom piece arrived, it was as if physical botany had crystallized.",
      author: "Clara Vandermere",
      role: "Architectural Designer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      rotation: 4,
      floatDelay: 1.0,
      floatDuration: 4.8,
    },
  ];

  return (
    <section id="story-reviews" className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-verdant-emerald/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] bg-radial from-verdant-gold/3 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-3 font-light">
            ateliers & testaments
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald font-light">
            Voices of Elegance
          </h2>
          <div className="w-12 h-[1px] bg-verdant-gold/50 mt-6" />
        </div>

        {/* Curved 3D Floating layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 px-2 md:px-0 max-w-5xl mx-auto items-stretch">
          {testimonials.map((test, index) => (
            <motion.div
              key={test.author}
              initial={{ opacity: 0, y: 50, rotate: test.rotation * 0.8 }}
              whileInView={{ opacity: 1, y: 0, rotate: test.rotation }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
              animate={{
                y: [0, -12, 0],
              }}
              // Infinite smooth floating wave
              // @ts-expect-error keyframe animation options are checked by react compiler correctly
              transition={{
                y: {
                  duration: test.floatDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: test.floatDelay,
                }
              }}
              style={{
                transformStyle: "preserve-3d",
              }}
              className="hover-target glass-effect flex flex-col justify-between p-8 rounded-3xl border border-verdant-emerald/5 hover:border-verdant-gold/30 hover:bg-[#FAF7F2]/60 transition-colors duration-500 relative shadow-xs"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-verdant-gold/10 pointer-events-none" />

              <div className="mb-8">
                {/* 5 Star rating */}
                <div className="flex gap-0.5 mb-4 justify-start">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-verdant-gold text-verdant-gold" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-verdant-emerald/70 text-xs md:text-sm font-light leading-relaxed tracking-wide italic text-left">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-4 border-t border-verdant-emerald/5 pt-6">
                <img
                  src={test.image}
                  alt={test.author}
                  className="w-10 h-10 rounded-full object-cover border border-verdant-gold/30"
                />
                <div className="flex flex-col text-left">
                  <span className="font-serif text-sm tracking-wide text-verdant-emerald font-medium">
                    {test.author}
                  </span>
                  <span className="text-[9px] tracking-widest text-verdant-gold uppercase font-light">
                    {test.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
