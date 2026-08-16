"use client";

import { motion } from "framer-motion";

export default function Gallery() {
  const images = [
    {
      src: "/images/products/ksp_9.jpg",
      title: "The Radiant Choker",
      category: "High Jewelry",
    },
    {
      src: "/images/products/ksp_10.jpg",
      title: "Symmetry Band",
      category: "Fine Gold",
    },
    {
      src: "/images/products/ksp_11.jpg",
      title: "The Sourcing Atelier",
      category: "Atelier Process",
    },
    {
      src: "/images/products/ksp_12.jpg",
      title: "Double Solitaire Ring",
      category: "Custom Engagement",
    },
    {
      src: "/images/products/ksp_13.jpg",
      title: "Gold Heritage Band",
      category: "Horology & Craft",
    },
    {
      src: "/images/products/ksp_14.jpg",
      title: "Dewdrop Emeralds",
      category: "Atelier Benchwork",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-transparent border-t border-verdant-emerald/5 overflow-hidden">
      <div className="absolute top-0 left-0 w-[30vw] h-[30vw] bg-radial from-[#bf953f]/3 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-3 font-light">
            visual archives
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald font-light">
            Instagram Gallery
          </h2>
          <div className="w-12 h-[1px] bg-verdant-gold/50 mt-6" />
        </div>

        {/* Pinterest Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="hover-target break-inside-avoid relative rounded-2xl overflow-hidden group border border-verdant-emerald/5 hover:border-verdant-gold/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(15,76,58,0.08)]"
            >
              {/* Image element */}
              <img
                src={img.src}
                alt={img.title}
                className="w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out select-none"
              />

              {/* Glass overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C3A]/90 via-[#0F4C3A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 pointer-events-none">
                <span className="text-[9px] tracking-widest uppercase text-verdant-gold mb-1 font-light">
                  {img.category}
                </span>
                <h3 className="font-serif text-lg tracking-wide text-[#FAF7F2] font-light text-left">
                  {img.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
