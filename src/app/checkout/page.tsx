"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Truck, Loader2, CreditCard, ArrowLeft, AlertCircle } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { createCheckoutOrderApi, AddressDetails } from "../../services/checkout";
import { getImageUrl } from "../../utils/api";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, cartTotal, isLoading: cartLoading, fetchCart } = useCartStore();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  // Check for error queries on mount/redirect
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(decodeURIComponent(err));
    }
  }, [searchParams]);

  // Address form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync user details to form
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // Load cart on mount and verify auth
  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    // If not authenticated, redirect to home
    if (isInitialized && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized]);

  // Pricing calculations (replicated from backend for UI preview only)
  const taxAmount = Math.round(cartTotal * 0.03); // 3% GST
  const shippingAmount = cartTotal > 15000 ? 0 : 250;
  const grandTotal = cartTotal + taxAmount + shippingAmount;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // 1. Call backend to create Order & Pending Payment
      const shippingAddress: AddressDetails = {
        name,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        phone
      };

      const checkoutRes = await createCheckoutOrderApi(shippingAddress);

      if (!checkoutRes.success || !checkoutRes.ccavenueData) {
        setError("Failed to initialize order payment. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Submit hidden form to CCAvenue gateway for redirection
      const { paymentUrl, encRequest, accessCode } = checkoutRes.ccavenueData;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;

      const encRequestInput = document.createElement("input");
      encRequestInput.type = "hidden";
      encRequestInput.name = "encRequest";
      encRequestInput.value = encRequest;
      form.appendChild(encRequestInput);

      const accessCodeInput = document.createElement("input");
      accessCodeInput.type = "hidden";
      accessCodeInput.name = "access_code";
      accessCodeInput.value = accessCode;
      form.appendChild(accessCodeInput);

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Checkout initiation failed. Please try again.");
      setLoading(false);
    }
  };

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-verdant-emerald" />
        <span className="text-[10px] tracking-widest text-verdant-emerald/50 uppercase font-bold">Loading secure checkout...</span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center select-none">
        <AlertCircle className="w-10 h-10 text-verdant-gold mb-4" />
        <h2 className="font-serif text-2xl text-verdant-emerald mb-2 font-light">Your shopping bag is empty</h2>
        <p className="text-xs text-verdant-emerald/60 max-w-sm mb-6 leading-relaxed">
          Add some of our handcrafted masterpieces to your bag before proceeding to secure checkout.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="gold-gradient-bg text-black hover:scale-103 active:scale-95 text-[10px] tracking-widest uppercase font-bold px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer"
        >
          Browse Masterpieces
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-verdant-emerald pt-10 pb-16 selection:bg-verdant-gold selection:text-black relative overflow-x-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-[10%] left-[-15%] w-[40vw] h-[40vw] bg-radial from-[#C8A96A]/4 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-15%] w-[40vw] h-[40vw] bg-radial from-[#0F4C3A]/3 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase font-bold text-verdant-emerald/60 hover:text-verdant-emerald mb-4 transition-colors select-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bag
        </button>

        <div className="mb-8 text-left select-none">
          <span className="text-[9px] tracking-[0.25em] uppercase text-verdant-gold font-bold font-mono">
            Transaction Portal
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-verdant-emerald uppercase mt-2">
            Secure Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Shipping Details Form (Span 7) */}
          <div className="lg:col-span-7">
            <div className="glass-card bg-white/60 border border-verdant-emerald/10 rounded-3xl p-6 md:p-8 text-left shadow-[0_8px_30px_rgba(15,76,58,0.02)]">
              <h2 className="font-serif text-xl font-light mb-6 flex items-center gap-2 border-b border-verdant-emerald/10 pb-3">
                <Truck className="w-5 h-5 text-verdant-gold animate-pulse" /> Shipping Destination
              </h2>

              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled
                      placeholder="E.g. Siddharth Sharma"
                      className="w-full px-4 py-3 rounded-xl bg-white/30 border border-verdant-emerald/10 text-xs text-verdant-emerald/60 placeholder:text-verdant-emerald/20 select-none cursor-not-allowed"
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="E.g. 9876543210"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:border-verdant-gold focus:ring-1 focus:ring-verdant-gold/30 focus:outline-hidden transition-all duration-300 font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    placeholder="E.g. siddharth@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/30 border border-verdant-emerald/10 text-xs text-verdant-emerald/60 placeholder:text-verdant-emerald/20 select-none cursor-not-allowed"
                  />
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">Address Line 1 *</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                    placeholder="Flat/House No., Building Name, Street Name"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:border-verdant-gold focus:ring-1 focus:ring-verdant-gold/30 focus:outline-hidden transition-all duration-300"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Landmark, Area, Colony"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:border-verdant-gold focus:ring-1 focus:ring-verdant-gold/30 focus:outline-hidden transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* City */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:border-verdant-gold focus:ring-1 focus:ring-verdant-gold/30 focus:outline-hidden transition-all duration-300"
                    />
                  </div>
                  {/* State */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">State *</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      placeholder="Maharashtra"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:border-verdant-gold focus:ring-1 focus:ring-verdant-gold/30 focus:outline-hidden transition-all duration-300"
                    />
                  </div>
                  {/* Postal Code */}
                  <div>
                    <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">PIN Code *</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      placeholder="400001"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:border-verdant-gold focus:ring-1 focus:ring-verdant-gold/30 focus:outline-hidden transition-all duration-300 font-mono"
                    />
                  </div>
                  {/* Country */}
                  <div>
                    <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={country}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-white/30 border border-verdant-emerald/10 text-xs text-verdant-emerald/60 select-none font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Checkout Buttons */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 rounded-full bg-gradient-to-r from-verdant-gold via-[#e3cda4] to-verdant-gold text-verdant-emerald hover:text-white hover:shadow-[0_4px_25px_rgba(200,169,106,0.35)] active:scale-98 text-[10px] tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initiating Payment...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4.5 h-4.5" />
                      Proceed to Pay {`₹${grandTotal.toLocaleString("en-IN")}`}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Order Summary Card (Span 5) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="glass-card bg-white/60 border border-verdant-emerald/10 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(15,76,58,0.02)]">
              <h2 className="font-serif text-xl font-light mb-6 border-b border-verdant-emerald/10 pb-3">
                Order Summary
              </h2>

              {/* Items List scroll container */}
              <div className="max-h-72 overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-thin">
                {cartItems.map((item) => {
                  let itemPrice = item.product?.price || 0;
                  if (item.product?.hasVariants && item.variant) {
                    const variant = item.product.variants?.find(
                      (v: any) => v.name.toLowerCase() === item.variant?.toLowerCase()
                    );
                    if (variant) itemPrice = variant.price;
                  }

                  return (
                    <div key={item._id} className="flex gap-4 items-center border-b border-verdant-emerald/5 pb-4">
                      <div className="w-14 h-14 rounded-xl bg-[#FAF7F2] border border-verdant-emerald/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {isVideoUrl(item.product?.thumbnail || item.product?.images[0]) ? (
                          <video
                            src={getImageUrl(item.product?.thumbnail || item.product?.images[0])}
                            className="max-h-full max-w-full object-contain"
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        ) : (
                          <img
                            src={getImageUrl(item.product?.thumbnail || item.product?.images[0])}
                            alt={item.product?.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-serif text-sm font-light text-verdant-emerald truncate">{item.product?.name}</h4>
                        <div className="flex items-center gap-2.5 text-[9px] uppercase tracking-widest font-mono text-verdant-emerald/40 mt-1 font-bold">
                          <span>Qty: {item.quantity}</span>
                          {item.size && (
                            <span className="text-verdant-gold font-bold">
                              Size: {item.size}
                            </span>
                          )}
                          {item.variant && (
                            <span className="text-verdant-gold font-bold">
                              Option: {item.variant}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-serif text-sm font-semibold shrink-0 text-right">
                        {`₹${(itemPrice * item.quantity).toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Billing Subtotals */}
              <div className="space-y-3 font-mono text-[9px] text-verdant-emerald/65 border-b border-verdant-emerald/10 pb-4 mb-4 uppercase tracking-widest">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-verdant-emerald">{`₹${cartTotal.toLocaleString("en-IN")}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-semibold text-verdant-emerald">{shippingAmount > 0 ? `₹${shippingAmount}` : "FREE"}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (3%)</span>
                  <span className="font-semibold text-verdant-emerald">{`₹${taxAmount.toLocaleString("en-IN")}`}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center font-serif">
                <span className="text-sm font-light text-verdant-emerald uppercase tracking-wider">Grand Total</span>
                <span className="text-xl font-bold text-verdant-emerald">{`₹${grandTotal.toLocaleString("en-IN")}`}</span>
              </div>

              {/* Checkout features badge */}
              <div className="flex items-center gap-2 justify-center mt-6 pt-6 border-t border-verdant-emerald/10 text-[9px] uppercase tracking-wider font-bold text-verdant-emerald/50">
                <ShieldCheck className="w-4 h-4 text-verdant-gold" />
                <span>256-bit Secure SSL Connection via CCAvenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
