"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Package, ArrowLeft, ArrowRight, ClipboardList, MapPin, Truck, HelpCircle } from "lucide-react";
import { getMyOrdersApi } from "../../services/checkout";
import { useAuthStore } from "../../store/authStore";
import { getImageUrl } from "../../utils/api";

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal or expanded view states
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to home
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    } else if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading]);

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

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F4EA] py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-verdant-emerald" />
        <span className="text-[10px] tracking-widest text-verdant-emerald/50 uppercase font-bold">Loading purchase logs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EA] text-verdant-emerald pt-28 pb-16 selection:bg-verdant-gold selection:text-black">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Back Link */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-[9px] tracking-widest uppercase font-bold text-verdant-emerald/60 hover:text-verdant-emerald mb-8 transition-colors select-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Home Page
        </button>

        <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-left mb-4">
          My Purchase Logs
        </h1>
        <p className="text-xs text-verdant-emerald/60 text-left mb-10 leading-relaxed font-sans">
          Review the status of your handcrafted collections, shipping track logs, and invoices.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-4 rounded-2xl text-xs mb-8 text-left">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="glass-card bg-white/40 border border-verdant-emerald/5 rounded-3xl p-12 text-center shadow-xs">
            <Package className="w-12 h-12 text-verdant-gold mx-auto mb-4" />
            <h3 className="font-serif text-xl font-light text-verdant-emerald mb-2">No Orders Registered</h3>
            <p className="text-xs text-verdant-emerald/60 max-w-sm mx-auto mb-6 leading-relaxed">
              You haven't placed any orders yet. Visit our catalog to add products to your secure collection.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="gold-gradient-bg text-black hover:scale-103 active:scale-97 text-[10px] tracking-widest uppercase font-bold px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              Discover Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;

              return (
                <div
                  key={order._id}
                  className="glass-card bg-white/40 border border-verdant-emerald/5 hover:border-verdant-gold/20 rounded-3xl overflow-hidden shadow-xs transition-all duration-300 text-left"
                >
                  {/* Order Overview Header */}
                  <div
                    onClick={() => toggleExpandOrder(order._id)}
                    className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-wider text-verdant-emerald/75">
                      <div>
                        <span className="text-verdant-emerald/40 block">Order Number</span>
                        <span className="font-bold text-verdant-emerald text-[11px] font-sans">#{order.orderNumber}</span>
                      </div>
                      <div>
                        <span className="text-verdant-emerald/40 block">Date Placed</span>
                        <span className="font-semibold text-verdant-emerald text-[11px] font-sans">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-verdant-emerald/40 block">Grand Total</span>
                        <span className="font-semibold text-verdant-emerald text-[11px] font-sans">
                          ₹{order.grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-verdant-emerald/40 block">Payment Status</span>
                        <span
                          className={`text-[8px] px-2 py-0.5 rounded-full font-bold border inline-block mt-0.5 ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                              : order.paymentStatus === "Failed"
                              ? "bg-red-500/10 border-red-500/20 text-red-700"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between border-t md:border-t-0 border-verdant-emerald/5 pt-3 md:pt-0">
                      <span
                        className={`text-[8.5px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                          order.orderStatus === "Delivered"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                            : order.orderStatus === "Cancelled"
                            ? "bg-red-500/10 border-red-500/20 text-red-700"
                            : "bg-verdant-gold/10 border-verdant-gold/20 text-verdant-gold"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <button className="text-xs font-semibold text-verdant-emerald hover:text-verdant-gold transition-colors font-mono uppercase flex items-center gap-1">
                        {isExpanded ? "Collapse" : "Details"}{" "}
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden bg-[#0F4C3A]/2 border-t border-verdant-emerald/5"
                      >
                        <div className="p-6 space-y-6">
                          
                          {/* Items List */}
                          <div>
                            <span className="text-[8.5px] tracking-wider uppercase text-verdant-gold font-bold font-mono block mb-3 border-b border-verdant-emerald/5 pb-1">
                              Acquired Masterpieces
                            </span>
                            <div className="space-y-3 font-mono text-[10px]">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center gap-4">
                                  <span className="text-verdant-emerald font-sans font-medium text-xs">
                                    {item.name} <span className="text-verdant-emerald/50 font-mono text-[9px]">x{item.quantity}</span>
                                  </span>
                                  <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tracking Log */}
                          <div>
                            <span className="text-[8.5px] tracking-wider uppercase text-verdant-gold font-bold font-mono block mb-3 border-b border-verdant-emerald/5 pb-1">
                              Shipment Logs
                            </span>
                            {order.trackingNumber ? (
                              <div className="bg-white/50 border border-verdant-emerald/5 rounded-2xl p-4 flex items-start gap-4">
                                <Truck className="w-5 h-5 text-verdant-gold shrink-0 mt-0.5" />
                                <div className="text-[10px] leading-relaxed">
                                  <p className="font-semibold text-verdant-emerald">Courier: {order.courierName}</p>
                                  <p className="font-mono text-verdant-emerald/60 mt-0.5">Tracking Number: {order.trackingNumber}</p>
                                  <p className="mt-1 font-semibold uppercase tracking-wider text-[8.5px]">Status: {order.shipmentStatus || "In-Transit"}</p>
                                  {order.expectedDelivery && (
                                    <p className="mt-0.5 text-verdant-emerald/60">Expected Delivery: {new Date(order.expectedDelivery).toLocaleDateString()}</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-verdant-emerald/50 italic font-mono uppercase">
                                Shipping timeline logs will update once courier tracking tags are loaded by administration.
                              </p>
                            )}
                          </div>

                          {/* Order Address Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[9px] uppercase tracking-wider text-verdant-emerald/75">
                            <div>
                              <span className="text-verdant-gold font-bold block mb-1">Destination Shipping</span>
                              <span className="text-verdant-emerald font-semibold font-sans">{order.shippingAddress.name}</span><br />
                              <span>{order.shippingAddress.addressLine1}</span><br />
                              <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                            </div>
                            <div>
                              <span className="text-verdant-gold font-bold block mb-1">Payment Ledger</span>
                              <span>Method: Digital Payment (Razorpay)</span><br />
                              {order.razorpayPaymentId && (
                                <span className="font-mono text-[8.5px]">Payment ID: {order.razorpayPaymentId}</span>
                              )}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
