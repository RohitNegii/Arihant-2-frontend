"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Package,
  ArrowLeft,
  ArrowRight,
  X,
  MapPin,
  Truck,
  Calendar,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Award,
  MessageCircle,
  Clock,
  Star,
  Send,
  CheckCircle2
} from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import { getMyOrdersApi } from "../../services/checkout";
import { useAuthStore } from "../../store/authStore";
import { useScrollLock } from "@/hooks/useScrollLock";
import { getImageUrl, postRequest } from "../../utils/api";
import { toast } from "sonner";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "Pending Confirmation":
      return "bg-amber-500/10 border-amber-500/30 text-amber-700";
    case "Confirmed":
      return "bg-sky-500/10 border-sky-500/30 text-sky-700";
    case "Processing":
      return "bg-indigo-500/10 border-indigo-500/30 text-indigo-700";
    case "Shipped":
      return "bg-purple-500/10 border-purple-500/30 text-purple-700";
    case "Delivered":
      return "bg-teal-500/10 border-teal-500/30 text-teal-700";
    case "Completed":
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700";
    case "Cancelled":
      return "bg-rose-500/10 border-rose-500/30 text-rose-700";
    default:
      return "bg-verdant-emerald/5 border-verdant-emerald/15 text-verdant-emerald/70";
  }
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const authLoading = !isInitialized;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // In-order review modal state
  const [reviewItem, setReviewItem] = useState<{ productId: string; productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    } else if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading]);

  useScrollLock(selectedOrder !== null || reviewItem !== null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrdersApi();
      if (res.success) {
        setOrders(res.orders || []);
      } else {
        setError("Failed to fetch orders.");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while loading your purchase history.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (productId: string, productName: string) => {
    setReviewItem({ productId, productName });
    setReviewRating(5);
    setReviewComment("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem || !reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await postRequest(`/products/${reviewItem.productId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      if (res.success) {
        toast.success("Thank you! Your critique has been recorded.");
        setReviewedProductIds((prev) => ({ ...prev, [reviewItem.productId]: true }));
        setReviewItem(null);
      } else {
        toast.error(res.message || "Failed to submit review.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Could not publish your review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const totalSpent = orders.reduce((sum, order) => {
    if (order.orderStatus === "Completed" || order.paymentStatus === "Paid") {
      return sum + order.grandTotal;
    }
    return sum;
  }, 0);

  if (loading || authLoading) {
    return (
      <div className="relative min-h-screen bg-verdant-cream text-verdant-emerald">
        <Navbar />
        <div className="relative w-full h-[360px] md:h-[400px] overflow-hidden flex items-center justify-center border-b border-verdant-emerald/5">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/products/ksp_18.jpg"
              alt="Luxury Jewelry Banner"
              className="w-full h-full object-cover object-center opacity-20 select-none pointer-events-none filter blur-[0.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-verdant-cream/40 to-verdant-cream" />
          </div>
          <div className="relative z-10 max-w-4xl w-full mx-auto px-6 pt-16 flex justify-center">
            <div className="glass-effect rounded-3xl p-8 md:p-10 w-full max-w-2xl border border-verdant-emerald/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center space-y-3">
              <div className="w-24 h-4 bg-verdant-emerald/10 rounded animate-pulse" />
              <div className="w-64 h-10 bg-verdant-emerald/15 rounded-lg animate-pulse" />
              <div className="w-96 h-4 bg-verdant-emerald/10 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 animate-pulse space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-verdant-emerald/10" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-verdant-emerald/10 rounded" />
                    <div className="w-16 h-3 bg-verdant-emerald/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-6">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 animate-pulse h-28" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-verdant-cream text-verdant-emerald selection:bg-verdant-gold selection:text-black">
      <Navbar />

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[30%] left-[-15%] w-[50vw] h-[50vw] bg-radial from-verdant-gold/8 to-transparent blur-[120px] pointer-events-none animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[20%] right-[-15%] w-[50vw] h-[50vw] bg-radial from-verdant-emerald/6 to-transparent blur-[140px] pointer-events-none animate-pulse"
          style={{ animationDuration: "10s" }}
        />
      </div>

      {/* HERO BANNER SECTION */}
      <div className="relative w-full h-[360px] md:h-[400px] overflow-hidden flex items-center justify-center border-b border-verdant-emerald/5">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/products/ksp_18.jpg"
            alt="Luxury Jewelry Banner"
            className="w-full h-full object-cover object-center opacity-80 scale-105 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-verdant-cream/10 via-verdant-cream/45 to-verdant-cream" />
        </div>

        <div className="relative z-10 max-w-4xl w-full mx-auto px-6 pt-16 flex justify-center">
          <div className="glass-effect rounded-3xl p-8 md:p-10 w-full max-w-2xl border border-verdant-emerald/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-3 relative">
            <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold font-bold flex items-center justify-center gap-1.5 pt-2">
              <CrestMark size={18} /> Client Order Vault
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-verdant-emerald leading-tight">
              My Orders
            </h1>
            <p className="text-xs text-verdant-emerald/75 leading-relaxed font-sans max-w-xl mx-auto">
              Review your purchase logs, track WhatsApp order confirmation, and submit critiques for your bespoke acquisitions.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        {error && (
          <div className="bg-verdant-danger/5 border border-verdant-danger/10 text-verdant-danger p-4 rounded-2xl text-xs mb-8 text-left">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="glass-card bg-white/40 border border-verdant-emerald/5 rounded-3xl p-8 sm:p-12 md:p-16 text-center max-w-xl mx-auto shadow-[0_10px_40px_-15px_rgba(var(--color-primary-rgb),0.05)] hover:border-verdant-gold/20 transition-all duration-300">
            <div className="w-20 h-20 bg-verdant-emerald/5 border border-verdant-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6 group hover:border-verdant-gold/40 transition-colors duration-300">
              <Package className="w-8 h-8 text-verdant-gold group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="font-serif text-2xl font-light text-verdant-emerald mb-3">No Orders Registered</h3>
            <p className="text-xs text-verdant-emerald/60 max-w-sm mx-auto mb-8 leading-relaxed font-sans">
              You have not placed any orders yet. Visit our catalog to discover and order our handcrafted botanical collections.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="gold-gradient-bg text-black hover:scale-105 active:scale-95 text-[10px] tracking-[0.2em] uppercase font-bold px-8 py-4 rounded-full shadow-md transition-all duration-300 cursor-pointer"
            >
              Discover Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* STICKY USER PROFILE & METRICS SIDEBAR */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="glass-card bg-white/60 backdrop-blur-md border border-verdant-emerald/10 rounded-3xl p-6 shadow-[0_10px_35px_rgba(var(--color-primary-rgb),0.02)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-verdant-gold/10 to-transparent blur-xl pointer-events-none" />

                <div className="flex items-center gap-4 mb-6 text-left relative z-10">
                  <div className="w-12 h-12 rounded-full bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center text-verdant-gold text-lg font-serif">
                    {user?.name ? user.name[0].toUpperCase() : "V"}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-verdant-emerald">{user?.name}</h3>
                    <span className="text-[9px] tracking-widest text-verdant-gold uppercase font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-verdant-gold" /> Atelier Patron
                    </span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-verdant-emerald/5 pt-5 text-left font-mono text-[9px] uppercase tracking-widest text-verdant-emerald/50">
                  <div className="flex justify-between items-center">
                    <span>Total Orders</span>
                    <span className="font-sans font-bold text-verdant-emerald text-sm">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ledger Value</span>
                    <span className="font-sans font-bold text-verdant-emerald text-sm">
                      ₹{totalSpent.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Order Protocol</span>
                    <span className="font-sans font-bold text-verdant-gold text-xs flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Direct
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 text-left space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-verdant-gold shrink-0" />
                  <h4 className="font-serif text-xs tracking-wider font-semibold text-verdant-emerald uppercase">
                    WhatsApp Order Protocol
                  </h4>
                </div>
                <p className="text-[10px] text-verdant-emerald/60 leading-relaxed font-sans">
                  Orders are initiated via checkout and confirmed manually by our team on WhatsApp. Tracking logs and product review eligibility update dynamically as your order progresses.
                </p>
              </div>
            </div>

            {/* ORDER LIST CONTAINER */}
            <div className="lg:col-span-8 space-y-6">
              {orders.map((order) => {
                const currentStatus = order.orderStatus || "Pending Confirmation";
                const totalUnits = order.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || 0;
                const itemsSummary = order.items?.map((it: any) => it.name).join(", ");

                return (
                  <div
                    key={order._id}
                    className="glass-card bg-white/60 border border-verdant-emerald/5 hover:border-verdant-gold/25 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(var(--color-primary-rgb),0.02)] hover:shadow-[0_20px_50px_-12px_rgba(var(--color-primary-rgb),0.08)] hover:-translate-y-0.5 transition-all duration-300 text-left"
                  >
                    <div
                      onClick={() => setSelectedOrder(order)}
                      className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer select-none hover:bg-verdant-emerald/[0.01] transition-colors group"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto flex-1 font-mono text-[9px] uppercase tracking-wider text-verdant-emerald/75">
                        <div>
                          <span className="text-verdant-emerald/40 block text-[8px] tracking-widest mb-0.5">Order ID</span>
                          <span className="font-bold text-verdant-emerald text-xs font-sans tracking-wide">
                            #{order.orderNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-verdant-emerald/40 block text-[8px] tracking-widest mb-0.5">Date Placed</span>
                          <span className="font-semibold text-verdant-emerald text-xs font-sans tracking-wide flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-verdant-gold/75 shrink-0" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-verdant-emerald/40 block text-[8px] tracking-widest mb-0.5">Total Amount</span>
                          <span className="font-bold text-verdant-emerald text-xs font-sans tracking-wide">
                            ₹{order.grandTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span className="text-verdant-emerald/40 block text-[8px] tracking-widest mb-0.5">Current Status</span>
                          <span
                            className={`text-[8.5px] px-2.5 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 mt-0.5 whitespace-nowrap ${getStatusBadgeStyle(
                              currentStatus
                            )}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {currentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-verdant-emerald/5 pt-4 md:pt-0 shrink-0">
                        <button className="text-[11px] font-bold text-verdant-emerald group-hover:text-verdant-gold transition-colors font-sans uppercase flex items-center gap-1.5 cursor-pointer">
                          View Details{" "}
                          <ArrowRight className="w-4 h-4 text-verdant-gold transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>

                    {/* Product Summary Row */}
                    <div className="px-6 pb-4 pt-0 border-t border-verdant-emerald/5 text-xs text-verdant-emerald/60 flex items-center justify-between font-sans">
                      <span className="truncate max-w-[80%]">
                        <strong className="text-verdant-emerald/80 font-medium">Items ({totalUnits}):</strong>{" "}
                        {itemsSummary}
                      </span>
                      {currentStatus === "Completed" && (
                        <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1 font-mono uppercase tracking-wider shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible for Review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-card bg-verdant-cream border border-verdant-emerald/10 w-full max-w-4xl rounded-[2rem] shadow-[0_25px_70px_-10px_rgba(var(--color-primary-rgb),0.2)] relative z-10 overflow-hidden max-h-[90vh] flex flex-col text-left text-verdant-emerald"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-verdant-emerald/5 flex justify-between items-center bg-white/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] tracking-widest font-mono uppercase text-verdant-emerald/50">
                      Order Summary
                    </span>
                    <span
                      className={`text-[8.5px] px-2.5 py-0.5 rounded-full font-bold border inline-block uppercase tracking-wider ${getStatusBadgeStyle(
                        selectedOrder.orderStatus || "Pending Confirmation"
                      )}`}
                    >
                      {selectedOrder.orderStatus || "Pending Confirmation"}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl md:text-2xl font-light text-verdant-emerald">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-verdant-emerald/40 hover:text-verdant-emerald bg-verdant-emerald/5 hover:bg-verdant-emerald/10 p-2 rounded-full cursor-pointer transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 bg-verdant-cream/40" data-lenis-prevent>
                {/* Retry WhatsApp banner if Pending Confirmation */}
                {selectedOrder.orderStatus === "Pending Confirmation" && (
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-bold text-amber-800 text-xs uppercase tracking-wider font-sans">
                        <MessageCircle className="w-4 h-4 text-amber-600" />
                        <span>Awaiting WhatsApp Confirmation</span>
                      </div>
                      <p className="text-[11px] text-verdant-emerald/80 font-sans">
                        Please confirm this order with our atelier team by manually sending the pre-filled message on WhatsApp.
                      </p>
                    </div>
                    {selectedOrder.whatsappUrl && (
                      <button
                        onClick={() => window.open(selectedOrder.whatsappUrl, "_blank", "noopener,noreferrer")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] uppercase tracking-wider font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm font-mono"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Open WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Items */}
                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <span className="text-[10px] tracking-widest uppercase text-verdant-gold font-bold font-sans block mb-4 border-b border-verdant-emerald/5 pb-2">
                        Acquired Masterpieces ({selectedOrder.items?.length || 0} items)
                      </span>
                      <div className="divide-y divide-verdant-emerald/5">
                        {selectedOrder.items?.map((item: any, idx: number) => {
                          const productId = item.product?._id || item.product;
                          const hasBeenReviewed = reviewedProductIds[productId];
                          const isOrderCompleted = selectedOrder.orderStatus === "Completed";

                          return (
                            <div key={idx} className="flex flex-col py-4 first:pt-0 last:pb-0 gap-3">
                              <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-verdant-emerald/10 bg-white/50 shrink-0 shadow-xs flex items-center justify-center p-0.5">
                                  {isVideoUrl(item.image) ? (
                                    <video
                                      src={getImageUrl(item.image)}
                                      className="w-full h-full object-cover"
                                      muted
                                      playsInline
                                      autoPlay
                                      loop
                                    />
                                  ) : (
                                    <img
                                      src={getImageUrl(item.image)}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <h4 className="font-serif text-sm text-verdant-emerald font-medium truncate">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-3 text-[10px] text-verdant-emerald/50 font-sans tracking-wide mt-1">
                                    <span>
                                      Qty: {item.quantity} &times; ₹{item.price.toLocaleString("en-IN")}
                                    </span>
                                    {item.size && (
                                      <span className="text-verdant-gold font-bold">Size: {item.size}</span>
                                    )}
                                    {item.variant && (
                                      <span className="text-verdant-gold font-bold">Option: {item.variant}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-semibold text-xs text-verdant-emerald font-mono">
                                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>

                              {/* Review Action for Completed Orders */}
                              {isOrderCompleted && (
                                <div className="flex justify-end pt-1">
                                  {hasBeenReviewed ? (
                                    <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Critique Submitted
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenReview(productId, item.name)}
                                      className="text-[10px] uppercase tracking-wider font-bold text-verdant-gold hover:text-verdant-emerald flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Star className="w-3.5 h-3.5 fill-verdant-gold" /> Write Critique / Review
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status History Timeline */}
                    {selectedOrder.statusTimeline && selectedOrder.statusTimeline.length > 0 && (
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-verdant-gold font-bold font-sans block mb-4 border-b border-verdant-emerald/5 pb-2">
                          Order Progress History
                        </span>
                        <div className="space-y-3 font-sans text-xs">
                          {selectedOrder.statusTimeline.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3.5 rounded-xl bg-white/50 border border-verdant-emerald/5 shadow-2xs"
                            >
                              <Clock className="w-4 h-4 text-verdant-gold shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                                      item.status
                                    )}`}
                                  >
                                    {item.status}
                                  </span>
                                  <span className="text-[9px] text-verdant-emerald/45 font-mono">
                                    {new Date(item.date).toLocaleString()}
                                  </span>
                                </div>
                                {item.comment && (
                                  <p className="text-[11px] text-verdant-emerald/75 mt-1 leading-relaxed">
                                    {item.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shipment Details */}
                    <div>
                      <span className="text-[10px] tracking-widest uppercase text-verdant-gold font-bold font-sans block mb-4 border-b border-verdant-emerald/5 pb-2">
                        Shipment & Tracking
                      </span>
                      {selectedOrder.trackingUrl ? (
                        <div className="bg-white/60 border border-verdant-emerald/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                          <div className="flex items-start gap-3.5">
                            <div className="p-2.5 bg-verdant-emerald/5 rounded-xl border border-verdant-emerald/10 text-verdant-gold shrink-0">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div className="text-xs leading-relaxed text-left">
                              <p className="font-semibold text-verdant-emerald text-sm">Shipment Dispatched</p>
                              <p className="text-verdant-emerald/60 mt-0.5 font-sans tracking-wide">
                                Your collection is in transit. Click below to view live tracking.
                              </p>
                            </div>
                          </div>
                          <a
                            href={selectedOrder.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gold-gradient-bg text-black text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full shadow-xs hover:scale-105 active:scale-95 transition-all select-none whitespace-nowrap inline-flex items-center gap-1.5 justify-center cursor-pointer font-sans"
                          >
                            Track Package <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="bg-white/30 border border-verdant-emerald/5 rounded-2xl p-4 flex items-center gap-3">
                          <div className="p-2 bg-verdant-emerald/5 rounded-lg border border-verdant-emerald/10 text-verdant-emerald/40 shrink-0">
                            <Truck className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-verdant-emerald/50 italic font-mono uppercase tracking-wide">
                            {selectedOrder.orderStatus === "Shipped" || selectedOrder.orderStatus === "Delivered"
                              ? "Dispatched via private courier."
                              : "Tracking details will be posted once your package is dispatched."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Address & Details */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white/50 border border-verdant-emerald/5 rounded-2xl p-5 space-y-4 shadow-xs text-left">
                      <div className="flex items-center gap-2 border-b border-verdant-emerald/5 pb-2">
                        <MapPin className="w-4 h-4 text-verdant-gold shrink-0" />
                        <span className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald">
                          Destination Shipping
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-verdant-emerald/80 leading-relaxed">
                        <p className="font-semibold text-verdant-emerald text-sm">
                          {selectedOrder.shippingAddress?.name}
                        </p>
                        <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                        {selectedOrder.shippingAddress?.addressLine2 && (
                          <p>{selectedOrder.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                          {selectedOrder.shippingAddress?.postalCode || ""}
                        </p>
                        <p className="font-sans text-verdant-emerald/40 text-[9px] uppercase tracking-wider pt-2">
                          Country: {selectedOrder.shippingAddress?.country || "India"}
                        </p>
                        <p className="font-mono text-[10px] pt-1">
                          Contact Phone:{" "}
                          <strong className="text-verdant-emerald">{selectedOrder.shippingAddress?.phone}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/50 border border-verdant-emerald/5 rounded-2xl p-5 space-y-4 shadow-xs text-left">
                      <div className="flex items-center gap-2 border-b border-verdant-emerald/5 pb-2">
                        <MessageCircle className="w-4 h-4 text-verdant-gold shrink-0" />
                        <span className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald">
                          Order Method
                        </span>
                      </div>
                      <div className="text-xs space-y-2 text-verdant-emerald/80 font-mono leading-relaxed">
                        <div>
                          <span className="text-verdant-emerald/50 block text-[9px] uppercase tracking-wider mb-0.5">
                            Ordering Channel
                          </span>
                          <span className="font-sans font-semibold text-verdant-emerald text-sm">
                            WhatsApp Manual Confirmation
                          </span>
                        </div>
                        <div>
                          <span className="text-verdant-emerald/50 block text-[9px] uppercase tracking-wider mb-0.5">
                            Current Order Status
                          </span>
                          <span className="text-xs text-verdant-emerald font-bold">
                            {selectedOrder.orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-verdant-emerald/5 bg-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-left w-full sm:w-auto font-mono text-[10px] space-y-1">
                  <span className="text-[9px] tracking-widest uppercase text-verdant-emerald/40 block font-bold">
                    Order Breakdown
                  </span>
                  {selectedOrder.discountAmount > 0 && (
                    <>
                      <div className="flex justify-between gap-4 text-verdant-emerald/60">
                        <span>Original Subtotal:</span>
                        <span>₹{(selectedOrder.subtotal || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-verdant-success font-bold">
                        <span>Storewide Discount:</span>
                        <span>-₹{selectedOrder.discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-baseline justify-between gap-4 pt-1 font-sans border-t border-verdant-emerald/10">
                    <span className="text-xs font-semibold text-verdant-emerald">Grand Total:</span>
                    <span className="font-bold text-lg text-verdant-emerald">
                      ₹{selectedOrder.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full sm:w-auto border border-verdant-emerald/20 hover:border-verdant-gold hover:bg-white px-8 py-3 rounded-full text-[10px] tracking-widest uppercase font-bold text-verdant-emerald transition-all duration-300 cursor-pointer"
                >
                  Close Vault
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCT REVIEW SUBMISSION MODAL */}
      <AnimatePresence>
        {reviewItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card bg-[#FAF7F4] border border-verdant-emerald/15 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 text-left text-verdant-emerald"
            >
              <button
                onClick={() => setReviewItem(null)}
                className="absolute top-5 right-5 text-verdant-emerald/50 hover:text-verdant-emerald cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[9px] uppercase tracking-widest text-verdant-gold font-mono font-bold block">
                  Completed Order Feedback
                </span>
                <h3 className="font-serif text-xl font-light text-verdant-emerald mt-1">
                  Critique {reviewItem.productName}
                </h3>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Star Rating Selector */}
                <div>
                  <label className="block text-[8.5px] uppercase tracking-widest font-bold text-verdant-emerald/70 mb-2">
                    Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (reviewHoverRating !== null ? reviewHoverRating : reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(null)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-115"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isActive
                                ? "text-amber-500 fill-amber-500"
                                : "text-verdant-emerald/20"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="font-mono text-xs font-bold text-verdant-emerald/60 ml-2">
                      {reviewRating} of 5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[8.5px] uppercase tracking-widest font-bold text-verdant-emerald/70 mb-2">
                    Your Critique / Experience *
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    placeholder="Share your thoughts on the craftsmanship, design, and finish..."
                    className="w-full p-4 rounded-xl bg-white border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:border-verdant-gold focus:outline-hidden font-sans"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewItem(null)}
                    className="px-5 py-2.5 rounded-full border border-verdant-emerald/20 text-xs text-verdant-emerald hover:bg-verdant-emerald/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !reviewComment.trim()}
                    className="gold-gradient-bg text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {reviewSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Critique
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
