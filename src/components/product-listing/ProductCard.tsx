"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "../../utils/api";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};
import { ProductData } from "../../services/productListing";
import ProductPrice from "../global/ProductPrice";

interface ProductCardProps {
  product: ProductData;
  isListView?: boolean;
}

export default function ProductCard({ product, isListView = false }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);

  const productLink = `/products/${product.slug}`;
  const outOfStock = product.hasVariants
    ? (product.variants?.every(v => v.stock <= 0) ?? true)
    : (product.stock ?? 0) <= 0;

  const displayPrice = product.hasVariants
    ? (product.variants && product.variants.length > 0 ? Math.min(...product.variants.map(v => v.price)) : 0)
    : (product.price ?? 0);

  const displayDiscountPrice = product.discountPrice ?? (
    product.hasVariants && product.variants && product.variants.length > 0
      ? (product.variants.some(v => v.discountPrice !== undefined)
          ? Math.min(...product.variants.map(v => v.discountPrice ?? v.price))
          : undefined)
      : undefined
  );

  if (isListView) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-3xl overflow-hidden border border-verdant-emerald/5 hover:border-verdant-gold/40 flex flex-col md:flex-row gap-6 p-6 shadow-[0_4px_25px_rgba(var(--color-primary-rgb),0.01)] hover:shadow-[0_25px_50px_rgba(var(--color-primary-rgb),0.07)] transition-all duration-700 ease-out w-full group text-left relative"
      >
        {/* Subtle premium shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />

        {/* Image Frame */}
        <Link
          href={productLink}
          className="relative w-full md:w-64 aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-verdant-cream to-verdant-emerald/[0.04] flex items-center justify-center p-4 border border-verdant-emerald/[0.02]"
        >
          {isVideoUrl(product.thumbnail || product.images[0]) ? (
            <video
              src={getImageUrl(product.thumbnail || product.images[0])}
              className="object-cover w-full h-full scale-100 group-hover:scale-108 transition-transform duration-1000 ease-out"
              muted
              playsInline
              autoPlay
              loop
            />
          ) : (
            <img
              src={getImageUrl(product.thumbnail || product.images[0])}
              alt={product.name}
              className="object-cover w-full h-full scale-100 group-hover:scale-108 transition-transform duration-1000 ease-out"
              loading="lazy"
            />
          )}

          {/* Badge Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isBestSeller && (
              <span className="bg-verdant-emerald border border-verdant-gold/30 text-verdant-cream text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-2.5 h-2.5 text-verdant-gold animate-pulse" /> Best Seller
              </span>
            )}
            {outOfStock && (
              <span className="bg-verdant-danger text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick View Button Hover Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
            <span className="bg-verdant-cream/90 backdrop-blur-md border border-verdant-gold/30 text-verdant-emerald px-4 py-2 rounded-full text-[9px] tracking-widest font-bold uppercase flex items-center gap-1.5 shadow-md">
              <Eye className="w-3.5 h-3.5 text-verdant-gold" /> Quick View
            </span>
          </div>
        </Link>

        {/* Card Content */}
        <div className="flex-1 flex flex-col justify-between py-2 z-20">
          <div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-verdant-gold font-bold font-mono">
                  {product.category?.name || "Jewelry"}
                </span>
                <h4 className="font-serif text-xl md:text-2xl text-verdant-emerald font-light mt-1.5 hover:text-verdant-gold transition-colors duration-300">
                  <Link href={productLink}>{product.name}</Link>
                </h4>
              </div>
            </div>

            <p className="text-verdant-emerald/70 text-xs font-light leading-relaxed tracking-wide my-4 line-clamp-3">
              {product.shortDescription || product.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9px] uppercase tracking-widest font-bold text-verdant-emerald/50">
              <span>SKU: {product.sku}</span>
              <span className="hidden sm:inline">|</span>
              <span>Material: {product.material} ({product.purity})</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-verdant-emerald/5">
            <ProductPrice price={displayPrice} discountPrice={displayDiscountPrice} />
            <Link
              href={productLink}
              className="gold-gradient-bg text-black hover:scale-105 active:scale-95 text-[9px] tracking-widest uppercase font-bold px-6 py-3.5 rounded-full flex items-center gap-2 shadow-md transition-all duration-300"
            >
              View Details
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setShowQuickView(true)}
      onMouseLeave={() => setShowQuickView(false)}
      className="glass-card rounded-3xl overflow-hidden border border-verdant-emerald/5 hover:border-verdant-gold/40 flex flex-col h-full shadow-[0_4px_25px_rgba(var(--color-primary-rgb),0.01)] hover:shadow-[0_25px_50px_rgba(var(--color-primary-rgb),0.07)] hover:-translate-y-2.5 transition-all duration-700 ease-out group text-left relative"
    >
      {/* Subtle premium shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />

      {/* Product Image Window */}
      <Link
        href={productLink}
        className="w-full aspect-square overflow-hidden relative bg-gradient-to-b from-verdant-cream to-verdant-emerald/[0.04] flex items-center justify-center p-6 border-b border-verdant-emerald/[0.03]"
      >
        {isVideoUrl(product.thumbnail || product.images[0]) ? (
          <video
            src={getImageUrl(product.thumbnail || product.images[0])}
            className="object-cover w-full h-full scale-100 group-hover:scale-108 transition-transform duration-1000 ease-out"
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <img
            src={getImageUrl(product.thumbnail || product.images[0])}
            alt={product.name}
            className="object-cover w-full h-full scale-100 group-hover:scale-108 transition-transform duration-1000 ease-out"
            loading="lazy"
          />
        )}

        {/* Absolute Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {product.isBestSeller && (
            <span className="bg-verdant-emerald border border-verdant-gold/30 text-verdant-cream text-[9px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5 text-verdant-gold animate-pulse" /> Best Seller
            </span>
          )}
          {outOfStock && (
            <span className="bg-verdant-danger text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-full shadow-md">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick View Button Hover Overlay (Luxury Sliding Pill Button) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
          <span className="bg-verdant-cream/95 backdrop-blur-md border border-verdant-gold/30 text-verdant-emerald px-4 py-2.5 rounded-full text-[9px] tracking-widest font-bold uppercase flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all">
            <Eye className="w-3.5 h-3.5 text-verdant-gold" /> Quick View
          </span>
        </div>
      </Link>

      {/* Card Content Area */}
      <div className="p-6 flex flex-col flex-1 justify-between z-20">
        <div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-[9px] uppercase tracking-widest text-verdant-gold font-bold font-mono">
              {product.category?.name || "Jewelry"}
            </span>
          </div>

          <h4 className="font-serif text-base md:text-lg text-verdant-emerald font-light mt-2 leading-tight hover:text-verdant-gold transition-colors duration-300 line-clamp-1">
            <Link href={productLink}>{product.name}</Link>
          </h4>

          <p className="text-verdant-emerald/70 text-[11px] font-light leading-relaxed tracking-wide mt-3 line-clamp-2">
            {product.shortDescription || product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-verdant-emerald/5">
          <ProductPrice price={displayPrice} discountPrice={displayDiscountPrice} />
          <Link
            href={productLink}
            className="hover-target text-[9px] tracking-widest uppercase font-bold text-verdant-emerald hover:text-verdant-gold flex items-center gap-1.5 transition-colors duration-300 group/btn"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5 text-verdant-gold group-hover/btn:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
