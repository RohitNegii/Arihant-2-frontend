"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Plus, Minus, RefreshCw, AlertCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";
import { getImageUrl } from "../../utils/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const formatPrice = (val: number) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const handleUpdateQty = async (productId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    setLocalUpdatingId(productId);
    try {
      await updateCartQuantity(productId, newQty);
    } catch (e) {
      console.error(e);
    } finally {
      setLocalUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setLocalUpdatingId(productId);
    try {
      await removeFromCart(productId);
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

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs select-none cursor-pointer"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-150 w-full sm:max-w-md bg-verdant-cream/95 backdrop-blur-md border-l border-verdant-emerald/5 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.15)] text-verdant-emerald"
          >
            {/* Header */}
            <div className="p-6 border-b border-verdant-emerald/5 flex justify-between items-center bg-[#F8F4EA]/80 backdrop-blur-xs">
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
                className="w-8 h-8 rounded-full border border-verdant-emerald/10 bg-white/40 flex items-center justify-center text-verdant-emerald/65 hover:text-verdant-emerald hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
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
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    className="flex gap-4 p-4 rounded-2xl border border-verdant-emerald/5 bg-white/20 animate-pulse"
                  >
                    <div className="w-20 h-20 rounded-xl bg-verdant-emerald/10 shrink-0" />
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
                    className="mt-8 hover-target border border-verdant-emerald/15 hover:border-verdant-gold text-verdant-emerald px-8 py-3 rounded-full text-[10px] tracking-widest uppercase font-bold transition-all bg-white/40 hover:bg-white active:scale-95 cursor-pointer shadow-xs"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                // Cart Items list
                cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const isUpdating = localUpdatingId === product._id;

                  return (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex gap-4 p-4 rounded-2xl border border-verdant-emerald/5 hover:border-verdant-gold/15 bg-white/40 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative group"
                    >
                      {/* Image wrapper */}
                      <div className="w-20 h-20 rounded-xl bg-verdant-emerald/5 border border-verdant-emerald/5 p-2 shrink-0 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={getImageUrl(product.thumbnail || product.images?.[0])}
                          alt={product.name}
                          className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content details */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="pr-6">
                          <h4 className="font-serif text-sm text-verdant-emerald font-semibold leading-snug line-clamp-1 group-hover:text-verdant-gold transition-colors duration-200">
                            <Link href={`/products/${product.slug}`} onClick={() => setCartOpen(false)}>
                              {product.name}
                            </Link>
                          </h4>
                          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-mono text-verdant-emerald/40 mt-1 font-bold">
                            <span>SKU: {product.sku}</span>
                            {product.stock <= 5 && (
                              <span className="text-red-700 bg-red-500/10 px-1.5 py-0.5 rounded-sm ml-1 font-sans font-bold">
                                Only {product.stock} left
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          {/* Price */}
                          <div className="text-xs font-bold text-verdant-gold font-mono">
                            {formatPrice(product.price * item.quantity)}
                          </div>

                          {/* Quantity Counter controls */}
                          <div className="flex items-center border border-verdant-emerald/10 bg-white/60 rounded-full px-1.5 py-0.5 shadow-2xs">
                            <button
                              onClick={() => handleUpdateQty(product._id, item.quantity, -1)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-verdant-emerald/60 hover:text-verdant-emerald disabled:opacity-30 cursor-pointer"
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
                              onClick={() => handleUpdateQty(product._id, item.quantity, 1)}
                              disabled={item.quantity >= product.stock || isUpdating}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-verdant-emerald/60 hover:text-verdant-emerald disabled:opacity-30 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(product._id)}
                        disabled={isUpdating}
                        className="absolute top-4 right-4 text-verdant-emerald/30 hover:text-red-600 active:scale-95 hover:bg-red-500/5 p-1.5 rounded-full transition-colors cursor-pointer"
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
              <div className="p-6 border-t border-verdant-emerald/5 bg-[#F8F4EA]/80 backdrop-blur-xs flex flex-col gap-4">
                {/* Subtotal row */}
                <div className="flex justify-between items-center select-none">
                  <span className="text-[10px] tracking-widest text-verdant-emerald/60 uppercase font-bold">
                    Order Subtotal
                  </span>
                  <span className="font-serif text-lg font-semibold text-verdant-emerald font-mono">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <p className="text-[9px] text-verdant-emerald/50 leading-normal font-semibold">
                  Taxes, customs duties, and fully-insured luxury express shipping will be calculated at checkout checkout.
                </p>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || isLoading}
                  className="w-full gold-gradient-bg text-black hover:scale-102 active:scale-98 text-[9px] tracking-widest uppercase font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50 mt-2 font-mono"
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
    </AnimatePresence>
  );
}
