"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Package,
  ArrowRight,
  X,
  MapPin,
  Truck,
  Calendar,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Clock,
  Star,
  Send,
  CheckCircle2,
  Search,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
  Eye
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Pending Confirmation":
      return {
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
        dotClass: "bg-amber-500",
        label: "Pending Confirmation"
      };
    case "Confirmed":
      return {
        badgeClass: "bg-blue-50 text-blue-800 border-blue-200/80",
        dotClass: "bg-blue-500",
        label: "Confirmed"
      };
    case "Processing":
      return {
        badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
        dotClass: "bg-indigo-500",
        label: "In Atelier / Processing"
      };
    case "Shipped":
      return {
        badgeClass: "bg-purple-50 text-purple-800 border-purple-200/80",
        dotClass: "bg-purple-500",
        label: "Dispatched / In Transit"
      };
    case "Delivered":
    case "Completed":
      return {
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
        dotClass: "bg-emerald-500",
        label: "Delivered"
      };
    case "Cancelled":
      return {
        badgeClass: "bg-rose-50 text-rose-800 border-rose-200/80",
        dotClass: "bg-rose-500",
        label: "Cancelled"
      };
    default:
      return {
        badgeClass: "bg-neutral-100 text-neutral-800 border-neutral-200",
        dotClass: "bg-neutral-400",
        label: status || "Order Placed"
      };
  }
};

/**
 * Strips out internal admin logs (e.g. "from table dropdown", "updated by admin", etc.)
 * so the customer only sees legitimate user-facing shipment notes.
 */
const getCustomerFacingComment = (comment?: string): string | null => {
  if (!comment || typeof comment !== "string") return null;
  const lower = comment.toLowerCase();

  if (
    lower.includes("dropdown") ||
    lower.includes("table") ||
    lower.includes("status updated") ||
    lower.includes("manually updated") ||
    lower.includes("updated by") ||
    lower.includes("admin") ||
    lower.includes("order status:") ||
    lower.includes("order marked as")
  ) {
    return null;
  }

  return comment.trim();
};

/**
 * Stepper calculation
 * 1: Placed
 * 2: Confirmed
 * 3: Processing
 * 4: Shipped
 * 5: Delivered
 */
const getOrderStep = (status: string): number => {
  switch (status) {
    case "Pending Confirmation":
      return 1;
    case "Confirmed":
      return 2;
    case "Processing":
      return 3;
    case "Shipped":
      return 4;
    case "Delivered":
    case "Completed":
      return 5;
    case "Cancelled":
      return -1;
    default:
      return 1;
  }
};

