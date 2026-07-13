"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Truck, Loader2, CreditCard, ArrowLeft, AlertCircle } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { createCheckoutOrderApi, verifyCheckoutPaymentApi, AddressDetails } from "../../services/checkout";
import { getImageUrl } from "../../utils/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, isLoading: cartLoading, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

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
    if (!cartLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, cartLoading]);

  // Pricing calculations (replicated from backend for UI preview only)
  const taxAmount = Math.round(cartTotal * 0.03); // 3% GST
  const shippingAmount = cartTotal > 15000 ? 0 : 250;
  const grandTotal = cartTotal + taxAmount + shippingAmount;

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };



  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name || !email || !phone || !addressLine1 || !city || !state || !postalCode) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setError("Failed to load Razorpay payment SDK. Check your internet connection.");
        setLoading(false);
        return;
      }

      // 2. Call backend to create Razorpay Order & Pending MERN Order
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

      if (!checkoutRes.success || !checkoutRes.razorpayOrder) {
        setError("Failed to initialize order payment. Please try again.");
        setLoading(false);
        return;
      }

      // 3. Configure Razorpay modal
      const options = {
        key: checkoutRes.razorpayKeyId,
        amount: checkoutRes.razorpayOrder.amount,
        currency: checkoutRes.razorpayOrder.currency,
        name: "AURUM Jewelry",
        description: `Secure checkout for Order #${checkoutRes.order.orderNumber}`,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80",
        order_id: checkoutRes.razorpayOrder.id,
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: "#0F4C3A" // Luxury Green brand color
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            setError(null);

            // 4. Verify payment on server
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            const verificationRes = await verifyCheckoutPaymentApi(verifyPayload);

            if (verificationRes.success) {
              // 5. Success! Clear cart store & redirect to success page
              useCartStore.getState().clearCart();
              router.push(`/order-success?orderId=${verificationRes.orderId}`);
            } else {
              setError(verificationRes.message || "Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "An error occurred during payment verification.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setError("Checkout was cancelled by user. You can try paying again.");
            setLoading(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (resp: any) {
        console.error("Payment failed", resp.error);
        setError(`Payment failed: ${resp.error.description}`);
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Checkout initiation failed. Please try again.");
      setLoading(false);
    }
  };

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F4EA] py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-verdant-emerald" />
        <span className="text-[10px] tracking-widest text-verdant-emerald/50 uppercase font-bold">Loading secure checkout...</span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F4EA] flex flex-col items-center justify-center p-6 text-center select-none">
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
    <div className="min-h-screen bg-[#F8F4EA] text-verdant-emerald pt-28 pb-16 selection:bg-verdant-gold selection:text-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[9px] tracking-widest uppercase font-bold text-verdant-emerald/60 hover:text-verdant-emerald mb-8 transition-colors select-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bag
        </button>

        <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-left mb-12">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Shipping Details Form (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-card bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 md:p-8 text-left shadow-xs">
              <h2 className="font-serif text-xl font-light mb-6 flex items-center gap-2 border-b border-verdant-emerald/5 pb-3">
                <Truck className="w-5 h-5 text-verdant-gold" /> Shipping Destination
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
                      placeholder="E.g. Siddharth Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="E.g. siddharth@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors font-mono"
                    />
                  </div>
                  {/* Country */}
                  <div>
                    <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/75 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={country}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-white/30 border border-verdant-emerald/10 text-xs text-verdant-emerald/60 select-none font-semibold cursor-not-allowed"
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
                      className="bg-red-500/10 border border-red-500/20 text-red-700 p-4 rounded-xl flex items-center gap-3 text-xs"
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
                  className="w-full h-12 rounded-full gold-gradient-bg text-black font-bold text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
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
            <div className="glass-card bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 md:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-light mb-6 border-b border-verdant-emerald/5 pb-3">
                Order Summary
              </h2>

              {/* Items List scroll container */}
              <div className="max-h-64 overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-thin">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center border-b border-verdant-emerald/3 pb-4">
                    <div className="w-14 h-14 rounded-lg bg-verdant-emerald/5 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(item.product?.thumbnail || item.product?.images[0])}
                        alt={item.product?.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-medium text-verdant-emerald truncate">{item.product?.name}</h4>
                      <p className="text-[10px] text-verdant-emerald/60 mt-1 font-mono">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-serif text-xs font-semibold shrink-0 text-right">
                      {`₹${(item.product?.price * item.quantity).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Billing Subtotals */}
              <div className="space-y-3 font-mono text-[10px] text-verdant-emerald/75 border-b border-verdant-emerald/5 pb-4 mb-4 uppercase">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-verdant-emerald">{`₹${cartTotal.toLocaleString("en-IN")}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Express Shipping</span>
                  <span>{shippingAmount > 0 ? `₹${shippingAmount}` : "FREE"}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (3%)</span>
                  <span>{`₹${taxAmount.toLocaleString("en-IN")}`}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center font-serif">
                <span className="text-sm font-light text-verdant-emerald">Grand Total</span>
                <span className="text-xl font-bold text-verdant-emerald">{`₹${grandTotal.toLocaleString("en-IN")}`}</span>
              </div>

              {/* Checkout features badge */}
              <div className="flex items-center gap-2 justify-center mt-6 pt-6 border-t border-verdant-emerald/5 text-[9px] uppercase tracking-wider font-bold text-verdant-emerald/50">
                <ShieldCheck className="w-4 h-4 text-verdant-gold" />
                <span>256-bit Secure SSL Connection via Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
