"use client";

import { useState } from "react";
import { Heart, Eye, ShoppingBag, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
}

export default function BestSellers() {
  const products: Product[] = [
    {
      id: 1,
      name: "Solitaire Emerald Pendant",
      price: "$8,200",
      image: "/emerald_necklace.png",
      category: "Necklaces",
    },
    {
      id: 2,
      name: "Botanical Cluster Ring",
      price: "$12,500",
      image: "/emerald_ring.png",
      category: "Rings",
    },
    {
      id: 3,
      name: "Dewdrop Emerald Studs",
      price: "$6,800",
      image: "/emerald_earrings.png",
      category: "Earrings",
    },
    {
      id: 4,
      name: "Intertwined Vines Bracelet",
      price: "$9,400",
      image: "/gold_bracelet.png",
      category: "Bracelets",
    },
  ];

  const [wishlisted, setWishlisted] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);
  const [activeQuickView, setActiveQuickView] = useState<Product | null>(null);

  const toggleWishlist = (id: number) => {
    setWishlisted((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleCart = (id: number) => {
    setCart((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-verdant-emerald/5">
      <div className="absolute top-[20%] left-[-15%] w-[45vw] h-[45vw] bg-radial from-[#C8A96A]/3 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-3 font-light">
            curated highlights
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald font-light">
            Atelier Best Sellers
          </h2>
          <div className="w-12 h-[1px] bg-verdant-gold/50 mt-6" />
        </div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((prod, idx) => {
            const isWishlisted = wishlisted.includes(prod.id);
            const isInCart = cart.includes(prod.id);

            return (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
                className="hover-target glass-effect rounded-2xl overflow-hidden border border-verdant-emerald/5 hover:border-verdant-gold/20 transition-all duration-500 bg-[#F8F4EA]/40 group flex flex-col h-full shadow-xs hover:shadow-[0_15px_35px_rgba(15,76,58,0.06)] hover:-translate-y-1.5"
              >
                {/* Product Image Wrapper */}
                <div className="w-full aspect-square overflow-hidden relative bg-[#F8F4EA]/20 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-radial from-verdant-gold/3 via-transparent to-transparent opacity-60" />

                  {/* Floating Action Buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-xs flex items-center justify-center text-verdant-emerald border border-verdant-emerald/5 hover:border-verdant-gold/50 shadow-md transition-all duration-300 hover:scale-110 cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-verdant-emerald"
                          }`}
                      />
                    </button>
                    <button
                      onClick={() => setActiveQuickView(prod)}
                      className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-xs flex items-center justify-center text-verdant-emerald border border-verdant-emerald/5 hover:border-verdant-gold/50 shadow-md transition-all duration-300 hover:scale-110 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-[90%] h-[90%] object-contain rounded-xl group-hover:scale-108 transition-all duration-700 select-none filter drop-shadow-[0_10px_10px_rgba(15,76,58,0.08)]"
                  />
                </div>

                {/* Product Info */}
                <div className="p-6 flex flex-col justify-between flex-1 border-t border-verdant-emerald/5 bg-white/20">
                  <div className="mb-4 text-left">
                    <span className="text-[9px] tracking-widest uppercase text-verdant-gold block mb-1 font-light">
                      {prod.category}
                    </span>
                    <h3 className="font-serif text-base tracking-wide text-verdant-emerald group-hover:text-verdant-gold transition-colors duration-300">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="font-serif text-sm text-verdant-emerald font-medium">
                      {prod.price}
                    </span>

                    {/* Add to Cart CTA */}
                    <button
                      onClick={() => toggleCart(prod.id)}
                      className={`hover-target flex items-center gap-1 px-4 py-2 rounded-full text-[10px] tracking-widest uppercase font-semibold border transition-all duration-300 cursor-pointer ${isInCart
                          ? "bg-verdant-emerald border-verdant-emerald text-[#F8F4EA]"
                          : "border-verdant-emerald/20 text-verdant-emerald hover:border-verdant-gold hover:bg-verdant-gold/5"
                        }`}
                    >
                      {isInCart ? (
                        <>
                          <Check className="w-3 h-3 text-[#F8F4EA]" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3 h-3" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick View Modal */}
        <AnimatePresence>
          {activeQuickView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/45 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-lg glass-effect-gold p-8 rounded-3xl relative border border-verdant-gold/30 bg-[#F8F4EA]/95 flex flex-col md:flex-row gap-6 shadow-2xl"
              >
                <button
                  onClick={() => setActiveQuickView(null)}
                  className="absolute top-4 right-4 text-verdant-emerald hover:text-verdant-gold transition-colors cursor-pointer"
                >
                  Close
                </button>

                <div className="w-full md:w-1/2 aspect-square flex items-center justify-center p-2 bg-[#F8F4EA] rounded-2xl border border-verdant-emerald/5">
                  <img
                    src={activeQuickView.image}
                    alt={activeQuickView.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_10px_rgba(15,76,58,0.1)]"
                  />
                </div>

                <div className="w-full md:w-1/2 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[9px] tracking-widest uppercase text-verdant-gold font-light mb-1 block">
                      {activeQuickView.category}
                    </span>
                    <h3 className="font-serif text-2xl tracking-wide text-verdant-emerald mb-2">
                      {activeQuickView.name}
                    </h3>
                    <p className="text-verdant-emerald/50 text-[10px] tracking-wider mb-4 leading-relaxed font-light">
                      Crafted using selected gold structures and conflict-free gemstones representing GIA standards.
                    </p>
                  </div>

                  <div>
                    <span className="font-serif text-xl text-verdant-emerald font-semibold block mb-4">
                      {activeQuickView.price}
                    </span>
                    <button
                      onClick={() => {
                        toggleCart(activeQuickView.id);
                        setActiveQuickView(null);
                      }}
                      className="w-full py-3 rounded-full text-[10px] tracking-[0.2em] font-semibold uppercase text-black bg-verdant-gold hover:opacity-90 shadow-md transition-opacity duration-300 cursor-pointer"
                    >
                      Add To Collection
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
