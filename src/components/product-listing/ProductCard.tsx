"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "../../utils/api";
import { ProductData } from "../../services/productListing";
import ProductPrice from "../global/ProductPrice";

interface ProductCardProps {
  product: ProductData;
  isListView?: boolean;
}

export default function ProductCard({ product, isListView = false }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);

  const productLink = `/products/${product.slug}`;
  const outOfStock = product.stock <= 0;

  if (isListView) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl overflow-hidden border border-verdant-emerald/5 hover:border-verdant-gold/20 flex flex-col md:flex-row gap-6 p-6 shadow-xs hover:shadow-[0_12px_24px_rgba(15,76,58,0.04)] transition-all duration-300 w-full group text-left"
      >
        {/* Image Frame */}
        <Link
          href={productLink}
          className="relative w-full md:w-64 aspect-square rounded-2xl overflow-hidden bg-verdant-emerald/5 flex items-center justify-center p-4"
        >
          <img
            src={getImageUrl(product.thumbnail || product.images[0])}
            alt={product.name}
            className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.isBestSeller && (
            <span className="absolute top-3 left-3 bg-verdant-emerald text-verdant-cream text-[7px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-verdant-gold" /> Best Seller
            </span>
          )}
          {outOfStock && (
            <span className="absolute top-3 left-3 bg-red-800 text-white text-[7px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </Link>

        {/* Card Content */}
        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono">
                  {product.category?.name || "Jewelry"}
                </span>
                <h4 className="font-serif text-lg md:text-xl text-verdant-emerald font-light mt-1 hover:text-verdant-gold transition-colors duration-200">
                  <Link href={productLink}>{product.name}</Link>
                </h4>
              </div>
            </div>
            <p className="text-verdant-emerald/65 text-xs font-light leading-relaxed tracking-wide my-4 line-clamp-3">
              {product.shortDescription || product.description}
            </p>
            <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold">
              <span className="text-verdant-emerald/50">SKU: {product.sku}</span>
              <span className="text-verdant-emerald/50">|</span>
              <span className="text-verdant-emerald/50">Material: {product.material} ({product.purity})</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-verdant-emerald/5">
            <ProductPrice price={product.price} />
            <Link
              href={productLink}
              className="gold-gradient-bg text-black hover:scale-105 active:scale-95 text-[9px] tracking-widest uppercase font-bold px-6 py-3 rounded-full flex items-center gap-1.5 shadow-xs transition-all duration-300"
            >
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setShowQuickView(true)}
      onMouseLeave={() => setShowQuickView(false)}
      className="glass-card rounded-3xl overflow-hidden border border-verdant-emerald/5 hover:border-verdant-gold/25 flex flex-col h-full shadow-xs hover:shadow-[0_15px_30px_rgba(15,76,58,0.05)] hover:-translate-y-1.5 transition-all duration-300 group text-left relative"
    >
      {/* Product Image Window */}
      <Link
        href={productLink}
        className="w-full aspect-square overflow-hidden relative bg-verdant-emerald/5 flex items-center justify-center p-4"
      >
        <img
          src={getImageUrl(product.thumbnail || product.images[0])}
          alt={product.name}
          className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Absolute Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isBestSeller && (
            <span className="bg-verdant-emerald text-verdant-cream text-[7px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-verdant-gold" /> Best Seller
            </span>
          )}
          {outOfStock && (
            <span className="bg-red-800 text-white text-[7px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick View Button Hover overlay */}
        <div
          className={`absolute inset-0 bg-verdant-emerald/5 backdrop-blur-xs flex items-center justify-center gap-3 transition-opacity duration-300 ${
            showQuickView ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-[#F8F4EA] text-verdant-emerald w-10 h-10 rounded-full flex items-center justify-center hover:text-verdant-gold hover:scale-105 transition-all shadow-md">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Card Content Area */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono">
              {product.category?.name || "Jewelry"}
            </span>
          </div>

          <h4 className="font-serif text-base md:text-lg text-verdant-emerald font-light mt-1.5 leading-tight hover:text-verdant-gold transition-colors duration-200 line-clamp-1">
            <Link href={productLink}>{product.name}</Link>
          </h4>

          <p className="text-verdant-emerald/65 text-[11px] font-light leading-relaxed tracking-wide mt-3 line-clamp-2">
            {product.shortDescription || product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-verdant-emerald/5">
          <ProductPrice price={product.price} />
          <Link
            href={productLink}
            className="hover-target text-[9px] tracking-widest uppercase font-bold text-verdant-emerald hover:text-verdant-gold flex items-center gap-1 transition-colors duration-300"
          >
            Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
