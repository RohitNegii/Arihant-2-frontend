"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ShoppingBag, Loader2, ArrowRight, Home, Calendar, Truck } from "lucide-react";
import { getOrderDetailsApi } from "../../services/checkout";
import { getImageUrl } from "../../utils/api";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-verdant-emerald" />
        <span className="text-[10px] tracking-widest text-verdant-emerald/50 uppercase font-bold">Securing order logs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-verdant-emerald pt-28 pb-16 selection:bg-verdant-gold selection:text-black">
      <div className="max-w-3xl mx-auto px-6 text-center select-none">

        {/* Animated Check Banner */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-16 h-16 rounded-full bg-[#0F4C3A] text-verdant-gold border border-verdant-gold/30 flex items-center justify-center mx-auto mb-6 shadow-xl"
        >
          <Check className="w-7 h-7" />
        </motion.div>

        <span className="text-[9px] tracking-[0.3em] uppercase text-verdant-gold font-bold font-mono">transaction complete</span>
        <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide mt-2 mb-4">
          Order Placed Successfully
        </h1>
        <p className="text-xs text-verdant-emerald/60 max-w-md mx-auto mb-10 leading-relaxed font-sans">
          Thank you for choosing AURUM. Your payment has been securely verified, and our master artisans have begun preparing your selection.
        </p>

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
                <span className="text-verdant-emerald/50 block uppercase">Estimate Courier dispatch</span>
                <span className="font-bold text-verdant-emerald text-xs font-sans">2-3 Business Days</span>
              </div>
              <div className="sm:text-right">
                <span className="text-verdant-emerald/50 block uppercase">Total Paid</span>
                <span className="font-bold text-verdant-emerald text-xs font-sans">₹{order.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-4 mb-8">
              <span className="text-[9px] tracking-wider uppercase text-verdant-gold font-bold font-mono block mb-2 border-b border-verdant-emerald/5 pb-1">Items in Shipment</span>
              {order.items.map((item: any, idx: number) => (
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
                    <p className="text-[9px] text-verdant-emerald/50 mt-0.5 font-mono">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-serif text-xs font-semibold shrink-0 text-right">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipment details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-[9px] uppercase tracking-wider text-verdant-emerald/75">
              <div>
                <span className="text-verdant-gold font-bold block mb-1">Shipping Details</span>
                <span className="text-verdant-emerald font-semibold font-sans">{order.shippingAddress.name}</span><br />
                <span>{order.shippingAddress.addressLine1}</span><br />
                <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span><br />
                <span>PIN: {order.shippingAddress.postalCode}</span>
              </div>
              <div>
                <span className="text-verdant-gold font-bold block mb-1">Billing Details</span>
                <span className="text-verdant-emerald font-semibold font-sans">{order.billingAddress.name}</span><br />
                <span>{order.billingAddress.addressLine1}</span><br />
                <span>{order.billingAddress.city}, {order.billingAddress.state}</span><br />
                <span>PIN: {order.billingAddress.postalCode}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-4 rounded-2xl text-xs mb-8">
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
            Track Orders <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push("/products")}
            className="gold-gradient-bg text-black hover:scale-103 active:scale-97 text-[10px] tracking-widest uppercase font-bold px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-black" /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F4EA] py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-verdant-emerald" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
