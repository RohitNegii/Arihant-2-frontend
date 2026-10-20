"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Sparkles, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "../../utils/api";
import { ProductData } from "../../services/productListing";
import ProductPrice from "../global/ProductPrice";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

interface ProductCardProps {
  product: ProductData;
  isListView?: boolean;
  onQuickView?: (product: ProductData) => void;
}

export default function ProductCard({
  product,
  isListView = false,
  onQuickView,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart, setCartOpen } = useCartStore();

  const productLink = `/products/${product.slug}`;
  const outOfStock = product.hasVariants
    ? (product.variants?.every((v) => v.stock <= 0) ?? true)
    : (product.stock ?? 0) <= 0;

  const displayPrice = product.hasVariants
    ? (product.variants && product.variants.length > 0
        ? Math.min(...product.variants.map((v) => v.price))
        : 0)
    : (product.price ?? 0);

  const displayDiscountPrice = product.discountPrice ?? (
    product.hasVariants && product.variants && product.variants.length > 0
      ? (product.variants.some((v) => v.discountPrice !== undefined)
          ? Math.min(...product.variants.map((v) => v.discountPrice ?? v.price))
          : undefined)
      : undefined
  );

  const discountPercent =
    displayDiscountPrice && displayPrice > displayDiscountPrice
      ? Math.round(((displayPrice - displayDiscountPrice) / displayPrice) * 100)
      : 0;

  // Primary and secondary image for Swarovski/Palmonas-style hover crossfade
  const primaryImg = product.thumbnail || product.images?.[0] || "";
  const secondaryImg = product.images?.[1] || "";
  const hasSecondary = Boolean(secondaryImg && secondaryImg !== primaryImg && !isVideoUrl(secondaryImg));

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants or sizes, open Quick View modal so user can choose
    if (
      (product.hasVariants && product.variants && product.variants.length > 1) ||
      (product.sizes && product.sizes.length > 0)
    ) {
      if (onQuickView) {
        onQuickView(product);
      }
      return;
    }

    if (outOfStock) return;

    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) {
      toast.info("Please sign in to add pieces to your bag");
      return;
    }

    setIsAdding(true);
    try {
      const success = await addToCart(product._id, 1);
      if (success) {
        toast.success(`${product.name} added to your bag`);
        setCartOpen(true);
      } else {
        toast.error("Could not add piece to bag. Please try again.");
      }
    } catch {
      toast.error("Could not add piece to bag.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  if (isListView) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="glass-card rounded-2xl md:rounded-3xl overflow-hidden border border-verdant-emerald/5 hover:border-verdant-gold/40 flex flex-col md:flex-row gap-6 p-5 sm:p-6 shadow-[0_4px_25px_rgba(var(--color-primary-rgb),0.02)] hover:shadow-[0_20px_45px_rgba(var(--color-primary-rgb),0.08)] transition-all duration-500 ease-out w-full group text-left relative"
      >
        {/* Subtle shimmer */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />

        {/* Image Frame */}
        <Link
          href={productLink}
          className="relative w-full md:w-64 aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-b from-white/80 to-verdant-cream/60 flex items-center justify-center p-4 border border-verdant-emerald/[0.04] shrink-0"
        >
          {isVideoUrl(primaryImg) ? (
            <video
              src={getImageUrl(primaryImg)}
              className="object-cover w-full h-full scale-100 group-hover:scale-105 transition-transform duration-700 ease-out rounded-lg"
              muted
              playsInline
              autoPlay
              loop
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={getImageUrl(primaryImg)}
                alt={product.name}
                className={`object-cover w-full h-full rounded-lg transition-all duration-700 ease-out ${
                  hasSecondary && isHovered ? "opacity-0 scale-95" : "opacity-100 scale-100 group-hover:scale-105"
                }`}
                loading="lazy"
              />
              {hasSecondary && (
                <img
                  src={getImageUrl(secondaryImg)}
                  alt={`${product.name} detail view`}
                  className={`absolute inset-0 object-cover w-full h-full rounded-lg transition-all duration-700 ease-out ${
                    isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {product.isBestSeller && (
              <span className="bg-verdant-emerald border border-verdant-gold/40 text-verdant-cream text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-verdant-gold" /> Bestseller
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-verdant-gold text-black text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            {outOfStock && (
              <span className="bg-verdant-danger text-white text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
                Out of Stock
              </span>
            )}
          </div>
        </Link>

        {/* Card Content */}
        <div className="flex-1 flex flex-col justify-between py-1 z-20">
          <div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-verdant-gold font-bold font-mono">
                  {product.category?.name || "Bespoke Jewelry"}
                </span>
                <h4 className="font-serif text-xl md:text-2xl text-verdant-emerald font-light mt-1 hover:text-verdant-gold transition-colors duration-300">
                  <Link href={productLink}>{product.name}</Link>
                </h4>
              </div>
            </div>

            <p className="text-verdant-emerald/70 text-xs font-light leading-relaxed tracking-wide my-3 line-clamp-2 md:line-clamp-3">
              {product.shortDescription || product.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] uppercase tracking-wider font-semibold text-verdant-emerald/60">
              {product.material && <span>{product.material} ({product.purity || "Certified"})</span>}
              {product.gender && <span>• Styling: {product.gender}</span>}
              {product.sku && <span>• SKU: {product.sku}</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-verdant-emerald/5">
            <ProductPrice price={displayPrice} discountPrice={displayDiscountPrice} />

            <div className="flex items-center gap-2">
              {onQuickView && (
                <button
                  type="button"
                  onClick={handleQuickViewClick}
                  className="px-4 py-2.5 rounded-full border border-verdant-emerald/15 hover:border-verdant-gold text-verdant-emerald text-[9px] tracking-widest uppercase font-bold flex items-center gap-1.5 transition-all active:scale-95 bg-white/40"
                >
                  <Eye className="w-3.5 h-3.5 text-verdant-gold" /> Quick View
                </button>
              )}
              <Link
                href={productLink}
                className="gold-gradient-bg text-black hover:scale-102 active:scale-95 text-[9px] tracking-widest uppercase font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all"
              >
                View Piece
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
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
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden border border-verdant-emerald/5 hover:border-verdant-gold/40 flex flex-col h-full shadow-[0_4px_20px_rgba(var(--color-primary-rgb),0.02)] hover:shadow-[0_20px_45px_rgba(var(--color-primary-rgb),0.08)] hover:-translate-y-1.5 transition-all duration-500 ease-out group text-left relative"
    >
      {/* Subtle premium shimmer line */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />

      {/* Product Image Window */}
      <div className="w-full aspect-square overflow-hidden relative bg-gradient-to-b from-white/70 via-verdant-cream/40 to-verdant-emerald/[0.02] flex items-center justify-center p-4 sm:p-6 border-b border-verdant-emerald/[0.04]">
        <Link href={productLink} className="relative w-full h-full flex items-center justify-center">
          {isVideoUrl(primaryImg) ? (
            <video
              src={getImageUrl(primaryImg)}
              className="object-cover w-full h-full scale-100 group-hover:scale-105 transition-transform duration-700 ease-out rounded-xl"
              muted
              playsInline
              autoPlay
              loop
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Primary Image */}
              <img
                src={getImageUrl(primaryImg)}
                alt={product.name}
                className={`object-cover w-full h-full rounded-xl transition-all duration-700 ease-out ${
                  hasSecondary && isHovered ? "opacity-0 scale-95" : "opacity-100 scale-100 group-hover:scale-105"
                }`}
                loading="lazy"
              />

              {/* Secondary Image crossfade on hover (Swarovski/Palmonas style) */}
              {hasSecondary && (
                <img
                  src={getImageUrl(secondaryImg)}
                  alt={`${product.name} on model or alternate angle`}
                  className={`absolute inset-0 object-cover w-full h-full rounded-xl transition-all duration-700 ease-out ${
                    isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  loading="lazy"
                />
              )}
            </div>
          )}
        </Link>

        {/* Absolute Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-verdant-emerald border border-verdant-gold/40 text-verdant-cream text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-verdant-gold" /> Bestseller
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-verdant-gold text-black text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {outOfStock && (
            <span className="bg-verdant-danger text-white text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Hover Action Overlay Bar (Swarovski/Palmonas style sliding pill) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-20 pointer-events-none group-hover:pointer-events-auto">
          {onQuickView && (
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="flex-1 bg-verdant-cream/95 backdrop-blur-md border border-verdant-gold/40 hover:border-verdant-gold text-verdant-emerald hover:text-black py-2.5 px-3 rounded-full text-[8px] sm:text-[9px] tracking-widest font-bold uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-verdant-gold" /> Quick View
            </button>
          )}

          {!outOfStock && (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="bg-verdant-emerald hover:bg-verdant-emerald/90 text-verdant-cream py-2.5 px-3 rounded-full text-[8px] sm:text-[9px] tracking-widest font-bold uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-verdant-gold/30 shrink-0"
              title="Add to Bag"
              aria-label="Add to Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-verdant-gold" />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between z-20">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-verdant-gold font-bold font-mono">
              {product.category?.name || "Bespoke Jewelry"}
            </span>
            {product.purity && (
              <span className="text-[8px] uppercase tracking-wider text-verdant-emerald/50 font-mono">
                {product.purity}
              </span>
            )}
          </div>

          <h4 className="font-serif text-sm sm:text-base text-verdant-emerald font-light mt-1.5 leading-snug hover:text-verdant-gold transition-colors duration-300 line-clamp-1">
            <Link href={productLink}>{product.name}</Link>
          </h4>

          <p className="text-verdant-emerald/65 text-[11px] font-light leading-relaxed tracking-wide mt-2 line-clamp-2">
            {product.shortDescription || product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-verdant-emerald/5">
          <ProductPrice
            price={displayPrice}
            discountPrice={displayDiscountPrice}
            className="text-xs sm:text-sm font-medium"
          />

          <Link
            href={productLink}
            className="text-[9px] tracking-widest uppercase font-bold text-verdant-emerald hover:text-verdant-gold flex items-center gap-1 transition-colors duration-300 group/link shrink-0 py-1"
          >
            Explore
            <ArrowRight className="w-3 h-3 text-verdant-gold group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
