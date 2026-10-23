"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  ShoppingBag,
  Loader2,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Gem,
  Truck,
  Sparkles,
  MapPin,
  Phone,
  Copy,
  Clock,
  AlertCircle
} from "lucide-react";
import { getOrderDetailsApi, AddressDetails } from "../../services/checkout";
import { getImageUrl } from "../../utils/api";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CrestMark from "@/components/global/CrestMark";

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  variant?: string;
}

interface OrderData {
  id?: string;
  _id?: string;
  orderNumber: string;
  grandTotal: number;
  subtotal: number;
  discountAmount?: number;
  shippingAmount?: number;
  orderStatus: string;
  items: OrderItem[];
  shippingAddress: AddressDetails;
  whatsappUrl?: string;
  createdAt?: string;
}

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const queryWaUrl = searchParams.get("waUrl");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    let isCancelled = false;
    getOrderDetailsApi(orderId)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError("Failed to fetch order details.");
        }
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        console.error(err);
        let msg = "An error occurred while fetching your order details.";
        if (err instanceof Error) {
          msg = err.message;
        }
        setError(msg);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  const whatsappUrl = queryWaUrl ? decodeURIComponent(queryWaUrl) : (order?.whatsappUrl || "");

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyOrderId = (idToCopy: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

  if (loading) {
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
            Order Registry
          </span>
          <h3 className="font-serif text-lg text-verdant-emerald font-light">
            Registering Order
          </h3>
          <p className="text-[11px] text-verdant-emerald/60 mt-2 leading-relaxed">
            Securing order credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-verdant-cream text-verdant-emerald pt-28 pb-20 selection:bg-verdant-gold selection:text-black relative overflow-x-hidden flex flex-col justify-between">
      <Navbar />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[70vw] h-[35vw] rounded-full bg-radial from-verdant-gold/12 via-verdant-gold/3 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-radial from-verdant-emerald/5 via-verdant-emerald/2 to-transparent blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 relative z-10 w-full flex-1">
        
        {/* Celebratory Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 select-none">
          {/* Animated Double-Ring Seal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full border border-verdant-gold/30 bg-white/80 shadow-lg backdrop-blur-md" />
            <div className="absolute inset-1.5 rounded-full border border-dashed border-verdant-gold/45 animate-[spin_24s_linear_infinite]" />
            <div className="relative w-12 h-12 rounded-full bg-verdant-emerald text-verdant-gold flex items-center justify-center shadow-md">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-verdant-gold/30 text-verdant-gold shadow-xs mb-3">
            <CrestMark size={16} />
            <span className="text-[9px] tracking-[0.28em] uppercase font-bold font-mono">
              Geetej Viraasat &bull; Commission Inscribed
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-verdant-emerald uppercase mb-3">
            Order Placed Successfully
          </h1>

          <p className="text-xs sm:text-[13px] text-verdant-emerald/75 max-w-lg mx-auto leading-relaxed font-sans">
            Thank you for choosing Geetej Viraasat. Your custom jewelry order has been recorded in our private registry under{" "}
            <strong className="text-verdant-emerald font-semibold">Pending Confirmation</strong>.
          </p>

          {/* Luxury White-Glove Stepper */}
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full bg-white/70 border border-verdant-emerald/10 backdrop-blur-md shadow-xs text-[9px] tracking-[0.16em] uppercase font-mono">
            <span className="flex items-center gap-1.5 text-verdant-gold font-bold">
              <Check className="w-3 h-3 stroke-[2.5]" /> 01 Bag
            </span>
            <span className="text-verdant-emerald/30">/</span>
            <span className="flex items-center gap-1.5 text-verdant-gold font-bold">
              <Check className="w-3 h-3 stroke-[2.5]" /> 02 Delivery Details
            </span>
            <span className="text-verdant-emerald/30">/</span>
            <span className="flex items-center gap-1.5 text-verdant-emerald font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              03 WhatsApp Confirmation
            </span>
          </div>
        </div>

        {/* Prominent WhatsApp Order Confirmation Card */}
        {whatsappUrl && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#223328] via-[#2B3E32] to-[#1F2C23] text-white border border-emerald-500/30 shadow-[0_12px_45px_rgba(5,60,35,0.18)] relative overflow-hidden"
          >
            {/* Ambient inner soft glow */}
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-[9px] font-mono tracking-widest uppercase font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Primary Action Required
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide flex items-center gap-2.5">
                  <MessageCircle className="w-6 h-6 text-emerald-300 shrink-0" />
                  Confirm Your Order via WhatsApp
                </h3>
                <p className="text-xs sm:text-[13px] text-emerald-100/80 leading-relaxed font-sans">
                  Our team uses WhatsApp to personally confirm your ring sizes, custom engraving desires, and insured delivery schedule. Click below to send your pre-filled order details directly to our master jeweler.
                </p>
              </div>

              <button
                onClick={handleOpenWhatsApp}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-emerald-950 font-serif tracking-[0.14em] uppercase font-bold text-xs px-8 py-4 rounded-full shadow-[0_6px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.5)] active:scale-98 transition-all duration-300 flex items-center gap-2.5 shrink-0 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Open WhatsApp Confirmation</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Master Content Grid: 7 cols Left + 5 cols Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* LEFT: Order Details & Purchased Items (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {order ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card bg-white/70 border border-verdant-emerald/10 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(53,30,40,0.03)] backdrop-blur-xl space-y-6"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-verdant-emerald/10 pb-5">
                  <div>
                    <span className="text-[9px] text-verdant-emerald/50 uppercase font-mono tracking-wider block mb-1">
                      Commission Reference
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg sm:text-xl font-normal text-verdant-emerald">
                        #{order.orderNumber}
                      </span>
                      <button
                        onClick={() => handleCopyOrderId(order.orderNumber)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-verdant-cream hover:bg-white border border-verdant-emerald/10 text-[9px] uppercase font-mono tracking-wider text-verdant-emerald/70 hover:text-verdant-emerald transition-colors cursor-pointer"
                        title="Copy Order ID"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[9px] text-verdant-emerald/50 uppercase font-mono tracking-wider block mb-1">
                        Registry Date
                      </span>
                      <span className="text-xs font-mono font-medium text-verdant-emerald">
                        {formattedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-verdant-emerald/50 uppercase font-mono tracking-wider block mb-1">
                        Current Status
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-800 text-[9px] uppercase tracking-wider font-bold font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {order.orderStatus || "Pending Confirmation"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items in Commission */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-verdant-gold font-bold font-mono">
                      Curated Creations ({order.items?.length || 0})
                    </span>
                    <span className="text-[10px] text-verdant-emerald/50 font-mono">
                      Subtotal: ₹{order.subtotal?.toLocaleString("en-IN") || order.grandTotal?.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="group flex gap-3.5 items-center p-3 rounded-2xl bg-white/60 border border-verdant-emerald/5 hover:border-verdant-gold/30 hover:bg-white/90 transition-all duration-200"
                      >
                        {/* Thumbnail Frame */}
                        <div className="w-16 h-16 rounded-xl bg-verdant-cream border border-verdant-gold/20 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs relative">
                          {isVideoUrl(item.image) ? (
                            <video
                              src={getImageUrl(item.image)}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                              muted
                              playsInline
                              autoPlay
                              loop
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-xs font-normal text-verdant-emerald truncate leading-snug">
                            {item.name}
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
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Destination & Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-verdant-emerald/10 pt-5 text-left">
                  {/* Delivery Address */}
                  <div className="p-4 rounded-2xl bg-white/50 border border-verdant-emerald/5 space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-mono font-bold text-verdant-gold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Armored Transit Destination</span>
                    </div>
                    <p className="font-serif text-xs font-medium text-verdant-emerald">
                      {order.shippingAddress?.name}
                    </p>
                    <p className="text-verdant-emerald/70 leading-relaxed font-sans">
                      {order.shippingAddress?.addressLine1}
                      {order.shippingAddress?.addressLine2 && <>, {order.shippingAddress.addressLine2}</>}
                      <br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}
                      <br />
                      <span className="font-semibold text-verdant-emerald/80">🇮🇳 {order.shippingAddress?.country || "India"}</span>
                    </p>
                  </div>

                  {/* Concierge Dispatch Channel */}
                  <div className="p-4 rounded-2xl bg-white/50 border border-verdant-emerald/5 space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-mono font-bold text-verdant-gold mb-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Concierge Dispatch Channel</span>
                    </div>
                    <p className="font-serif text-xs font-medium text-verdant-emerald">
                      WhatsApp Mobile Link
                    </p>
                    <p className="font-mono text-verdant-emerald/80 tracking-wider font-semibold">
                      🇮🇳 {order.shippingAddress?.phone}
                    </p>
                    <p className="text-emerald-700 text-[9.5px] font-sans flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Direct Order Verification Pending</span>
                    </p>
                  </div>
                </div>

                {/* Grand Total Summary Banner */}
                <div className="p-4 rounded-2xl bg-verdant-cream/80 border border-verdant-gold/25 flex items-center justify-between">
                  <div>
                    <span className="block text-[8.5px] tracking-[0.2em] uppercase font-mono text-verdant-gold font-bold">
                      Total Investment
                    </span>
                    <span className="text-[10px] text-verdant-emerald/55">
                      Complimentary Armored Transit & All Duties Included
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-xl sm:text-2xl font-normal text-verdant-emerald">
                      ₹{order.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

              </motion.div>
            ) : (
              error && (
                <div className="p-5 rounded-2xl bg-verdant-danger/10 border border-verdant-danger/20 text-verdant-danger flex items-start gap-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px]">Notice</span>
                    <span>{error}</span>
                  </div>
                </div>
              )
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => router.push("/products")}
                className="flex-1 group relative overflow-hidden rounded-full gold-gradient-bg py-4 px-6 text-verdant-emerald font-serif tracking-[0.15em] uppercase font-semibold text-xs shadow-[0_6px_25px_rgba(200,169,106,0.35)] hover:shadow-[0_8px_35px_rgba(200,169,106,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Masterpieces</span>
              </button>

              <button
                onClick={() => router.push("/orders")}
                className="flex-1 rounded-full bg-white/80 hover:bg-white border border-verdant-emerald/15 hover:border-verdant-gold/50 py-4 px-6 text-verdant-emerald font-serif tracking-[0.15em] uppercase font-semibold text-xs transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-md"
              >
                <span>Track in My Orders</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* RIGHT: Order Fulfillment Timeline & Trust Pillars (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Fulfillment Timeline */}
            <div className="glass-card bg-white/70 border border-verdant-emerald/10 rounded-3xl p-6 sm:p-7 shadow-[0_10px_40px_rgba(53,30,40,0.03)] backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-verdant-emerald/10 pb-4 mb-5">
                <Clock className="w-4 h-4 text-verdant-gold" />
                <h3 className="font-serif text-lg font-normal text-verdant-emerald tracking-wide">
                  Order Fulfillment Timeline
                </h3>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-verdant-gold/25">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                  <h4 className="font-serif text-xs font-semibold text-verdant-emerald flex items-center gap-2">
                    <span>01. WhatsApp Order Confirmation</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] bg-emerald-100 text-emerald-800 font-mono uppercase font-bold">
                      Current
                    </span>
                  </h4>
                  <p className="text-[11px] text-verdant-emerald/65 leading-relaxed font-sans mt-1">
                    Our master jeweler verifies piece specifications, ring sizing, and custom engraving requests directly with you.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-verdant-cream border border-verdant-gold/40 text-verdant-gold flex items-center justify-center text-[9px] font-mono font-bold">
                    02
                  </div>
                  <h4 className="font-serif text-xs font-medium text-verdant-emerald">
                    Artisanal Inspection & BIS Hallmarking
                  </h4>
                  <p className="text-[11px] text-verdant-emerald/65 leading-relaxed font-sans mt-1">
                    Every precious gemstone and gold hallmark undergoes rigorous certified laboratory scrutiny in our workshop.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-verdant-cream border border-verdant-gold/40 text-verdant-gold flex items-center justify-center text-[9px] font-mono font-bold">
                    03
                  </div>
                  <h4 className="font-serif text-xs font-medium text-verdant-emerald">
                    Signature Presentation Packaging
                  </h4>
                  <p className="text-[11px] text-verdant-emerald/65 leading-relaxed font-sans mt-1">
                    Cased in our handcrafted silk velvet box with an official Certificate of Authenticity and care manual.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-verdant-cream border border-verdant-gold/40 text-verdant-gold flex items-center justify-center text-[9px] font-mono font-bold">
                    04
                  </div>
                  <h4 className="font-serif text-xs font-medium text-verdant-emerald">
                    Armored & Insured Transit
                  </h4>
                  <p className="text-[11px] text-verdant-emerald/65 leading-relaxed font-sans mt-1">
                    Dispatched via insured security transport with tracking coordinates and adult signature verification upon arrival.
                  </p>
                </div>

              </div>
            </div>

            {/* Heritage Guarantees Card */}
            <div className="glass-card bg-white/70 border border-verdant-emerald/10 rounded-3xl p-6 sm:p-7 shadow-[0_10px_40px_rgba(53,30,40,0.03)] backdrop-blur-xl space-y-4">
              <span className="text-[9px] uppercase tracking-[0.22em] font-mono font-bold text-verdant-gold block">
                The House Pillars
              </span>

              <div className="space-y-3.5 text-left text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-verdant-gold/10 border border-verdant-gold/25 flex items-center justify-center text-verdant-gold shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-xs font-medium text-verdant-emerald">100% Certified Stones</h5>
                    <p className="text-[11px] text-verdant-emerald/65 leading-relaxed mt-0.5 font-sans">
                      Verified by GIA, IGI and government-approved BIS hallmarked precious gold.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-verdant-gold/10 border border-verdant-gold/25 flex items-center justify-center text-verdant-gold shrink-0 mt-0.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-xs font-medium text-verdant-emerald">Armored & Insured Transit</h5>
                    <p className="text-[11px] text-verdant-emerald/65 leading-relaxed mt-0.5 font-sans">
                      Complimentary door-to-door insured delivery with tamper-proof discreet packaging.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-verdant-gold/10 border border-verdant-gold/25 flex items-center justify-center text-verdant-gold shrink-0 mt-0.5">
                    <Gem className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-xs font-medium text-verdant-emerald">Lifetime Jewelry Care</h5>
                    <p className="text-[11px] text-verdant-emerald/65 leading-relaxed mt-0.5 font-sans">
                      Complimentary annual ultrasonic cleaning, prong inspections, and resizing support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Box */}
            <div className="p-5 rounded-3xl bg-verdant-gold/5 border border-verdant-gold/20 text-left space-y-2">
              <div className="flex items-center gap-2 text-verdant-gold text-xs font-serif">
                <Sparkles className="w-4 h-4" />
                <span className="font-normal tracking-wide">Customer Support Inquiries</span>
              </div>
              <p className="text-[11px] text-verdant-emerald/70 leading-relaxed font-sans">
                Need to add special engraving or adjust ring measurements? Connect with our team anytime on WhatsApp for personalized assistance.
              </p>
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-verdant-cream py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-verdant-emerald" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
