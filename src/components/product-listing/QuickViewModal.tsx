"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, ShieldCheck, Truck, Sparkles, Check, Crown, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductData } from "../../services/productListing";
import { getImageUrl } from "../../utils/api";
import ProductPrice from "../global/ProductPrice";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart, setCartOpen } = useCartStore();

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : product.thumbnail ? [product.thumbnail] : [];

  const activeImage = images[selectedImageIndex] || product.thumbnail || "";

  const outOfStock = product.hasVariants
    ? (product.variants?.every((v) => v.stock <= 0) ?? true)
    : (product.stock ?? 0) <= 0;

  const displayPrice = product.hasVariants
    ? (product.variants && product.variants.length > 0 ? Math.min(...product.variants.map((v) => v.price)) : 0)
    : (product.price ?? 0);

  const handleAddToCart = async () => {
    if (outOfStock) return;
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) {
      toast.info("Please sign in to add pieces to your bag");
      return;
    }
    setIsAdding(true);
    try {
      const success = await addToCart(
        product._id,
        1,
        selectedSize || undefined,
        selectedVariant || undefined
      );
      if (success) {
        toast.success(`${product.name} added to your bag`, {
          description: "Handcrafted luxury reserved in your shopping cart.",
        });
        setCartOpen(true);
        onClose();
      }
    } catch {
      toast.error("Failed to add piece to bag. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            style={{ touchAction: "none" }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--color-background)] rounded-3xl border border-verdant-emerald/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] z-10 flex flex-col md:flex-row text-left overflow-hidden custom-scrollbar"
            data-lenis-prevent
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full border border-verdant-emerald/10 bg-white/70 backdrop-blur-md flex items-center justify-center text-verdant-emerald hover:text-black hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Product Media Gallery */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 bg-gradient-to-b from-white/60 to-[var(--color-background)] flex flex-col justify-between border-b md:border-b-0 md:border-r border-verdant-emerald/5">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/40 border border-verdant-emerald/5 flex items-center justify-center p-4 group">
                <img
                  src={getImageUrl(activeImage)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-xl"
                />

                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                  {product.isFeatured && (
                    <span className="gold-gradient-bg text-black border border-verdant-gold/40 text-[8.5px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md font-mono">
                      <Crown className="w-2.5 h-2.5 text-black" /> Featured
                    </span>
                  )}
                  {product.isTrending && (
                    <span className="bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-400/40 text-amber-50 text-[8.5px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md font-mono">
                      <TrendingUp className="w-2.5 h-2.5 text-amber-200" /> Trending
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="bg-verdant-emerald border border-verdant-gold/30 text-verdant-cream text-[8.5px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md font-mono">
                      <Sparkles className="w-2.5 h-2.5 text-verdant-gold animate-pulse" /> Best Seller
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto py-1 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border transition-all shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? "border-verdant-gold ring-1 ring-verdant-gold shadow-xs"
                          : "border-verdant-emerald/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Actions */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Category & Stock pill */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-verdant-gold font-mono">
                    {product.category?.name || "Bespoke Jewelry"}
                  </span>
                  {outOfStock ? (
                    <span className="text-[9px] tracking-widest uppercase font-bold text-verdant-danger bg-verdant-danger/10 px-2.5 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-[9px] tracking-widest uppercase font-bold text-verdant-success bg-verdant-success/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> In Stock
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-verdant-emerald leading-tight mb-3">
                  {product.name}
                </h3>

                {/* Price Display */}
                <div className="mb-4">
                  <ProductPrice
                    price={displayPrice}
                    className="text-lg md:text-xl"
                  />
                  <span className="text-[9px] tracking-wider text-verdant-emerald/50 block mt-0.5">
                    Inclusive of all luxury taxes & duties
                  </span>
                </div>

                {/* Material / Attributes Pills */}
                <div className="flex flex-wrap gap-2 mb-4 text-[9px] tracking-widest uppercase font-bold">
                  {product.material && (
                    <span className="bg-verdant-emerald/5 border border-verdant-emerald/10 text-verdant-emerald px-2.5 py-1 rounded-lg">
                      {product.material} ({product.purity || "Hallmarked"})
                    </span>
                  )}
                  {product.gender && (
                    <span className="bg-verdant-emerald/5 border border-verdant-emerald/10 text-verdant-emerald px-2.5 py-1 rounded-lg">
                      Styling: {product.gender}
                    </span>
                  )}
                  {product.sku && (
                    <span className="bg-verdant-emerald/5 border border-verdant-emerald/10 text-verdant-emerald/60 px-2.5 py-1 rounded-lg">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-xs text-verdant-emerald/75 font-light leading-relaxed line-clamp-3 mb-6">
                  {product.shortDescription || product.description}
                </p>

                {/* Sizes Selection (if available) */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <span className="text-[9px] tracking-widest uppercase font-bold text-verdant-emerald block mb-2 font-mono">
                      Select Size
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-10 h-9 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            selectedSize === s
                              ? "bg-verdant-emerald text-white border-verdant-emerald shadow-xs"
                              : "border-verdant-emerald/15 text-verdant-emerald hover:border-verdant-gold"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions & Trust */}
              <div className="pt-6 border-t border-verdant-emerald/10 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={outOfStock || isAdding}
                    className="flex-1 gold-gradient-bg text-black active:scale-98 disabled:opacity-50 text-[10px] tracking-[0.2em] uppercase font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {isAdding ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Bag"}
                  </button>

                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="sm:shrink-0 border border-verdant-emerald/20 hover:border-verdant-emerald text-verdant-emerald text-[10px] tracking-[0.15em] uppercase font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-verdant-emerald/5"
                  >
                    Full Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Trust mini-strip */}
                <div className="grid grid-cols-2 gap-2 text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/60 pt-2 border-t border-verdant-emerald/5">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-verdant-gold shrink-0" /> BIS Hallmarked
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-verdant-gold shrink-0" /> Insured Delivery
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
