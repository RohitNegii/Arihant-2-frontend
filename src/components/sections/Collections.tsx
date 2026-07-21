"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface CardProps {
  title: string;
  subtitle: string;
  image: string;
  price: string;
}

function CollectionCard({ title, subtitle, image, price }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for mouse coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Set up smooth 3D tilt spring rotation values
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { damping: 20, stiffness: 150 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { damping: 20, stiffness: 150 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Relative position inside card (-0.5 to 0.5)
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="hover-target glass-effect relative h-[420px] w-full rounded-2xl p-8 flex flex-col justify-between overflow-hidden cursor-pointer group border border-verdant-emerald/5 hover:border-verdant-gold/30 transition-colors duration-500 bg-[#FAF7F2]/40 shadow-xs hover:shadow-[0_20px_40px_rgba(15,76,58,0.06)]"
    >
      {/* Glow border ring */}
      <div className="absolute inset-0 bg-radial from-verdant-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Sheen reflection effect */}
      <div className="absolute -inset-full bg-linear-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

      {/* Card Header text */}
      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 text-left">
        <span className="text-[9px] tracking-[0.25em] uppercase text-verdant-gold mb-2 block font-light">
          {subtitle}
        </span>
        <h3 className="font-serif text-2xl tracking-wide text-verdant-emerald group-hover:text-verdant-gold transition-colors duration-300">
          {title}
        </h3>
      </div>

      {/* Card Central Visual with shadow and scale effect */}
      <div
        style={{ transform: "translateZ(50px)" }}
        className="my-auto w-full h-[180px] relative flex items-center justify-center pointer-events-none"
      >
        <div className="absolute w-36 h-36 rounded-full bg-radial from-verdant-gold/5 to-transparent blur-md group-hover:scale-120 transition-transform duration-700" />
        <img
          src={image}
          alt={title}
          className="max-h-[145px] w-auto object-contain z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 select-none filter drop-shadow-[0_15px_15px_rgba(15,76,58,0.15)]"
        />
      </div>

      {/* Card Footer details */}
      <div style={{ transform: "translateZ(25px)" }} className="relative z-10 flex justify-between items-center mt-4 border-t border-verdant-emerald/5 pt-4">
        <span className="text-verdant-emerald/40 text-[10px] tracking-[0.15em] font-light uppercase">
          {price}
        </span>
        <span className="text-[10px] tracking-[0.2em] text-verdant-emerald/80 group-hover:text-verdant-gold transition-colors duration-300 uppercase flex items-center gap-1.5 font-light">
          View Collection
          <span className="inline-block transform group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
        </span>
      </div>
    </motion.div>
  );
}

export default function Collections() {
  const collectionsData = [
    {
      title: "Diamond Rings",
      subtitle: "Infinite Brilliance",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      price: "From $12,500",
    },
    {
      title: "Necklaces",
      subtitle: "Sculpted Elegance",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      price: "From $8,200",
    },
    {
      title: "Bracelets",
      subtitle: "Modern Orbits",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80",
      price: "From $6,400",
    },
    {
      title: "Wedding Collection",
      subtitle: "Timeless Vows",
      image: "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?auto=format&fit=crop&w=600&q=80",
      price: "From $15,000",
    },
  ];

  return (
    <section id="collections" className="relative py-24 md:py-32 bg-transparent border-t border-verdant-emerald/5">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-radial from-[#bf953f]/3 to-transparent blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Title details */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-3 font-light">
            Bespoke Portfolios
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald font-light">
            Our Signature Collections
          </h2>
          <div className="w-12 h-[1px] bg-verdant-gold/50 mt-6" />
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collectionsData.map((col, index) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <CollectionCard {...col} />
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
