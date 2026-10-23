"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Loader2,
  ArrowLeft,
  AlertCircle,
  MessageCircle,
  Lock,
  Sparkles,
  MapPin,
  Mail,
  User,
  Gem,
  CheckCircle2,
  ChevronDown,
  Building2,
  Check,
  ShoppingBag
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { createCheckoutOrderApi, AddressDetails } from "../../services/checkout";
import { getImageUrl } from "../../utils/api";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CrestMark from "@/components/global/CrestMark";

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

declare global {
  interface Window {
    Razorpay: unknown;
  }
}

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, cartTotal, isLoading: cartLoading, fetchCart } = useCartStore();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  // Address form fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const country = "India";
  const [postalCode, setPostalCode] = useState("");

  const [loading, setLoading] = useState(false);
  const queryError = searchParams.get("error");
  const [error, setError] = useState<string | null>(() => {
    const err = searchParams.get("error");
    return err ? decodeURIComponent(err) : null;
  });
  const [prevQueryError, setPrevQueryError] = useState(queryError);

  if (queryError !== prevQueryError) {
    setPrevQueryError(queryError);
    if (queryError) {
      setError(decodeURIComponent(queryError));
    }
  }

  // Sync user details when user profile becomes available
  const [syncedUserKey, setSyncedUserKey] = useState<string | null>(null);
  const currentUserKey = user ? `${user.id}-${user.name}-${user.email}-${user.phone || ""}` : null;

  if (currentUserKey && currentUserKey !== syncedUserKey) {
    setSyncedUserKey(currentUserKey);
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.phone) setPhone(user.phone);
  }

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // If not authenticated, redirect to home
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Pricing calculations
  const subtotal = cartTotal;
  const taxAmount = 0; // GST is included in product prices
  const shippingAmount = 0; // Complimentary Express Shipping
  const grandTotal = subtotal + taxAmount + shippingAmount;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      setError("Please fill in all required fields marked with an asterisk (*).");
      return;
    }

    setLoading(true);

    try {
      // 1. Call backend to create Order under Pending Confirmation & generate WhatsApp message
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

      if (!checkoutRes.success || !checkoutRes.order) {
        setError("Failed to create order. Please check your details and try again.");
        setLoading(false);
        return;
      }

      // 2. Clear frontend cart
      useCartStore.getState().clearCart();

      // 3. Open WhatsApp link if available
      if (checkoutRes.whatsappUrl) {
        try {
          window.open(checkoutRes.whatsappUrl, "_blank", "noopener,noreferrer");
        } catch (e) {
          console.warn("Could not open WhatsApp automatically:", e);
        }
      }

      // 4. Navigate to order-success page with orderId & waUrl
      const successUrl = `/order-success?orderId=${checkoutRes.order.id}&waUrl=${encodeURIComponent(checkoutRes.whatsappUrl || "")}`;
      router.push(successUrl);
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = "Checkout initiation failed. Please try again.";
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const resp = (err as { response?: { data?: { message?: string } } }).response;
        if (resp?.data?.message) {
          errorMsg = resp.data.message;
        }
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-verdant-cream flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-verdant-gold/10 via-transparent to-transparent pointer-events-none" />
        <div className="glass-card bg-white/75 border border-verdant-gold/25 rounded-3xl p-10 flex flex-col items-center max-w-sm shadow-xl">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border border-verdant-gold/30 flex items-center justify-center bg-white/50">
              <CrestMark size={28} />
            </div>
            <Loader2 className="w-20 h-20 animate-spin text-verdant-gold absolute -top-2 -left-2 stroke-[1.5]" />
          </div>
          <span className="text-[9px] tracking-[0.3em] text-verdant-gold uppercase font-bold font-mono mb-2">
            Secure Portal
          </span>
          <h3 className="font-serif text-lg text-verdant-emerald font-light">
            Securing Your Selections
          </h3>
          <p className="text-[11px] text-verdant-emerald/60 mt-2 leading-relaxed">
            Connecting with the secure order system...
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-verdant-cream flex flex-col justify-between select-none relative">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto pt-32 pb-16">
          <div className="w-20 h-20 rounded-full bg-white/80 border border-verdant-gold/30 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(200,169,106,0.15)]">
            <ShoppingBag className="w-9 h-9 text-verdant-gold" />
          </div>
          <span className="text-[9px] tracking-[0.3em] uppercase text-verdant-gold font-bold font-mono mb-2">
            Your Shopping Bag
          </span>
          <h2 className="font-serif text-3xl text-verdant-emerald mb-3 font-light">
            Your Bag is Empty
          </h2>
          <p className="text-xs text-verdant-emerald/70 max-w-sm mb-8 leading-relaxed font-sans">
            No handcrafted jewelry pieces are currently in your bag. Explore our collection to discover your favorite designs.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="gold-gradient-bg text-verdant-emerald font-serif tracking-[0.15em] uppercase font-semibold text-xs px-9 py-4 rounded-full shadow-[0_4px_25px_rgba(200,169,106,0.35)] hover:shadow-[0_6px_30px_rgba(200,169,106,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center gap-2"
          >
            <span>Explore Collections</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-verdant-cream text-verdant-emerald pt-28 flex flex-col justify-between selection:bg-verdant-gold selection:text-black relative overflow-x-hidden">
      <Navbar />

      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[8%] left-[-12%] w-[45vw] h-[45vw] rounded-full bg-radial from-verdant-gold/10 via-verdant-gold/3 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-12%] w-[45vw] h-[45vw] rounded-full bg-radial from-verdant-emerald/5 via-verdant-emerald/2 to-transparent blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10 flex-1 pb-20">
        
        {/* Navigation & Stepper Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-bold text-verdant-emerald/65 hover:text-verdant-emerald transition-colors select-none cursor-pointer"
          >
            <span className="w-7 h-7 rounded-full bg-white/80 border border-verdant-emerald/10 flex items-center justify-center group-hover:border-verdant-gold/50 group-hover:bg-white transition-all shadow-xs">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            </span>
            <span>Return to Bag</span>
          </button>

          {/* Luxury White-Glove Stepper */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-verdant-emerald/10 backdrop-blur-md shadow-xs text-[9px] tracking-[0.18em] uppercase font-mono">
            <span className="flex items-center gap-1.5 text-verdant-gold font-bold">
              <Check className="w-3 h-3 stroke-[2.5]" />
              01 Bag
            </span>
            <span className="text-verdant-emerald/30">/</span>
            <span className="flex items-center gap-1.5 text-verdant-emerald font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold animate-pulse" />
              02 Delivery Details
            </span>
            <span className="text-verdant-emerald/30">/</span>
            <span className="text-verdant-emerald/45">
              03 WhatsApp Confirmation
            </span>
          </div>
        </div>

        {/* Hero Title Lockup */}
        <div className="mb-10 pb-6 border-b border-verdant-emerald/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-verdant-gold/30 text-verdant-gold shadow-xs mb-3">
              <CrestMark size={16} />
              <span className="text-[9px] tracking-[0.28em] uppercase font-bold font-mono">
                Geetej Viraasat &bull; Secure Checkout
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-verdant-emerald uppercase">
              Secure Checkout
            </h1>
            <p className="text-xs text-verdant-emerald/70 mt-1 font-sans">
              Finalize your custom fine jewelry order with Geetej Viraasat.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-verdant-emerald/70 font-mono tracking-wider uppercase font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-verdant-emerald/10 backdrop-blur-xs">
              <Lock className="w-3 h-3 text-verdant-gold" /> Encrypted Session
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-verdant-emerald/10 backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-verdant-gold" /> Verified Brand
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Shipping Details Form (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              
              {/* Card 1: Customer Identity */}
              <div className="glass-card bg-white/70 border border-verdant-emerald/10 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(53,30,40,0.03)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-verdant-emerald/10 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-verdant-gold/10 border border-verdant-gold/30 flex items-center justify-center text-verdant-gold">
                      <User className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="font-serif text-lg font-normal text-verdant-emerald">
                        Customer Identity
                      </h2>
                      <p className="text-[10px] text-verdant-emerald/55 tracking-wider uppercase font-mono">
                        Account credentials on record
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-mono text-verdant-gold font-bold px-2.5 py-1 rounded-full bg-verdant-gold/10 border border-verdant-gold/25">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Member
                  </span>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80 mb-1.5">
                        Full Name <span className="text-verdant-gold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={Boolean(user?.name)}
                          placeholder="E.g. Siddharth Sharma"
                          className="w-full px-4 py-3.5 rounded-xl bg-white/50 border border-verdant-emerald/15 text-xs text-verdant-emerald/85 placeholder:text-verdant-emerald/30 focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 focus:outline-hidden transition-all duration-200 disabled:bg-verdant-cream/50 disabled:text-verdant-emerald/70 disabled:cursor-not-allowed font-medium"
                        />
                        {user?.name && (
                          <Lock className="w-3.5 h-3.5 text-verdant-emerald/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled
                          placeholder="E.g. client@domain.com"
                          className="w-full px-4 py-3.5 rounded-xl bg-verdant-cream/50 border border-verdant-emerald/15 text-xs text-verdant-emerald/70 placeholder:text-verdant-emerald/30 cursor-not-allowed font-medium"
                        />
                        <Mail className="w-3.5 h-3.5 text-verdant-emerald/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Phone with WhatsApp Indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80">
                        WhatsApp Mobile Number <span className="text-verdant-gold">*</span>
                      </label>
                      <span className="text-[9px] text-verdant-gold font-mono tracking-wider uppercase font-semibold flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        For Concierge Dispatch
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 pr-2.5 border-r border-verdant-emerald/15 text-xs font-mono font-semibold text-verdant-emerald/75 pointer-events-none select-none">
                        <span className="text-sm">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="98765 43210"
                        className="w-full pl-[76px] pr-4 py-3.5 rounded-xl bg-white/80 border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/35 focus:bg-white focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 focus:outline-hidden transition-all duration-200 font-mono tracking-wider font-semibold"
                      />
                    </div>
                    <p className="text-[10px] text-verdant-emerald/60 mt-1.5 leading-relaxed font-sans">
                      Our jewelry concierge will connect directly on this number via WhatsApp to confirm piece specifications and dispatch timing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Bespoke Shipping Destination */}
              <div className="glass-card bg-white/70 border border-verdant-emerald/10 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(53,30,40,0.03)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-verdant-emerald/10 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-verdant-gold/10 border border-verdant-gold/30 flex items-center justify-center text-verdant-gold">
                      <Truck className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="font-serif text-lg font-normal text-verdant-emerald">
                        Delivery Destination
                      </h2>
                      <p className="text-[10px] text-verdant-emerald/55 tracking-wider uppercase font-mono">
                        Armored & insured discreet transport
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-mono text-verdant-gold font-bold px-2.5 py-1 rounded-full bg-verdant-gold/10 border border-verdant-gold/25">
                    <Sparkles className="w-3 h-3" />
                    White-Glove
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80 mb-1.5">
                      Address Line 1 <span className="text-verdant-gold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        required
                        placeholder="Flat, Villa, Building Name, Street / Avenue"
                        className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-white/80 border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/35 focus:bg-white focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 focus:outline-hidden transition-all duration-200 font-medium"
                      />
                      <MapPin className="w-4 h-4 text-verdant-gold/70 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80 mb-1.5">
                      Address Line 2 <span className="text-verdant-emerald/45 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Landmark, Suite, Floor, or Sector"
                        className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-white/80 border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/35 focus:bg-white focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 focus:outline-hidden transition-all duration-200 font-medium"
                      />
                      <Building2 className="w-4 h-4 text-verdant-emerald/30 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* City, State, PIN, Country Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
                    {/* City */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80 mb-1.5">
                        City / Town <span className="text-verdant-gold">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        placeholder="E.g. Mumbai"
                        className="w-full px-3.5 py-3.5 rounded-xl bg-white/80 border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/35 focus:bg-white focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 focus:outline-hidden transition-all duration-200 font-medium"
                      />
                    </div>

                    {/* State */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80 mb-1.5">
                        State <span className="text-verdant-gold">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          className={`w-full pl-3.5 pr-8 py-3.5 rounded-xl bg-white/80 border border-verdant-emerald/15 text-xs focus:bg-white focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 focus:outline-hidden transition-all duration-200 cursor-pointer appearance-none font-medium truncate ${
                            !state ? "text-verdant-emerald/40" : "text-verdant-emerald"
                          }`}
                        >
                          <option value="" disabled className="text-verdant-emerald/40">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s} className="text-verdant-emerald bg-verdant-cream py-1">
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-verdant-gold absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Postal PIN Code */}
                    <div>
                      <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80 mb-1.5">
                        PIN Code <span className="text-verdant-gold">*</span>
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                        placeholder="400001"
                        maxLength={6}
                        className="w-full px-3.5 py-3.5 rounded-xl bg-white/80 border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/35 focus:bg-white focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 focus:outline-hidden transition-all duration-200 font-mono tracking-widest font-semibold"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-[9px] tracking-[0.18em] uppercase font-bold text-verdant-emerald/80 mb-1.5">
                        Country
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={country}
                          disabled
                          className="w-full px-3.5 py-3.5 rounded-xl bg-verdant-cream/50 border border-verdant-emerald/15 text-xs text-verdant-emerald/70 font-semibold cursor-not-allowed select-none"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs">🇮🇳</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-4 rounded-2xl bg-verdant-danger/10 border border-verdant-danger/25 text-verdant-danger flex items-start gap-3 text-xs shadow-xs"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold tracking-wider uppercase block text-[10px] mb-0.5">Order Incomplete</span>
                      <span className="text-verdant-danger/90 font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Primary Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative overflow-hidden rounded-full gold-gradient-bg py-4 px-6 text-verdant-emerald font-serif tracking-[0.15em] uppercase font-semibold text-xs shadow-[0_6px_25px_rgba(200,169,106,0.35)] hover:shadow-[0_8px_35px_rgba(200,169,106,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
                >
                  {/* Shimmer light effect */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-verdant-emerald" />
                      <span>Transmitting Order...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4.5 h-4.5 text-verdant-emerald" />
                      <span>Confirm & Connect via WhatsApp</span>
                      <span className="ml-1 px-2.5 py-0.5 rounded-full bg-verdant-emerald text-verdant-gold font-mono font-bold text-[11px] tracking-normal">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-verdant-emerald/55 mt-3 tracking-wider font-mono">
                  Geetej Viraasat Direct Fulfillment &bull; Complimentary Insured Delivery &bull; Zero Hidden Charges
                </p>
              </div>
            </form>
          </div>

          {/* RIGHT: Order Summary Card (Span 5 - Sticky) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="glass-card bg-white/70 border border-verdant-emerald/10 rounded-3xl p-6 sm:p-7 shadow-[0_12px_45px_rgba(53,30,40,0.04)] backdrop-blur-xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-verdant-emerald/10 pb-4 mb-5">
                <div>
                  <span className="text-[8.5px] uppercase tracking-[0.25em] font-mono text-verdant-gold font-bold block mb-0.5">
                    Geetej Viraasat
                  </span>
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-verdant-gold" />
                    <h2 className="font-serif text-lg font-normal text-verdant-emerald tracking-wide">
                      Acquisition Summary
                    </h2>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-verdant-emerald/65 px-2.5 py-0.5 rounded-full bg-verdant-cream border border-verdant-emerald/10">
                  {totalItemsCount} {totalItemsCount === 1 ? "Piece" : "Pieces"}
                </span>
              </div>

              {/* Items List scroll container */}
              <div className="max-h-72 overflow-y-auto pr-1 space-y-3.5 mb-5 scrollbar-thin">
                {cartItems.map((item) => {
                  let itemPrice = item.product?.price || 0;
                  if (item.product?.hasVariants && item.variant) {
                    const variant = item.product.variants?.find(
                      (v: { name: string; price: number }) => v.name.toLowerCase() === item.variant?.toLowerCase()
                    );
                    if (variant) {
                      itemPrice = variant.price;
                    }
                  }

                  const mediaSource = item.product?.thumbnail || item.product?.images?.[0];

                  return (
                    <div
                      key={item._id}
                      className="group flex gap-3.5 items-center p-2.5 rounded-2xl bg-white/50 border border-verdant-emerald/5 hover:border-verdant-gold/30 hover:bg-white/80 transition-all duration-200"
                    >
                      {/* Thumbnail Frame */}
                      <div className="w-16 h-16 rounded-xl bg-verdant-cream border border-verdant-gold/20 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs relative">
                        {isVideoUrl(mediaSource) ? (
                          <video
                            src={getImageUrl(mediaSource)}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={getImageUrl(mediaSource)}
                            alt={item.product?.name || "Jewelry piece"}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs font-normal text-verdant-emerald truncate leading-snug">
                          {item.product?.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] uppercase tracking-wider font-mono text-verdant-emerald/60 mt-1.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-verdant-cream border border-verdant-emerald/10 font-bold">
                            Qty: {item.quantity}
                          </span>
                          {item.size && (
                            <span className="px-1.5 py-0.5 rounded-md bg-verdant-gold/10 border border-verdant-gold/20 text-verdant-gold font-bold">
                              Size {item.size}
                            </span>
                          )}
                          {item.variant && (
                            <span className="px-1.5 py-0.5 rounded-md bg-verdant-gold/10 border border-verdant-gold/20 text-verdant-gold font-bold">
                              {item.variant}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <span className="font-serif text-xs font-semibold text-verdant-emerald block">
                          ₹{(itemPrice * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Breakdown Ledger */}
              <div className="space-y-2.5 font-mono text-[9px] text-verdant-emerald/70 border-t border-verdant-emerald/10 pt-4 pb-4 uppercase tracking-widest">
                <div className="flex justify-between items-center">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-verdant-emerald text-[10px]">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Armored Transport</span>
                  <span className="inline-flex items-center gap-1 text-[8.5px] px-2 py-0.5 rounded-full bg-verdant-success/10 text-verdant-success font-bold border border-verdant-success/20">
                    Complimentary
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Goods & Services Tax (GST)</span>
                  <span className="font-medium text-verdant-emerald/55">Included</span>
                </div>
              </div>

              {/* Grand Total Box */}
              <div className="p-3.5 rounded-2xl bg-verdant-cream/80 border border-verdant-gold/25 mb-5 flex justify-between items-center">
                <div>
                  <span className="block text-[8.5px] tracking-[0.2em] uppercase font-mono text-verdant-gold font-bold">
                    Total Investment
                  </span>
                  <span className="text-[10px] text-verdant-emerald/50">
                    All duties & insurance included
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-xl sm:text-2xl font-normal text-verdant-emerald">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* WhatsApp Concierge Protocol Explainer Card */}
              <div className="p-3.5 rounded-2xl bg-verdant-gold/5 border border-verdant-gold/20 text-left space-y-1.5 mb-5">
                <div className="flex items-center gap-2 text-verdant-gold text-xs font-serif">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-normal tracking-wide">Concierge Order Confirmation</span>
                </div>
                <p className="text-[10px] text-verdant-emerald/70 leading-relaxed font-sans">
                  Upon submission, your creation is registered with our team under <strong className="text-verdant-emerald font-semibold">Pending Confirmation</strong>. Our master jeweler will review sizing, customization, and dispatch on WhatsApp.
                </p>
              </div>

              {/* Trust Pillars */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-verdant-emerald/10 text-center text-[8.5px] text-verdant-emerald/65 font-medium leading-tight">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-verdant-gold" />
                  <span>BIS Hallmarked Gold</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-verdant-gold" />
                  <span>Insured Transport</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="w-4 h-4 text-verdant-gold" />
                  <span>Certified Authenticity</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-verdant-cream py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-verdant-emerald" />
          <span className="text-[10px] tracking-widest text-verdant-emerald/50 uppercase font-bold">
            Loading secure checkout...
          </span>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
