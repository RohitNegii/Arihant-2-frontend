"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Package, ArrowLeft, ArrowRight, X, MapPin, Truck, Calendar, CreditCard, ExternalLink, ShieldCheck, Sparkles, Award } from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import { getMyOrdersApi } from "../../services/checkout";
import { useAuthStore } from "../../store/authStore";
import { useScrollStore } from "../../store/scroll-store";
import { getImageUrl } from "../../utils/api";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { lenis } = useScrollStore();
  const authLoading = !isInitialized;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    } else if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedOrder) {
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
  }, [selectedOrder, lenis]);

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

  const totalSpent = orders.reduce((sum, order) => {
    if (order.paymentStatus === "Paid") {
      return sum + order.grandTotal;
    }
    return sum;
  }, 0);

  if (loading || authLoading) {
    return (
      <div className="relative min-h-screen bg-verdant-cream text-verdant-emerald">
        {/* Navbar */}
        <Navbar />

        {/* Hero Banner Section */}
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

        {/* Skeleton list of cards */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 animate-pulse space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-verdant-emerald/10" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-verdant-emerald/10 rounded" />
                    <div className="w-16 h-3 bg-verdant-emerald/5 rounded" />
                  </div>
                </div>
                <div className="border-t border-verdant-emerald/5 pt-5 space-y-3">
                  <div className="h-4 bg-verdant-emerald/5 rounded" />
                  <div className="h-4 bg-verdant-emerald/5 rounded" />
                </div>
              </div>
            </div>

            {/* List Skeleton */}
            <div className="lg:col-span-8 space-y-6">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 animate-pulse">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="w-16 h-3 bg-verdant-emerald/5 rounded" />
                          <div className="w-24 h-5 bg-verdant-emerald/10 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="w-24 h-8 bg-verdant-emerald/10 rounded-full shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-verdant-cream text-verdant-emerald selection:bg-verdant-gold selection:text-black">
      {/* Navbar */}
      <Navbar />

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[30%] left-[-15%] w-[50vw] h-[50vw] bg-radial from-verdant-gold/8 to-transparent blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[-15%] w-[50vw] h-[50vw] bg-radial from-verdant-emerald/6 to-transparent blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* HERO BANNER SECTION */}
      <div className="relative w-full h-[360px] md:h-[400px] overflow-hidden flex items-center justify-center border-b border-verdant-emerald/5">
        {/* Background Image with Elegant Light Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/products/ksp_18.jpg"
            alt="Luxury Jewelry Banner"
            className="w-full h-full object-cover object-center opacity-80 scale-105 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-verdant-cream/10 via-verdant-cream/45 to-verdant-cream" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 max-w-4xl w-full mx-auto px-6 pt-16 flex justify-center">
          <div className="glass-effect rounded-3xl p-8 md:p-10 w-full max-w-2xl border border-verdant-emerald/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-3 relative">
            
            <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold font-bold flex items-center justify-center gap-1.5 pt-2">
              <CrestMark size={18} /> Secure Client Vault
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-verdant-emerald leading-tight">
              My Purchase Logs
            </h1>
            <p className="text-xs text-verdant-emerald/75 leading-relaxed font-sans max-w-xl mx-auto">
              Track the creation progress, delivery logs, and authenticated GIA invoices of your bespoke collections.
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
              You haven't placed any orders yet. Visit our catalog to discover and secure our handcrafted botanical collections.
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
              {/* Profile Card */}
              <div className="glass-card bg-white/60 backdrop-blur-md border border-verdant-emerald/10 rounded-3xl p-6 shadow-[0_10px_35px_rgba(var(--color-primary-rgb),0.02)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-verdant-gold/10 to-transparent blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-6 text-left relative z-10">
                  <div className="w-12 h-12 rounded-full bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center text-verdant-gold text-lg font-serif">
                    {user?.name ? user.name[0].toUpperCase() : "V"}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-verdant-emerald">{user?.name}</h3>
                    <span className="text-[9px] tracking-widest text-verdant-gold uppercase font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-verdant-gold" /> Atelier Collector
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 border-t border-verdant-emerald/5 pt-5 text-left font-mono text-[9px] uppercase tracking-widest text-verdant-emerald/50">
                  <div className="flex justify-between items-center">
                    <span>Acquisitions</span>
                    <span className="font-sans font-bold text-verdant-emerald text-sm">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ledger Value</span>
                    <span className="font-sans font-bold text-verdant-emerald text-sm">₹{totalSpent.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status Level</span>
                    <span className="font-sans font-bold text-verdant-gold text-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> V I P
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Trust Card */}
              <div className="glass-card bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 text-left space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-verdant-gold shrink-0" />
                  <h4 className="font-serif text-xs tracking-wider font-semibold text-verdant-emerald uppercase">The Verdant Guarantee</h4>
                </div>
                <p className="text-[10px] text-verdant-emerald/60 leading-relaxed font-sans">
                  All selections are hand-set with conflict-free diamonds or responsibly mined botanical crystals. Every gold element is 18K Hallmarked or 950 Platinum base. Verified by GIA certification protocols.
                </p>
              </div>
            </div>

            {/* ORDER LIST CONTAINER */}
            <div className="lg:col-span-8 space-y-6">
              {orders.map((order) => {
                return (
                  <div
                    key={order._id}
                    className="glass-card bg-white/60 border border-verdant-emerald/5 hover:border-verdant-gold/25 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(var(--color-primary-rgb),0.02)] hover:shadow-[0_20px_50px_-12px_rgba(var(--color-primary-rgb),0.08)] hover:-translate-y-0.5 transition-all duration-300 text-left"
                  >
                    {/* Order Overview Header */}
                    <div
                      onClick={() => setSelectedOrder(order)}
                      className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer select-none hover:bg-verdant-emerald/[0.01] transition-colors group"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto flex-1 font-mono text-[9px] uppercase tracking-wider text-verdant-emerald/75">
                        <div>
                          <span className="text-verdant-emerald/40 block text-[8px] tracking-widest mb-0.5">Order Number</span>
                          <span className="font-bold text-verdant-emerald text-xs font-sans tracking-wide">#{order.orderNumber}</span>
                        </div>
                        <div>
                          <span className="text-verdant-emerald/40 block text-[8px] tracking-widest mb-0.5">Date Placed</span>
                          <span className="font-semibold text-verdant-emerald text-xs font-sans tracking-wide flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-verdant-gold/75 shrink-0" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-verdant-emerald/40 block text-[8px] tracking-widest mb-0.5">Grand Total</span>
                          <span className="font-bold text-verdant-emerald text-xs font-sans tracking-wide">
                            ₹{order.grandTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span className="text-verdant-emerald/40 block text-[8px] tracking-widest mb-0.5">Payment Status</span>
                          <span
                            className={`text-[8.5px] px-2.5 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 mt-0.5 ${
                              order.paymentStatus === "Paid"
                                ? "bg-verdant-success/5 border-verdant-success/20 text-verdant-success"
                                : order.paymentStatus === "Failed"
                                ? "bg-verdant-danger/5 border-verdant-danger/20 text-verdant-danger"
                                : "bg-verdant-warning/5 border-verdant-warning/20 text-verdant-warning"
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${
                              order.paymentStatus === "Paid"
                                ? "bg-verdant-success"
                                : order.paymentStatus === "Failed"
                                ? "bg-verdant-danger"
                                : "bg-verdant-warning"
                            }`} />
                            {order.paymentStatus}
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
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
                  <span className="text-[9px] tracking-widest font-mono uppercase text-verdant-emerald/50">Order Detail Ledger</span>
                  <h2 className="font-serif text-xl md:text-2xl font-light text-verdant-emerald flex items-center gap-2">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Items & Shipment */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Items List */}
                    <div>
                      <span className="text-[10px] tracking-widest uppercase text-verdant-gold font-bold font-sans block mb-4 border-b border-verdant-emerald/5 pb-2">
                        Acquired Masterpieces ({selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'})
                      </span>
                      <div className="divide-y divide-verdant-emerald/5">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
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
                              <h4 className="font-serif text-sm text-verdant-emerald font-medium truncate">{item.name}</h4>
                              <div className="flex items-center gap-3 text-[10px] text-verdant-emerald/50 font-sans tracking-wide mt-1">
                                <span>Qty: {item.quantity} &times; ₹{item.price.toLocaleString("en-IN")}</span>
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
                            <div className="text-right shrink-0">
                              <span className="font-semibold text-xs text-verdant-emerald font-mono">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipment Details */}
                    <div>
                      <span className="text-[10px] tracking-widest uppercase text-verdant-gold font-bold font-sans block mb-4 border-b border-verdant-emerald/5 pb-2">
                        Shipment Logs
                      </span>
                      {selectedOrder.trackingUrl ? (
                        <div className="bg-white/60 border border-verdant-emerald/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                          <div className="flex items-start gap-3.5">
                            <div className="p-2.5 bg-verdant-emerald/5 rounded-xl border border-verdant-emerald/10 text-verdant-gold shrink-0">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div className="text-xs leading-relaxed text-left">
                              <p className="font-semibold text-verdant-emerald text-sm">Your order has been shipped!</p>
                              <p className="text-verdant-emerald/60 mt-0.5 font-sans tracking-wide">We have dispatched your handcrafted collection.</p>
                            </div>
                          </div>
                          <a
                            href={selectedOrder.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gold-gradient-bg text-black text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full shadow-xs hover:scale-105 active:scale-95 transition-all select-none whitespace-nowrap inline-flex items-center gap-1.5 justify-center cursor-pointer font-sans"
                          >
                            Track Order <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : selectedOrder.trackingNumber ? (
                        <div className="bg-white/60 border border-verdant-emerald/5 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                          <div className="p-2.5 bg-verdant-emerald/5 rounded-xl border border-verdant-emerald/10 text-verdant-gold shrink-0">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div className="text-xs leading-relaxed text-left space-y-1">
                            <p className="font-semibold text-verdant-emerald text-sm">Courier: {selectedOrder.courierName}</p>
                            <p className="text-verdant-emerald/60">Tracking Number: <span className="font-mono text-verdant-emerald font-semibold select-all">{selectedOrder.trackingNumber}</span></p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-verdant-gold pt-1">Status: {selectedOrder.shipmentStatus || "In-Transit"}</p>
                            {selectedOrder.expectedDelivery && (
                              <p className="text-verdant-emerald/50 text-[10px]">Expected Delivery: {new Date(selectedOrder.expectedDelivery).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/30 border border-verdant-emerald/5 rounded-2xl p-4 flex items-center gap-3">
                          <div className="p-2 bg-verdant-emerald/5 rounded-lg border border-verdant-emerald/10 text-verdant-emerald/40 shrink-0">
                            <Truck className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-verdant-emerald/50 italic font-mono uppercase tracking-wide">
                            Your order has not been shipped yet. Tracking logs will appear once dispatched.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Address and Payment */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Shipping Card */}
                    <div className="bg-white/50 border border-verdant-emerald/5 rounded-2xl p-5 space-y-4 shadow-xs text-left">
                      <div className="flex items-center gap-2 border-b border-verdant-emerald/5 pb-2">
                        <MapPin className="w-4 h-4 text-verdant-gold shrink-0" />
                        <span className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald">Destination Shipping</span>
                      </div>
                      <div className="text-xs space-y-1 text-verdant-emerald/80 leading-relaxed">
                        <p className="font-semibold text-verdant-emerald text-sm">{selectedOrder.shippingAddress.name}</p>
                        <p>{selectedOrder.shippingAddress.addressLine1}</p>
                        {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode || ""}</p>
                        <p className="font-sans text-verdant-emerald/40 text-[9px] uppercase tracking-wider pt-2">Country: {selectedOrder.shippingAddress.country || "India"}</p>
                      </div>
                    </div>

                    {/* Payment Ledger Card */}
                    <div className="bg-white/50 border border-verdant-emerald/5 rounded-2xl p-5 space-y-4 shadow-xs text-left">
                      <div className="flex items-center gap-2 border-b border-verdant-emerald/5 pb-2">
                        <CreditCard className="w-4 h-4 text-verdant-gold shrink-0" />
                        <span className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald">Payment Ledger</span>
                      </div>
                      <div className="text-xs space-y-3.5 text-verdant-emerald/80 font-mono leading-relaxed">
                        <div>
                          <span className="text-verdant-emerald/50 block text-[9px] uppercase tracking-wider mb-0.5">Method</span>
                          <span className="font-sans font-semibold text-verdant-emerald text-sm">Digital Payment (Razorpay)</span>
                        </div>
                        {selectedOrder.razorpayPaymentId && (
                          <div>
                            <span className="text-verdant-emerald/50 block text-[9px] uppercase tracking-wider mb-0.5">Transaction ID</span>
                            <span className="text-[10px] text-verdant-emerald font-semibold select-all">{selectedOrder.razorpayPaymentId}</span>
                          </div>
                        )}
                        {selectedOrder.razorpayOrderId && (
                          <div>
                            <span className="text-verdant-emerald/50 block text-[9px] uppercase tracking-wider mb-0.5">Order ID Reference</span>
                            <span className="text-[10px] text-verdant-emerald select-all">{selectedOrder.razorpayOrderId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-verdant-emerald/5 bg-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-left w-full sm:w-auto font-mono text-[10px] space-y-1">
                  <span className="text-[9px] tracking-widest uppercase text-verdant-emerald/40 block font-bold">Order Breakdown</span>
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
                    <span className="font-bold text-lg text-verdant-emerald">₹{selectedOrder.grandTotal.toLocaleString("en-IN")}</span>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
