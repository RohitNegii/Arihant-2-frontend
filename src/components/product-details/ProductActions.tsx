"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductData } from "../../services/productListing";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

interface ProductActionsProps {
  product: ProductData;
  selectedSize: string;
  selectedVariant?: string;
}

export default function ProductActions({
  product,
  selectedSize,
  selectedVariant,
}: ProductActionsProps) {
  const [qty, setQty] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { addToCart: addToCartContext, setCartOpen } = useCartStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToBag = async (quantity: number) => {
    const hasSizes = (product.sizes && product.sizes.length > 0) || product.allowCustomSize;
    if (hasSizes && !selectedSize) {
      showToast("Please select a size before adding to bag");
      return;
    }

    if (product.hasVariants && !selectedVariant) {
      showToast("Please select a variety option before adding to bag");
      return;
    }

    if (!isAuthenticated) {
      openAuthModal("login", () => handleAddToBag(quantity));
      return;
    }

    try {
      const success = await addToCartContext(
        product._id,
        quantity,
        selectedSize || undefined,
        selectedVariant || undefined
      );
      if (success) {
        showToast(`Added ${quantity} piece${quantity > 1 ? "s" : ""} to Bag`);
        setCartOpen(true);
      } else {
        showToast("Could not update bag");
      }
    } catch {
      showToast("Could not update bag");
    }
  };

  const selectedVariantData = product.hasVariants && selectedVariant
    ? product.variants?.find((v) => v.name === selectedVariant)
    : null;
  const currentStock = selectedVariantData ? selectedVariantData.stock : (product.stock ?? 0);
  const outOfStock = currentStock <= 0;

  return (
    <div className="flex flex-col gap-4 text-left select-none relative">
      {/* Toast Notification Alert (Portaled to document.body below the header to prevent stacking context clipping) */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[99999] max-w-[90vw] bg-verdant-emerald text-white border border-verdant-gold/40 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full flex items-center gap-2.5 shadow-2xl text-[10px] tracking-widest font-bold uppercase backdrop-blur-md pointer-events-none"
            >
              {toastMessage.includes("Please select") ? (
                <AlertCircle className="w-4 h-4 text-verdant-gold shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-verdant-gold shrink-0" />
              )}
              <span className="truncate">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Stock Status details */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            outOfStock ? "bg-verdant-danger animate-pulse" : "bg-verdant-success animate-pulse"
          }`}
        />
        <span className="text-[10px] tracking-[0.15em] font-bold uppercase font-mono text-verdant-emerald/70">
          {outOfStock
            ? "Currently Unavailable (Out of Stock)"
            : currentStock <= 5
            ? `Limited Edition • Only ${currentStock} pieces remaining`
            : `In Stock • Certified Piece`}
        </span>
      </div>

      {/* Quantity adjustment & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        {/* Quantity Select widget */}
        {!outOfStock && (
          <div className="flex items-center justify-between border border-verdant-emerald/15 bg-white/60 rounded-full px-2 py-1 h-12 shrink-0 sm:w-32 shadow-xs">
            <button
              type="button"
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-verdant-emerald hover:bg-verdant-emerald/10 active:scale-90 transition-all text-base font-bold cursor-pointer"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center font-bold text-xs text-verdant-emerald font-mono">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((prev) => Math.min(currentStock, prev + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-verdant-emerald hover:bg-verdant-emerald/10 active:scale-90 transition-all text-base font-bold cursor-pointer"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="flex-1">
          <button
            type="button"
            onClick={() => handleAddToBag(qty)}
            disabled={outOfStock}
            className={`w-full px-8 py-3.5 h-12 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-sm cursor-pointer ${
              outOfStock
                ? "bg-verdant-emerald/5 border border-verdant-emerald/10 text-verdant-emerald/30 cursor-not-allowed"
                : "bg-verdant-emerald hover:bg-verdant-emerald/90 border border-verdant-gold/40 text-verdant-cream active:scale-98 shadow-md"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-verdant-gold" />
            Add To Bag
          </button>
        </div>
      </div>
    </div>
  );
}
