"use client";

import { useState } from "react";
import { ShoppingCart, CreditCard, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductData } from "../../services/productListing";
import ProductPrice from "../global/ProductPrice";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

interface ProductActionsProps {
  product: ProductData;
  selectedSize: string;
  selectedVariant?: string;
}

export default function ProductActions({ product, selectedSize, selectedVariant }: ProductActionsProps) {
  const [qty, setQty] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      const success = await addToCartContext(product._id, quantity, selectedSize || undefined, selectedVariant || undefined);
      if (success) {
        showToast(`Added ${quantity} item${quantity > 1 ? "s" : ""} to Bag`);
        setCartOpen(true);
      } else {
        showToast("Could not update bag");
      }
    } catch (e) {
      showToast("Could not update bag");
    }
  };

  const handleBuyNow = async (quantity: number) => {
    const hasSizes = (product.sizes && product.sizes.length > 0) || product.allowCustomSize;
    if (hasSizes && !selectedSize) {
      showToast("Please select a size before checkout");
      return;
    }

    if (product.hasVariants && !selectedVariant) {
      showToast("Please select a variety option before checkout");
      return;
    }

    if (!isAuthenticated) {
      openAuthModal("login", () => handleBuyNow(quantity));
      return;
    }

    try {
      const success = await addToCartContext(product._id, quantity, selectedSize || undefined, selectedVariant || undefined);
      if (success) {
        setCartOpen(true);
      } else {
        showToast("Could not update bag");
      }
    } catch (e) {
      showToast("Could not update bag");
    }
  };

  const selectedVariantData = product.hasVariants && selectedVariant
    ? product.variants?.find(v => v.name === selectedVariant)
    : null;
  const currentStock = selectedVariantData ? selectedVariantData.stock : (product.stock ?? 0);
  const outOfStock = currentStock <= 0;

  return (
    <div className="flex flex-col gap-4 text-left select-none relative">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-verdant-emerald text-white border border-verdant-gold/30 px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl text-[10px] tracking-widest font-bold uppercase"
          >
            <Check className="w-4 h-4 text-verdant-gold" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Stock Status details */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${outOfStock ? "bg-verdant-danger animate-pulse" : "bg-verdant-success animate-pulse"}`} />
        <span className="text-[10px] tracking-widest font-bold uppercase text-verdant-emerald/60">
          {outOfStock ? "Unavailable (Out of Stock)" : `In Stock (Only ${currentStock} units left)`}
        </span>
      </div>
 
      {/* Quantity adjustment & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        {/* Quantity Select widget */}
        {!outOfStock && (
          <div className="flex items-center border border-verdant-emerald/10 bg-white/40 rounded-full px-2 py-1 h-12">
            <button
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-verdant-emerald hover:bg-verdant-emerald/5 hover:scale-105 active:scale-95 transition-all text-sm font-bold cursor-pointer"
            >
              -
            </button>
            <span className="w-10 text-center font-bold text-xs text-verdant-emerald">
              {qty}
            </span>
            <button
              onClick={() => setQty((prev) => Math.min(currentStock, prev + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-verdant-emerald hover:bg-verdant-emerald/5 hover:scale-105 active:scale-95 transition-all text-sm font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex-1 flex gap-3">
          <button
            onClick={() => handleAddToBag(qty)}
            disabled={outOfStock}
            className={`flex-1 hover-target px-8 py-3 h-12 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer ${
              outOfStock
                ? "bg-verdant-emerald/5 border border-verdant-emerald/10 text-verdant-emerald/30 cursor-not-allowed"
                : "glass-effect hover:bg-verdant-emerald/5 border border-verdant-emerald/15 text-verdant-emerald active:scale-95"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add To Bag
          </button>

          <button
            onClick={() => handleBuyNow(qty)}
            disabled={outOfStock}
            className={`flex-1 hover-target px-8 py-3 h-12 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer ${
              outOfStock
                ? "bg-verdant-gold/10 text-verdant-gold/30 cursor-not-allowed"
                : "gold-gradient-bg text-black hover:scale-103 active:scale-95"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
