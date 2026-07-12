"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart, CreditCard, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductData } from "../../services/productListing";
import ProductPrice from "../global/ProductPrice";

interface ProductActionsProps {
  product: ProductData;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("aurum_wishlist") || "[]");
      setIsWishlisted(wishlist.includes(product._id));
    } catch (e) {
      // Ignored
    }
  }, [product._id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleWishlistToggle = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("aurum_wishlist") || "[]");
      let updated;
      if (isWishlisted) {
        updated = wishlist.filter((id: string) => id !== product._id);
        showToast("Removed from Wishlist");
      } else {
        updated = [...wishlist, product._id];
        showToast("Added to Wishlist");
      }
      localStorage.setItem("aurum_wishlist", JSON.stringify(updated));
      setIsWishlisted(!isWishlisted);
    } catch (e) {
      // Ignored
    }
  };

  const addToCart = (quantity: number) => {
    try {
      const cartStr = localStorage.getItem("aurum_cart") || "[]";
      let cart = JSON.parse(cartStr);

      const existingIndex = cart.findIndex((item: any) => item.product === product._id);
      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({ product: product._id, quantity });
      }

      localStorage.setItem("aurum_cart", JSON.stringify(cart));
      showToast(`Added ${quantity} item${quantity > 1 ? "s" : ""} to Bag`);
    } catch (e) {
      showToast("Could not update bag");
    }
  };

  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col gap-4 text-left select-none relative">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#0F4C3A] text-white border border-verdant-gold/30 px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl text-[10px] tracking-widest font-bold uppercase"
          >
            <Check className="w-4 h-4 text-verdant-gold" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Status details */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${outOfStock ? "bg-red-600 animate-pulse" : "bg-emerald-600 animate-pulse"}`} />
        <span className="text-[10px] tracking-widest font-bold uppercase text-verdant-emerald/60">
          {outOfStock ? "Unavailable (Out of Stock)" : `In Stock (Only ${product.stock} units left)`}
        </span>
      </div>

      {/* Quantity adjustment & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        {/* Quantity Select widget */}
        {!outOfStock && (
          <div className="flex items-center border border-verdant-emerald/10 bg-white/40 rounded-full px-2 py-1 h-12">
            <button
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-verdant-emerald hover:bg-verdant-emerald/5 hover:scale-105 active:scale-95 transition-all text-sm font-bold"
            >
              -
            </button>
            <span className="w-10 text-center font-bold text-xs text-verdant-emerald">
              {qty}
            </span>
            <button
              onClick={() => setQty((prev) => Math.min(product.stock, prev + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-verdant-emerald hover:bg-verdant-emerald/5 hover:scale-105 active:scale-95 transition-all text-sm font-bold"
            >
              +
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex-1 flex gap-3">
          <button
            onClick={() => addToCart(qty)}
            disabled={outOfStock}
            className={`flex-1 hover-target px-8 py-3 h-12 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              outOfStock
                ? "bg-verdant-emerald/5 border border-verdant-emerald/10 text-verdant-emerald/30 cursor-not-allowed"
                : "glass-effect hover:bg-verdant-emerald/5 border border-verdant-emerald/15 text-verdant-emerald active:scale-95"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add To Bag
          </button>

          <button
            onClick={() => {
              addToCart(qty);
              showToast("Opening Secure Checkout Portal...");
            }}
            disabled={outOfStock}
            className={`flex-1 hover-target px-8 py-3 h-12 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              outOfStock
                ? "bg-verdant-gold/10 text-verdant-gold/30 cursor-not-allowed"
                : "gold-gradient-bg text-black hover:scale-103 active:scale-95"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Buy Now
          </button>

          <button
            onClick={handleWishlistToggle}
            className="w-12 h-12 rounded-full border border-verdant-emerald/10 bg-white/40 flex items-center justify-center text-verdant-emerald hover:text-red-500 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-xs"
            aria-label="Toggle Wishlist"
          >
            <Heart
              className={`w-4.5 h-4.5 ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