type TabFilter = "ALL" | "PENDING" | "ACTIVE" | "DELIVERED" | "CANCELLED";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const authLoading = !isInitialized;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Client-side filtering & search (zero functionality change)
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In-order critique review modal state
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

  const handleCopyOrderId = (e: React.MouseEvent, orderNumber: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    toast.success(`Order ID #${orderNumber} copied`);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // Counts for tabs
  const counts = useMemo(() => {
    let pending = 0;
    let active = 0;
    let delivered = 0;
    let cancelled = 0;

    orders.forEach((o) => {
      const status = o.orderStatus || "Pending Confirmation";
      if (status === "Pending Confirmation") pending++;
      else if (["Confirmed", "Processing", "Shipped"].includes(status)) active++;
      else if (["Delivered", "Completed"].includes(status)) delivered++;
      else if (status === "Cancelled") cancelled++;
    });

    return { total: orders.length, pending, active, delivered, cancelled };
  }, [orders]);

  // Filtered list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = order.orderStatus || "Pending Confirmation";

      if (activeTab === "PENDING" && status !== "Pending Confirmation") return false;
      if (activeTab === "ACTIVE" && !["Confirmed", "Processing", "Shipped"].includes(status)) return false;
      if (activeTab === "DELIVERED" && !["Delivered", "Completed"].includes(status)) return false;
      if (activeTab === "CANCELLED" && status !== "Cancelled") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesNum = (order.orderNumber || "").toLowerCase().includes(q);
        const matchesRecipient = (order.shippingAddress?.name || "").toLowerCase().includes(q);
        const matchesItem = order.items?.some((it: any) => (it.name || "").toLowerCase().includes(q));
        return matchesNum || matchesRecipient || matchesItem;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] text-[#2C1820]">
        <Navbar />
        <main className="pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-3 pb-6 border-b border-[#EAE2D8]">
            <div className="w-24 h-3 bg-neutral-200 rounded-full" />
            <div className="w-48 h-8 bg-neutral-200 rounded-xl" />
            <div className="w-72 h-4 bg-neutral-200 rounded-full" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#EAE2D8] shadow-2xs space-y-4 animate-pulse">
                <div className="h-6 bg-neutral-200 rounded-md w-1/3" />
                <div className="h-20 bg-neutral-100 rounded-xl" />
                <div className="h-10 bg-neutral-200 rounded-md w-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#2C1820] selection:bg-[#C8A96A]/20 selection:text-[#2C1820]">
      <Navbar />

      <main className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EAE2D8]">
            <div className="text-left space-y-1">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#B58D4B] font-bold flex items-center gap-1.5 font-sans">
                <CrestMark size={14} /> My Account
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#2C1820] tracking-tight">
                My Orders
              </h1>
              <p className="text-xs sm:text-sm text-[#2C1820]/65 font-sans">
                Track your jewellery shipments, manage bespoke order confirmations, and review your acquisitions.
              </p>
            </div>

            {/* Orders Count Indicator */}
            {orders.length > 0 && (
              <div className="self-start sm:self-auto shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE2D8] text-xs font-medium text-[#2C1820]/75 shadow-2xs font-sans">
                  <Package className="w-3.5 h-3.5 text-[#B58D4B]" />
                  <span>
                    <strong className="text-[#2C1820] font-semibold">{orders.length}</strong> {orders.length === 1 ? "Order" : "Orders"}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* FILTER CONTROLS & SEARCH BAR */}
          {orders.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Horizontal Scrollable Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 text-xs font-sans">
                  <button
                    onClick={() => setActiveTab("ALL")}
                    className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "ALL"
                        ? "bg-[#2C1820] text-white shadow-2xs font-semibold"
                        : "bg-white text-[#2C1820]/70 hover:bg-[#F2ECE4] border border-[#EAE2D8]"
                    }`}
                  >
                    <span>All Orders</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeTab === "ALL" ? "bg-white/20 text-white" : "bg-neutral-100 text-[#2C1820]"
                      }`}
                    >
                      {counts.total}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("PENDING")}
                    className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "PENDING"
                        ? "bg-amber-700 text-white shadow-2xs font-semibold"
                        : "bg-white text-[#2C1820]/70 hover:bg-[#F2ECE4] border border-[#EAE2D8]"
                    }`}
                  >
                    <span>Pending</span>
                    {counts.pending > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          activeTab === "PENDING" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {counts.pending}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("ACTIVE")}
                    className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "ACTIVE"
                        ? "bg-blue-700 text-white shadow-2xs font-semibold"
                        : "bg-white text-[#2C1820]/70 hover:bg-[#F2ECE4] border border-[#EAE2D8]"
                    }`}
                  >
                    <span>Active</span>
                    {counts.active > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          activeTab === "ACTIVE" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-900"
                        }`}
                      >
                        {counts.active}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("DELIVERED")}
                    className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "DELIVERED"
                        ? "bg-emerald-700 text-white shadow-2xs font-semibold"
                        : "bg-white text-[#2C1820]/70 hover:bg-[#F2ECE4] border border-[#EAE2D8]"
                    }`}
                  >
                    <span>Delivered</span>
                    {counts.delivered > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          activeTab === "DELIVERED" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {counts.delivered}
                      </span>
                    )}
                  </button>

                  {counts.cancelled > 0 && (
                    <button
                      onClick={() => setActiveTab("CANCELLED")}
                      className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "CANCELLED"
                          ? "bg-rose-700 text-white shadow-2xs font-semibold"
                          : "bg-white text-[#2C1820]/70 hover:bg-[#F2ECE4] border border-[#EAE2D8]"
                      }`}
                    >
                      <span>Cancelled</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          activeTab === "CANCELLED" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-900"
                        }`}
                      >
                        {counts.cancelled}
                      </span>
                    </button>
                  )}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-[#2C1820]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order # or item..."
                    className="w-full pl-9 pr-7 py-1.5 rounded-full bg-white border border-[#EAE2D8] text-xs text-[#2C1820] placeholder:text-[#2C1820]/40 focus:outline-hidden focus:border-[#B58D4B] transition-all font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2C1820]/40 hover:text-[#2C1820] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ERROR NOTICE IF ANY */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs mb-6 text-left flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* EMPTY STATE - NO ORDERS EVER */}
        {orders.length === 0 ? (
          <div className="bg-white border border-[#EAE2D8] rounded-3xl p-10 sm:p-14 text-center max-w-md mx-auto shadow-xs my-8">
            <div className="w-16 h-16 bg-[#FBF9F6] border border-[#EAE2D8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#B58D4B]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-normal text-[#2C1820] mb-2">No Orders Placed Yet</h3>
            <p className="text-xs sm:text-sm text-[#2C1820]/65 max-w-xs mx-auto mb-6 leading-relaxed font-sans">
              Discover our botanical and royal handcrafted fine jewellery collection.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="gold-gradient-bg text-black hover:opacity-95 text-xs font-bold uppercase tracking-wider px-7 py-3 rounded-full shadow-xs transition-transform active:scale-98 cursor-pointer inline-flex items-center gap-2 font-sans"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* NO MATCHES FOR SEARCH / TAB */
          <div className="bg-white border border-[#EAE2D8] rounded-2xl p-10 text-center my-6 space-y-3">
            <Package className="w-8 h-8 text-[#2C1820]/30 mx-auto" />
            <h4 className="font-serif text-lg text-[#2C1820]">No matching orders found</h4>
            <p className="text-xs text-[#2C1820]/60 font-sans max-w-xs mx-auto">
              We couldn't find any orders matching your criteria.
            </p>
            <button
              onClick={() => {
                setActiveTab("ALL");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B58D4B] hover:text-[#2C1820] transition-colors pt-2 cursor-pointer font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const currentStatus = order.orderStatus || "Pending Confirmation";
              const badge = getStatusBadge(currentStatus);
              const stepIndex = getOrderStep(currentStatus);
              const isPending = currentStatus === "Pending Confirmation";
              const isCancelled = currentStatus === "Cancelled";
              const isDelivered = currentStatus === "Delivered" || currentStatus === "Completed";
              const placedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              return (
                <div
                  key={order._id}
                  className="bg-white border border-[#EAE2D8] rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow duration-200 text-left"
                >
                  {/* CARD HEADER */}
                  <div className="bg-[#FAF7F2] border-b border-[#EAE2D8] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-sans">
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                        <span>{badge.label}</span>
                      </span>

                      {/* Placed Date */}
                      <span className="text-[#2C1820]/60 text-xs">
                        Placed on <strong className="text-[#2C1820] font-medium">{placedDate}</strong>
                      </span>

                      {/* Order Number */}
                      <span className="inline-flex items-center gap-1 text-[#2C1820]/60 font-mono text-xs">
                        <span>#</span>
                        <strong className="text-[#2C1820]">{order.orderNumber}</strong>
                        <button
                          onClick={(e) => handleCopyOrderId(e, order.orderNumber)}
                          title="Copy Order ID"
                          className="text-[#2C1820]/40 hover:text-[#2C1820] cursor-pointer p-0.5"
                        >
                          {copiedId === order.orderNumber ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>
                    </div>

                    {/* Total & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE2D8]">
                      <div className="text-right sm:text-right">
                        <span className="text-[10px] uppercase tracking-wider text-[#2C1820]/50 block font-mono">
                          Order Total
                        </span>
                        <span className="font-serif text-base sm:text-lg font-semibold text-[#2C1820]">
                          ₹{order.grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="border border-[#EAE2D8] hover:border-[#B58D4B] bg-white hover:bg-[#FAF7F2] text-[#2C1820] px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1 font-sans shrink-0"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#B58D4B]" />
                      </button>
                    </div>
                  </div>

                  {/* WHATSAPP ACTION CALLOUT IF PENDING */}
                  {isPending && order.whatsappUrl && (
                    <div className="bg-amber-50/70 border-b border-amber-200/60 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start sm:items-center gap-2 text-amber-900 font-sans">
                        <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                        <span>
                          <strong>Action Required:</strong> Send the pre-filled WhatsApp message to confirm bespoke crafting.
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(order.whatsappUrl, "_blank", "noopener,noreferrer");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-4 py-1.5 rounded-full transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer font-sans shrink-0 self-start sm:self-auto"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Confirm on WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* CLEAN RESPONSIVE STEPPER FOR ACTIVE ORDERS */}
                  {!isCancelled && (
                    <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-[#EAE2D8]/60">
                      <div className="relative flex items-center justify-between max-w-lg mx-auto py-1">
                        {/* Background bar */}
                        <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-0.5 bg-neutral-200 z-0" />
                        {/* Filled bar */}
                        <div
                          className="absolute top-1/2 left-3 -translate-y-1/2 h-0.5 bg-[#B58D4B] transition-all duration-300 z-0"
                          style={{
                            width:
                              stepIndex <= 1
                                ? "0%"
                                : stepIndex === 2
                                ? "33%"
                                : stepIndex === 3
                                ? "50%"
                                : stepIndex === 4
                                ? "70%"
                                : "calc(100% - 24px)"
                          }}
                        />

                        {/* Step 1: Placed */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-[#B58D4B] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-[9px] uppercase font-semibold text-[#2C1820] mt-1 font-mono">
                            Placed
                          </span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs transition-colors ${
                              stepIndex >= 2
                                ? "bg-[#B58D4B] text-white"
                                : "bg-white border border-neutral-300 text-neutral-400"
                            }`}
                          >
                            {stepIndex >= 2 ? <Check className="w-3 h-3" /> : "2"}
                          </div>
                          <span
                            className={`text-[9px] uppercase font-semibold mt-1 font-mono ${
                              stepIndex >= 2 ? "text-[#2C1820]" : "text-neutral-400"
                            }`}
                          >
                            Confirmed
                          </span>
                        </div>

                        {/* Step 3: Shipped */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs transition-colors ${
                              stepIndex >= 4
                                ? "bg-[#B58D4B] text-white"
                                : "bg-white border border-neutral-300 text-neutral-400"
                            }`}
                          >
                            {stepIndex >= 4 ? <Check className="w-3 h-3" /> : "3"}
                          </div>
                          <span
                            className={`text-[9px] uppercase font-semibold mt-1 font-mono ${
                              stepIndex >= 4 ? "text-[#2C1820]" : "text-neutral-400"
                            }`}
                          >
                            Shipped
                          </span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs transition-colors ${
                              stepIndex >= 5
                                ? "bg-emerald-600 text-white"
                                : "bg-white border border-neutral-300 text-neutral-400"
                            }`}
                          >
                            {stepIndex >= 5 ? <Check className="w-3 h-3" /> : "4"}
                          </div>
                          <span
                            className={`text-[9px] uppercase font-semibold mt-1 font-mono ${
                              stepIndex >= 5 ? "text-emerald-700" : "text-neutral-400"
                            }`}
                          >
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ORDER ITEMS LIST */}
                  <div className="p-4 sm:p-5 divide-y divide-[#EAE2D8]/60">
                    {order.items?.map((item: any, idx: number) => {
                      const productId = item.product?._id || item.product;
                      const hasReviewed = reviewedProductIds[productId];

                      return (
                        <div
                          key={idx}
                          className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            {/* Product Thumbnail */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#FBF9F6] border border-[#EAE2D8] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                              {isVideoUrl(item.image) ? (
                                <video
                                  src={getImageUrl(item.image)}
                                  className="w-full h-full object-cover rounded-lg"
                                  muted
                                  playsInline
                                  autoPlay
                                  loop
                                />
                              ) : (
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                  loading="lazy"
                                />
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="font-serif text-sm sm:text-base font-normal text-[#2C1820] truncate">
                                {item.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-[#2C1820]/70 font-sans">
                                <span className="bg-[#FAF7F2] border border-[#EAE2D8] px-2 py-0.2 rounded font-mono text-[10px]">
                                  Qty: {item.quantity}
                                </span>
                                {item.size && (
                                  <span className="bg-[#FAF7F2] border border-[#EAE2D8] px-2 py-0.2 rounded text-[10px]">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.variant && (
                                  <span className="bg-[#FAF7F2] border border-[#EAE2D8] px-2 py-0.2 rounded text-[10px]">
                                    Option: {item.variant}
                                  </span>
                                )}
                                <span className="text-[#2C1820]/40 font-mono">&bull;</span>
                                <span className="font-mono text-xs font-medium text-[#2C1820]">
                                  ₹{item.price.toLocaleString("en-IN")} each
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Line Total & Review Trigger */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE2D8]/50 gap-1.5">
                            <span className="font-mono text-sm font-semibold text-[#2C1820]">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>

                            {isDelivered && (
                              <div className="pt-0.5">
                                {hasReviewed ? (
                                  <span className="text-[11px] font-sans text-emerald-700 flex items-center gap-1 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReview(productId, item.name);
                                    }}
                                    className="text-[11px] font-sans font-medium text-[#B58D4B] hover:text-[#2C1820] flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Star className="w-3 h-3 fill-[#B58D4B]" />
                                    <span>Write Review</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CARD FOOTER */}
                  <div className="px-4 sm:px-5 py-3 bg-[#FAF7F2]/60 border-t border-[#EAE2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-sans">
                    <div className="flex items-center gap-1.5 text-[#2C1820]/60 text-[11px] truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#B58D4B] shrink-0" />
                      <span className="truncate">
                        Delivering to <strong className="text-[#2C1820] font-medium">{order.shippingAddress?.name || "Client"}</strong>
                        {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-medium text-[#B58D4B] hover:text-[#2C1820] transition-colors cursor-pointer inline-flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>View Receipt &amp; Tracking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ORDER DETAILS MODAL / RECEIPT DOSSIER */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white border border-[#EAE2D8] w-full max-w-2xl rounded-2xl shadow-xl relative z-10 overflow-hidden max-h-[92vh] flex flex-col text-left text-[#2C1820]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-[#EAE2D8] flex justify-between items-start bg-[#FAF7F2]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-widest font-mono uppercase text-[#B58D4B] font-bold">
                      Order Receipt
                    </span>
                    <span className="text-[#2C1820]/20">&bull;</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${
                        getStatusBadge(selectedOrder.orderStatus || "Pending Confirmation").badgeClass
                      }`}
                    >
                      {getStatusBadge(selectedOrder.orderStatus || "Pending Confirmation").label}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#2C1820]">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-xs text-[#2C1820]/60 font-sans">
                    Placed on{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-[#2C1820]/50 hover:text-[#2C1820] bg-white border border-[#EAE2D8] p-1.5 rounded-full cursor-pointer transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6" data-lenis-prevent>
                {/* WhatsApp Callout if Pending */}
                {selectedOrder.orderStatus === "Pending Confirmation" && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-900 text-xs font-sans">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>Awaiting WhatsApp Confirmation</span>
                      </div>
                      <p className="text-xs text-amber-900/80 font-sans">
                        Please send the pre-filled message on WhatsApp to initiate bespoke creation.
                      </p>
                    </div>
                    {selectedOrder.whatsappUrl && (
                      <button
                        onClick={() => window.open(selectedOrder.whatsappUrl, "_blank", "noopener,noreferrer")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs font-sans"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Items in order */}
                <div>
                  <span className="text-[10px] tracking-wider uppercase text-[#B58D4B] font-bold font-mono block mb-3 border-b border-[#EAE2D8] pb-1.5">
                    Purchased Items ({selectedOrder.items?.length || 0})
                  </span>
                  <div className="divide-y divide-[#EAE2D8]">
                    {selectedOrder.items?.map((item: any, idx: number) => {
                      const productId = item.product?._id || item.product;
                      const hasReviewed = reviewedProductIds[productId];
                      const isDelivered =
                        selectedOrder.orderStatus === "Completed" || selectedOrder.orderStatus === "Delivered";

                      return (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-[#FBF9F6] border border-[#EAE2D8] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                            {isVideoUrl(item.image) ? (
                              <video
                                src={getImageUrl(item.image)}
                                className="w-full h-full object-cover rounded"
                                muted
                                playsInline
                                autoPlay
                                loop
                              />
                            ) : (
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="font-serif text-sm font-medium text-[#2C1820] truncate">{item.name}</h4>
                            <p className="text-[11px] text-[#2C1820]/60 font-sans mt-0.5">
                              Qty: {item.quantity} &times; ₹{item.price.toLocaleString("en-IN")}
                              {item.size && ` • Size: ${item.size}`}
                              {item.variant && ` • Option: ${item.variant}`}
                            </p>
                            {isDelivered && (
                              <div className="mt-1">
                                {hasReviewed ? (
                                  <span className="text-[10px] text-emerald-700 font-medium inline-flex items-center gap-1 font-sans">
                                    <CheckCircle2 className="w-3 h-3" /> Reviewed
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleOpenReview(productId, item.name)}
                                    className="text-[10px] text-[#B58D4B] hover:text-[#2C1820] font-medium inline-flex items-center gap-1 font-sans cursor-pointer"
                                  >
                                    <Star className="w-3 h-3 fill-current" /> Write Review
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="font-mono text-xs font-semibold text-[#2C1820] shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery & Logistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shipping Address */}
                  <div className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 text-xs font-sans space-y-1">
                    <div className="flex items-center gap-1.5 text-[#B58D4B] font-bold text-[10px] uppercase tracking-wider mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Delivery Address</span>
                    </div>
                    <p className="font-semibold text-[#2C1820]">{selectedOrder.shippingAddress?.name}</p>
                    <p className="text-[#2C1820]/75">{selectedOrder.shippingAddress?.addressLine1}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && (
                      <p className="text-[#2C1820]/75">{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-[#2C1820]/75">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                      {selectedOrder.shippingAddress?.postalCode}
                    </p>
                    <p className="font-mono text-[11px] pt-1 text-[#2C1820]/60">
                      Phone: <strong className="text-[#2C1820]">{selectedOrder.shippingAddress?.phone}</strong>
                    </p>
                  </div>

                  {/* Order Protocol & Courier */}
                  <div className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 text-xs font-sans space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#B58D4B] font-bold text-[10px] uppercase tracking-wider mb-2">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Delivery &amp; Courier</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#2C1820]/50 block font-mono">Ordering Channel</span>
                      <span className="font-medium text-[#2C1820]">WhatsApp Direct Ordering</span>
                    </div>
                    {selectedOrder.courierName && (
                      <div>
                        <span className="text-[10px] uppercase text-[#2C1820]/50 block font-mono">Courier Partner</span>
                        <span className="font-medium text-[#2C1820]">{selectedOrder.courierName}</span>
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div>
                        <span className="text-[10px] uppercase text-[#2C1820]/50 block font-mono">Tracking Airway Bill</span>
                        <span className="font-mono font-semibold text-[#2C1820]">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress History Timeline */}
                {selectedOrder.statusTimeline && selectedOrder.statusTimeline.length > 0 && (
                  <div>
                    <span className="text-[10px] tracking-wider uppercase text-[#B58D4B] font-bold font-mono block mb-2.5 border-b border-[#EAE2D8] pb-1.5">
                      Shipment Milestones
                    </span>
                    <div className="space-y-2 text-xs font-sans">
                      {selectedOrder.statusTimeline.map((item: any, idx: number) => {
                        const cleanComment = getCustomerFacingComment(item.comment);
                        const itemBadge = getStatusBadge(item.status);

                        return (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D8]">
                            <Clock className="w-3.5 h-3.5 text-[#B58D4B] shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${itemBadge.badgeClass}`}>
                                  {itemBadge.label}
                                </span>
                                <span className="text-[10px] text-[#2C1820]/50 font-mono">
                                  {new Date(item.date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                              {cleanComment && (
                                <p className="text-[11px] text-[#2C1820]/75 mt-1 font-sans leading-relaxed">
                                  {cleanComment}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer & Breakdown */}
              <div className="p-4 sm:p-5 border-t border-[#EAE2D8] bg-[#FAF7F2] flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="w-full sm:w-auto font-mono text-xs space-y-1">
                  <div className="flex justify-between gap-6 text-[#2C1820]/65 text-[11px]">
                    <span>Items Subtotal:</span>
                    <span>₹{(selectedOrder.subtotal || selectedOrder.grandTotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between gap-6 text-[#2C1820]/65 text-[11px]">
                    <span>Shipping:</span>
                    <span className="text-emerald-700 font-sans font-medium">Complimentary</span>
                  </div>
                  <div className="flex justify-between gap-6 pt-1 border-t border-[#EAE2D8] font-sans">
                    <span className="font-medium text-xs text-[#2C1820]">Total:</span>
                    <span className="font-serif text-base font-semibold text-[#2C1820]">
                      ₹{selectedOrder.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full sm:w-auto px-6 py-2 rounded-full border border-[#EAE2D8] hover:border-[#B58D4B] bg-white text-xs font-semibold text-[#2C1820] transition-colors cursor-pointer font-sans"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCT REVIEW SUBMISSION MODAL */}
      <AnimatePresence>
        {reviewItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewItem(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-[#EAE2D8] w-full max-w-md rounded-2xl p-6 shadow-xl relative z-10 text-left text-[#2C1820]"
            >
              <button
                onClick={() => setReviewItem(null)}
                className="absolute top-4 right-4 text-[#2C1820]/40 hover:text-[#2C1820] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-wider text-[#B58D4B] font-mono font-bold block">
                  Write a Review
                </span>
                <h3 className="font-serif text-lg font-normal text-[#2C1820] mt-0.5">
                  {reviewItem.productName}
                </h3>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-[11px] font-medium text-[#2C1820]/70 mb-1.5 font-sans">
                    Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex items-center gap-1.5">
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
                            className={`w-5 h-5 transition-colors ${
                              isActive ? "text-amber-500 fill-amber-500" : "text-neutral-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="font-mono text-xs font-semibold text-[#2C1820]/60 ml-2">
                      {reviewRating} / 5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[11px] font-medium text-[#2C1820]/70 mb-1.5 font-sans">
                    Your Review *
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    placeholder="Share your thoughts on the craftsmanship, design, and finish..."
                    className="w-full p-3 rounded-xl bg-white border border-[#EAE2D8] text-xs text-[#2C1820] placeholder:text-[#2C1820]/40 focus:border-[#B58D4B] focus:outline-hidden font-sans"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 justify-end pt-1 font-sans">
                  <button
                    type="button"
                    onClick={() => setReviewItem(null)}
                    className="px-4 py-2 rounded-full border border-[#EAE2D8] text-xs text-[#2C1820] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !reviewComment.trim()}
                    className="gold-gradient-bg text-black px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    {reviewSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Review
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
