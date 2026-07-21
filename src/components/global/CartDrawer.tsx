"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Plus, Minus, RefreshCw, AlertCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";
import { getImageUrl } from "../../utils/api";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScrollStore } from "../../store/scroll-store";

export default function CartDrawer() {
  const router = useRouter();
  const {
    cartItems,
    isLoading,
    error,
    isCartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    fetchCart,
    cartTotal,
    cartCount,
  } = useCartStore();

  const [localUpdatingId, setLocalUpdatingId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const { lenis } = useScrollStore();

  // Lock body scroll when cart drawer is open to prevent parent page scroll bleed
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "unset";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "unset";
      lenis?.start();
    };
  }, [isCartOpen, lenis]);

  const formatPrice = (val: number) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const handleUpdateQty = async (productId: string, currentQty: number, change: number, size?: string, variant?: string) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    setLocalUpdatingId(`${productId}-${size || ""}-${variant || ""}`);
    try {
      await updateCartQuantity(productId, newQty, size, variant);
    } catch (e) {
      console.error(e);
    } finally {
      setLocalUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId: string, size?: string, variant?: string) => {
    setLocalUpdatingId(`${productId}-${size || ""}-${variant || ""}`);
    try {
      await removeFromCart(productId, size, variant);
    } catch (e) {
      console.error(e);
    } finally {
      setLocalUpdatingId(null);
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    router.push("/checkout");
  };

  return <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-100 bg-[#0F4C3A]/30 backdrop-blur-xs select-none cursor-pointer"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-150 w-full sm:max-w-md bg-[#FAF7F2] border-l border-verdant-emerald/10 flex flex-col shadow-[-10px_0_50px_rgba(15,76,58,0.08)] text-verdant-emerald"
          >
            {/* Header */}
            <div className="p-6 border-b border-verdant-emerald/10 flex justify-between items-center bg-[#FAF7F2]">
              <div>
                <h3 className="font-serif text-xl tracking-wider text-verdant-emerald font-light flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-verdant-gold" />
                  Your Bag
                </h3>
                <p className="text-[10px] tracking-widest text-verdant-emerald/50 uppercase font-bold mt-1">
                  {cartCount} {cartCount === 1 ? "item" : "items"} selected
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full border border-verdant-emerald/10 bg-white/60 flex items-center justify-center text-verdant-emerald/65 hover:text-verdant-emerald hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider">Loading Error</p>
                  <p className="text-[11px] text-red-800/80 mt-1 font-semibold leading-relaxed">{error}</p>
                  <button
                    onClick={fetchCart}
                    className="text-[9px] uppercase tracking-widest font-mono font-bold text-verdant-gold hover:underline mt-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin-hover" /> Retry Connection
                  </button>
                </div>
              </div>
            )}

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" data-lenis-prevent>
              {checkoutSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-600">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      <ShoppingCart className="w-8 h-8" />
                    </motion.div>
                  </div>
                  <h4 className="font-serif text-2xl font-light tracking-wide text-verdant-emerald">
                    Order Initiated!
                  </h4>
                  <p className="text-xs text-verdant-emerald/60 mt-3 max-w-xs leading-relaxed">
                    We are redirecting you to our secure payment gateway. Thank you for choosing VERDANT.
                  </p>
                </div>
              ) : isLoading && cartItems.length === 0 ? (
                // Skeleton Screen loaders
                Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-3xl border border-verdant-emerald/5 bg-white/20 animate-pulse"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-verdant-emerald/10 shrink-0" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-3.5 bg-verdant-emerald/10 rounded-sm w-3/4" />
                      <div className="h-3 bg-verdant-emerald/10 rounded-sm w-1/2" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-4 bg-verdant-emerald/10 rounded-sm w-1/4" />
                        <div className="h-6 bg-verdant-emerald/10 rounded-full w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : cartItems.length === 0 ? (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-16 h-16 rounded-full bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center mb-6 text-verdant-gold">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif text-xl font-light tracking-wide text-verdant-emerald">
                    Your bag is empty
                  </h4>
                  <p className="text-xs text-verdant-emerald/50 mt-2 max-w-xs leading-relaxed">
                    Explore our botanical diamond selections and add your custom sizes to create a unique heritage look.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-8 hover-target border border-verdant-emerald/20 hover:border-verdant-gold text-verdant-emerald hover:text-white px-8 py-3 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold transition-all bg-transparent hover:bg-verdant-emerald active:scale-95 cursor-pointer shadow-xs"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                // Cart Items list
                cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const isUpdating = localUpdatingId === `${product._id}-${item.size || ""}-${item.variant || ""}`;

                  let itemPrice = product.price ?? 0;
                  let itemStock = product.stock ?? 0;
                  if (product.hasVariants && item.variant) {
                    const variant = product.variants?.find(
                      (v: any) => v.name.toLowerCase() === item.variant?.toLowerCase()
                    );
                    if (variant) {
                      itemPrice = variant.price;
                      itemStock = variant.stock;
                    }
                  }

                  return (
                    <motion.div
                      key={`${product._id}-${item.size || ""}-${item.variant || ""}`}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex gap-4 p-4 rounded-3xl border border-verdant-emerald/10 hover:border-verdant-gold bg-white/60 hover:bg-white shadow-[0_4px_20px_rgba(15,76,58,0.02)] hover:shadow-[0_10px_30px_rgba(15,76,58,0.06)] hover:-translate-y-0.5 transition-all duration-300 relative group"
                    >
                      {/* Image wrapper */}
                      <div className="w-20 h-20 rounded-2xl bg-[#FAF7F2] border border-verdant-emerald/10 p-2 shrink-0 flex items-center justify-center relative overflow-hidden group-hover:border-verdant-gold transition-colors duration-300">
                        {isVideoUrl(product.thumbnail || product.images?.[0]) ? (
                          <video
                            src={getImageUrl(product.thumbnail || product.images?.[0])}
                            className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-500"
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        ) : (
                          <img
                            src={getImageUrl(product.thumbnail || product.images?.[0])}
                            alt={product.name}
                            className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="pr-6">
                          <h4 className="font-serif text-sm text-verdant-emerald font-semibold leading-snug line-clamp-1 group-hover:text-verdant-gold transition-colors duration-200">
                            <Link href={`/products/${product.slug}`} onClick={() => setCartOpen(false)}>
                              {product.name}
                            </Link>
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 text-[8px] uppercase tracking-widest font-mono text-verdant-emerald/40 mt-1 font-bold">
                            <span>SKU: {product.sku}</span>
                            {item.size && (
                              <span className="text-verdant-gold font-bold ml-1.5">
                                Size: {item.size}
                              </span>
                            )}
                            {item.variant && (
                              <span className="text-verdant-gold font-bold ml-1.5">
                                Option: {item.variant}
                              </span>
                            )}
                            {itemStock <= 5 && (
                              <span className="text-red-700 bg-red-500/10 px-1.5 py-0.5 rounded-sm ml-1 font-sans font-bold">
                                Only {itemStock} left
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          {/* Price */}
                          <div className="text-xs font-bold text-verdant-gold font-mono">
                            {formatPrice(itemPrice * item.quantity)}
                          </div>

                          {/* Quantity Counter controls */}
                          <div className="flex items-center border border-verdant-emerald/20 bg-white rounded-full px-1.5 py-0.5 shadow-2xs group-hover:border-verdant-gold/40 transition-colors duration-300">
                            <button
                              onClick={() => handleUpdateQty(product._id, item.quantity, -1, item.size, item.variant)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-verdant-emerald/65 hover:text-verdant-emerald disabled:opacity-30 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-8 text-center text-[10px] font-bold text-verdant-emerald min-w-[20px] font-mono">
                              {isUpdating ? (
                                <RefreshCw className="w-2.5 h-2.5 animate-spin mx-auto text-verdant-gold" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(product._id, item.quantity, 1, item.size, item.variant)}
                              disabled={item.quantity >= itemStock || isUpdating}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-verdant-emerald/65 hover:text-verdant-emerald disabled:opacity-30 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(product._id, item.size, item.variant)}
                        disabled={isUpdating}
                        className="absolute top-4 right-4 text-verdant-emerald/30 hover:text-red-700 hover:bg-red-500/10 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && !checkoutSuccess && (
              <div className="p-6 border-t border-verdant-emerald/10 bg-[#FAF7F2] flex flex-col gap-4">
                {/* Subtotal row */}
                <div className="flex justify-between items-center select-none">
                  <span className="text-[10px] tracking-[0.2em] text-verdant-emerald/50 uppercase font-bold">
                    Order Subtotal
                  </span>
                  <span className="font-serif text-lg font-semibold text-verdant-emerald font-mono">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <p className="text-[9px] text-verdant-emerald/50 leading-normal font-semibold">
                  Taxes, customs duties, and fully-insured luxury express shipping will be calculated at checkout.
                </p>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || isLoading}
                  className="w-full bg-gradient-to-r from-verdant-gold via-[#e3cda4] to-verdant-gold text-verdant-emerald hover:text-white hover:shadow-[0_4px_25px_rgba(200,169,106,0.3)] active:scale-98 text-[10px] tracking-[0.2em] uppercase font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50 mt-2 font-mono"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SECURING CONNECTION...
                    </>
                  ) : (
                    <>
                      PROCEED TO SECURE CHECKOUT
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>;
}
