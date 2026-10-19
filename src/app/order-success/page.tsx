"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ShoppingBag, Loader2, ArrowRight, MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { getOrderDetailsApi } from "../../services/checkout";
import { getImageUrl } from "../../utils/api";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const queryWaUrl = searchParams.get("waUrl");

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await getOrderDetailsApi(orderId!);
      if (res.success) {
        setOrder(res.order);
      } else {
        setError("Failed to fetch order details.");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while fetching your order details.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = queryWaUrl ? decodeURIComponent(queryWaUrl) : (order?.whatsappUrl || "");

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-verdant-cream py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-verdant-emerald" />
        <span className="text-[10px] tracking-widest text-verdant-emerald/50 uppercase font-bold">Securing order logs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-verdant-cream text-verdant-emerald pt-28 pb-16 selection:bg-verdant-gold selection:text-black">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 text-center select-none">

        {/* Animated Check Banner */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-16 h-16 rounded-full bg-verdant-emerald text-verdant-gold border border-verdant-gold/30 flex items-center justify-center mx-auto mb-6 shadow-xl"
        >
          <Check className="w-7 h-7" />
        </motion.div>

        <span className="text-[9px] tracking-[0.3em] uppercase text-verdant-gold font-bold font-mono">
          Order Created &bull; Awaiting WhatsApp Confirmation
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide mt-2 mb-4">
          Order Placed Successfully
        </h1>
        <p className="text-xs text-verdant-emerald/75 max-w-lg mx-auto mb-6 leading-relaxed font-sans">
          Thank you for choosing Geetej Viraasat. Your order is registered in our database under{" "}
          <strong className="text-verdant-emerald font-semibold">Pending Confirmation</strong>. Please ensure the pre-filled message is sent to our atelier via WhatsApp to confirm your bespoke order.
        </p>

        {/* Prominent WhatsApp Confirmation Card */}
        {whatsappUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/10 via-emerald-800/5 to-transparent border border-emerald-600/25 mb-8 text-left shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <MessageCircle className="w-4.5 h-4.5 text-emerald-600" />
                <span>Confirm Order via WhatsApp</span>
              </div>
              <p className="text-xs text-verdant-emerald/80 max-w-md font-sans">
                If WhatsApp did not open automatically, click the button to send the pre-filled message with your order ID and items.
              </p>
            </div>
            <button
              onClick={handleOpenWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg active:scale-97 text-[10px] tracking-widest uppercase font-bold px-7 py-3.5 rounded-full transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-md font-mono"
            >
              <span>Open WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {order ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 md:p-8 text-left shadow-xs mb-8"
          >
            {/* Meta Order details header */}
            <div className="flex flex-col sm:flex-row justify-between border-b border-verdant-emerald/5 pb-4 mb-6 gap-2 font-mono text-[10px]">
              <div>
                <span className="text-verdant-emerald/50 block uppercase">Order ID</span>
                <span className="font-bold text-verdant-emerald text-xs font-sans">#{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-verdant-emerald/50 block uppercase">Status</span>
                <span className="font-bold text-amber-700 bg-amber-500/10 border border-amber-500/30 text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mt-0.5 font-sans">
                  {order.orderStatus || "Pending Confirmation"}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-verdant-emerald/50 block uppercase">Total Amount</span>
                <span className="font-bold text-verdant-emerald text-xs font-sans">₹{order.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-4 mb-8">
              <span className="text-[9px] tracking-wider uppercase text-verdant-gold font-bold font-mono block mb-2 border-b border-verdant-emerald/5 pb-1">
                Items in Order ({order.items?.length || 0})
              </span>
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-verdant-emerald/5 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {isVideoUrl(item.image) ? (
                      <video
                        src={getImageUrl(item.image)}
                        className="max-h-full max-w-full object-contain"
                        muted
                        playsInline
                        autoPlay
                        loop
                      />
                    ) : (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs font-medium text-verdant-emerald truncate">{item.name}</h4>
                    <p className="text-[9px] text-verdant-emerald/50 mt-0.5 font-mono">
                      Quantity: {item.quantity} {item.size && `&bull; Size: ${item.size}`} {item.variant && `&bull; Option: ${item.variant}`}
                    </p>
                  </div>
                  <span className="font-serif text-xs font-semibold shrink-0 text-right">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipment details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-[9px] uppercase tracking-wider text-verdant-emerald/75 border-t border-verdant-emerald/5 pt-4">
              <div>
                <span className="text-verdant-gold font-bold block mb-1">Delivery Destination</span>
                <span className="text-verdant-emerald font-semibold font-sans">{order.shippingAddress?.name}</span><br />
                <span>{order.shippingAddress?.addressLine1}</span><br />
                {order.shippingAddress?.addressLine2 && <span>{order.shippingAddress.addressLine2}<br /></span>}
                <span>{order.shippingAddress?.city}, {order.shippingAddress?.state}</span><br />
                <span>PIN: {order.shippingAddress?.postalCode}</span>
              </div>
              <div>
                <span className="text-verdant-gold font-bold block mb-1">Confirmation Details</span>
                <span className="text-verdant-emerald font-semibold font-sans">WhatsApp Direct Ordering</span><br />
                <span>Recipient: {order.shippingAddress?.phone}</span><br />
                <span className="text-emerald-700 font-bold block mt-1">Status: Pending Manual Confirmation</span>
              </div>
            </div>
          </motion.div>
        ) : (
          error && (
            <div className="bg-verdant-danger/10 border border-verdant-danger/20 text-verdant-danger p-4 rounded-2xl text-xs mb-8">
              {error}
            </div>
          )
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/orders")}
            className="border border-verdant-emerald text-verdant-emerald hover:bg-verdant-emerald/5 text-[10px] tracking-widest uppercase font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Track in My Orders <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push("/products")}
            className="gold-gradient-bg text-black hover:scale-103 active:scale-97 text-[10px] tracking-widest uppercase font-bold px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-black" /> Continue Shopping
          </button>
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
