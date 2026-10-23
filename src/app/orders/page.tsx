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
  Gem,
  Calendar,
  Sparkles,
  Printer
} from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import { getMyOrdersApi } from "../../services/checkout";
import { useAuthStore } from "../../store/authStore";
import { useScrollLock } from "@/hooks/useScrollLock";
import { getImageUrl, postRequest } from "../../utils/api";
import { toast } from "sonner";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  variant?: string;
  product?: {
    _id?: string;
    id?: string;
    name?: string;
  } | string;
}

export interface StatusTimelineEntry {
  status: string;
  date: string | Date;
  comment?: string;
  updatedBy?: string;
}

export interface OrderRecord {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  subtotal?: number;
  orderStatus: string;
  items: OrderItem[];
  shippingAddress?: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  whatsappUrl?: string;
  trackingNumber?: string;
  courierName?: string;
  statusTimeline?: StatusTimelineEntry[];
  createdAt: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Pending Confirmation":
      return {
        badgeClass: "bg-amber-500/10 text-amber-800 border-amber-500/30",
        dotClass: "bg-amber-500",
        label: "Pending Confirmation"
      };
    case "Confirmed":
      return {
        badgeClass: "bg-blue-500/10 text-blue-800 border-blue-500/30",
        dotClass: "bg-blue-500",
        label: "Confirmed"
      };
    case "Processing":
      return {
        badgeClass: "bg-indigo-500/10 text-indigo-800 border-indigo-500/30",
        dotClass: "bg-indigo-500",
        label: "In Production"
      };
    case "Shipped":
      return {
        badgeClass: "bg-purple-500/10 text-purple-800 border-purple-500/30",
        dotClass: "bg-purple-500",
        label: "Dispatched / Transit"
      };
    case "Delivered":
    case "Completed":
      return {
        badgeClass: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30",
        dotClass: "bg-emerald-500",
        label: "Delivered"
      };
    case "Cancelled":
      return {
        badgeClass: "bg-rose-500/10 text-rose-800 border-rose-500/30",
        dotClass: "bg-rose-500",
        label: "Cancelled"
      };
    default:
      return {
        badgeClass: "bg-neutral-100 text-neutral-800 border-neutral-300",
        dotClass: "bg-neutral-400",
        label: status || "Order Placed"
      };
  }
};

/**
 * Filters out internal admin system comments so clients only see legitimate dispatch notes.
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
  const { isAuthenticated, isInitialized } = useAuthStore();
  const authLoading = !isInitialized;

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Tab & search filters
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      return;
    }
    if (!isAuthenticated) return;

    let isCancelled = false;
    getMyOrdersApi()
      .then((res) => {
        if (isCancelled) return;
        if (res.success) {
          setOrders(res.orders || []);
        } else {
          setError("Failed to fetch orders.");
        }
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        console.error(err);
        let msg = "An error occurred while loading your purchase history.";
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
  }, [isAuthenticated, authLoading, router]);

  useScrollLock(selectedOrder !== null || reviewItem !== null);

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
      const res = await postRequest<{ success: boolean; message?: string }>(
        `/products/${reviewItem.productId}/reviews`,
        {
          rating: reviewRating,
          comment: reviewComment.trim()
        }
      );

      if (res.success) {
        toast.success("Thank you! Your review has been recorded.");
        setReviewedProductIds((prev) => ({ ...prev, [reviewItem.productId]: true }));
        setReviewItem(null);
      } else {
        toast.error(res.message || "Failed to submit review.");
      }
    } catch (err: unknown) {
      let msg = "Could not publish your review.";
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const resp = (err as { response?: { data?: { message?: string } } }).response;
        if (resp?.data?.message) {
          msg = resp.data.message;
        }
      }
      toast.error(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCopyOrderId = (e: React.MouseEvent, orderNumber: string) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderNumber);
      setCopiedId(orderNumber);
      toast.success(`Order ID #${orderNumber} copied to clipboard`);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Counts for tabs and summary strip
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

  // Filtered orders list
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
        const matchesItem = order.items?.some((it) => (it.name || "").toLowerCase().includes(q));
        return matchesNum || matchesRecipient || matchesItem;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-verdant-cream text-verdant-emerald pt-28 pb-20 selection:bg-verdant-gold selection:text-black">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="space-y-3 pb-6 border-b border-verdant-emerald/10">
            <div className="w-32 h-4 bg-verdant-gold/20 rounded-full" />
            <div className="w-64 h-10 bg-verdant-emerald/10 rounded-2xl" />
            <div className="w-96 h-4 bg-verdant-emerald/10 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/60 border border-verdant-emerald/10" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/60 border border-verdant-emerald/10" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-verdant-cream text-verdant-emerald pt-28 selection:bg-verdant-gold selection:text-black relative overflow-x-hidden flex flex-col justify-between">
      <Navbar />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[75vw] h-[35vw] rounded-full bg-radial from-verdant-gold/10 via-verdant-gold/2 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-radial from-verdant-emerald/5 via-verdant-emerald/2 to-transparent blur-[150px] pointer-events-none" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 w-full pb-20">
        
        {/* PAGE HEADER */}
        <div className="mb-8 select-none">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-verdant-emerald/10">
            <div className="text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-verdant-gold/30 text-verdant-gold shadow-xs">
                <CrestMark size={16} />
                <span className="text-[9px] tracking-[0.28em] uppercase font-bold font-mono">
                  Geetej Viraasat &bull; Order History
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-verdant-emerald uppercase">
                My Orders &amp; Commissions
              </h1>
              <p className="text-xs sm:text-[13px] text-verdant-emerald/70 font-sans max-w-xl leading-relaxed">
                Track your handcrafted jewelry orders from Geetej Viraasat, view official receipts, and receive direct delivery updates.
              </p>
            </div>

            {/* Total Orders Indicator */}
            {orders.length > 0 && (
              <div className="self-start md:self-auto shrink-0 flex items-center gap-2">
                <div className="px-4 py-2 rounded-2xl bg-white/80 border border-verdant-emerald/10 shadow-xs flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-verdant-gold" />
                  <span className="text-xs font-mono text-verdant-emerald/80">
                    <strong className="text-verdant-emerald font-serif text-sm font-semibold">{orders.length}</strong> {orders.length === 1 ? "Commission" : "Commissions"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* LUXURY STATS STRIP (Fills horizontal space & provides instant overview) */}
          {orders.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
              {/* Stat 1: All */}
              <button
                onClick={() => setActiveTab("ALL")}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-white border-verdant-gold shadow-md ring-1 ring-verdant-gold/30"
                    : "bg-white/60 hover:bg-white border-verdant-emerald/10 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-verdant-gold/10 text-verdant-gold flex items-center justify-center">
                    <Gem className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-verdant-emerald/50">
                    Total
                  </span>
                </div>
                <div className="font-serif text-2xl font-normal text-verdant-emerald">
                  {counts.total}
                </div>
                <p className="text-[10px] text-verdant-emerald/60 mt-0.5 font-mono">
                  Permanent Portfolio
                </p>
              </button>

              {/* Stat 2: Active */}
              <button
                onClick={() => setActiveTab("ACTIVE")}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  activeTab === "ACTIVE"
                    ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500/30"
                    : "bg-white/60 hover:bg-white border-verdant-emerald/10 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-700">
                    In Progress
                  </span>
                </div>
                <div className="font-serif text-2xl font-normal text-verdant-emerald">
                  {counts.active}
                </div>
                <p className="text-[10px] text-verdant-emerald/60 mt-0.5 font-mono">
                  Crafting &amp; Armored Transit
                </p>
              </button>

              {/* Stat 3: Pending WhatsApp */}
              <button
                onClick={() => setActiveTab("PENDING")}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  activeTab === "PENDING"
                    ? "bg-white border-amber-500 shadow-md ring-1 ring-amber-500/30"
                    : "bg-white/60 hover:bg-white border-verdant-emerald/10 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700">
                    Action Required
                  </span>
                </div>
                <div className="font-serif text-2xl font-normal text-verdant-emerald">
                  {counts.pending}
                </div>
                <p className="text-[10px] text-verdant-emerald/60 mt-0.5 font-mono">
                  Pending WhatsApp Link
                </p>
              </button>

              {/* Stat 4: Delivered */}
              <button
                onClick={() => setActiveTab("DELIVERED")}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  activeTab === "DELIVERED"
                    ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-white/60 hover:bg-white border-verdant-emerald/10 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700">
                    Delivered
                  </span>
                </div>
                <div className="font-serif text-2xl font-normal text-verdant-emerald">
                  {counts.delivered}
                </div>
                <p className="text-[10px] text-verdant-emerald/60 mt-0.5 font-mono">
                  Lifetime Care Active
                </p>
              </button>
            </div>
          )}

          {/* FILTER CONTROLS & SEARCH BAR */}
          {orders.length > 0 && (
            <div className="mt-7 flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl bg-white/70 border border-verdant-emerald/10 backdrop-blur-md shadow-xs">
              {/* Horizontal Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0 text-xs font-mono">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "ALL"
                      ? "bg-verdant-emerald text-white font-bold shadow-xs"
                      : "bg-white/60 text-verdant-emerald/70 hover:bg-white hover:text-verdant-emerald border border-verdant-emerald/10"
                  }`}
                >
                  <span>All Commissions</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === "ALL" ? "bg-white/20 text-white" : "bg-verdant-cream text-verdant-emerald"
                  }`}>
                    {counts.total}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("ACTIVE")}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "ACTIVE"
                      ? "bg-blue-800 text-white font-bold shadow-xs"
                      : "bg-white/60 text-verdant-emerald/70 hover:bg-white hover:text-verdant-emerald border border-verdant-emerald/10"
                  }`}
                >
                  <span>Active</span>
                  {counts.active > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === "ACTIVE" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-900"
                    }`}>
                      {counts.active}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("PENDING")}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "PENDING"
                      ? "bg-amber-800 text-white font-bold shadow-xs"
                      : "bg-white/60 text-verdant-emerald/70 hover:bg-white hover:text-verdant-emerald border border-verdant-emerald/10"
                  }`}
                >
                  <span>Pending</span>
                  {counts.pending > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === "PENDING" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900 font-bold"
                    }`}>
                      {counts.pending}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("DELIVERED")}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "DELIVERED"
                      ? "bg-emerald-800 text-white font-bold shadow-xs"
                      : "bg-white/60 text-verdant-emerald/70 hover:bg-white hover:text-verdant-emerald border border-verdant-emerald/10"
                  }`}
                >
                  <span>Delivered</span>
                  {counts.delivered > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === "DELIVERED" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-900 font-bold"
                    }`}>
                      {counts.delivered}
                    </span>
                  )}
                </button>

                {counts.cancelled > 0 && (
                  <button
                    onClick={() => setActiveTab("CANCELLED")}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "CANCELLED"
                        ? "bg-rose-800 text-white font-bold shadow-xs"
                        : "bg-white/60 text-verdant-emerald/70 hover:bg-white hover:text-verdant-emerald border border-verdant-emerald/10"
                    }`}
                  >
                    <span>Cancelled</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === "CANCELLED" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-900 font-bold"
                    }`}>
                      {counts.cancelled}
                    </span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-verdant-emerald/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order # or Piece..."
                  className="w-full pl-10 pr-8 py-2 rounded-xl bg-white border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:outline-hidden focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-verdant-emerald/40 hover:text-verdant-emerald cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ERROR NOTICE */}
        {error && (
          <div className="bg-verdant-danger/10 border border-verdant-danger/25 text-verdant-danger p-4 rounded-2xl text-xs mb-8 text-left flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* EMPTY STATE - NO ORDERS EVER */}
        {orders.length === 0 ? (
          <div className="glass-card bg-white/75 border border-verdant-gold/25 rounded-3xl p-10 sm:p-16 text-center max-w-lg mx-auto shadow-xl my-10 select-none">
            <div className="w-20 h-20 rounded-full bg-white border border-verdant-gold/30 flex items-center justify-center mx-auto mb-6 text-verdant-gold shadow-md">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] font-mono font-bold text-verdant-gold block mb-2">
              Customer Orders
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-verdant-emerald mb-3">
              No Orders Placed Yet
            </h3>
            <p className="text-xs sm:text-sm text-verdant-emerald/70 max-w-md mx-auto mb-8 leading-relaxed font-sans">
              Discover our fine jewelry collection and bespoke creations to commission your first handcrafted piece.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="gold-gradient-bg text-verdant-emerald font-serif tracking-[0.15em] uppercase font-semibold text-xs px-9 py-4 rounded-full shadow-[0_4px_25px_rgba(200,169,106,0.35)] hover:shadow-[0_6px_30px_rgba(200,169,106,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer inline-flex items-center gap-2.5"
            >
              <span>Explore Masterpieces</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* NO MATCHES FOR SEARCH / TAB */
          <div className="glass-card bg-white/70 border border-verdant-emerald/10 rounded-3xl p-12 text-center my-8 space-y-4 max-w-md mx-auto">
            <Package className="w-10 h-10 text-verdant-emerald/30 mx-auto" />
            <h4 className="font-serif text-xl font-light text-verdant-emerald">
              No Matching Commissions Found
            </h4>
            <p className="text-xs text-verdant-emerald/60 font-sans max-w-xs mx-auto leading-relaxed">
              We couldn&apos;t find any orders matching your specified filters or query.
            </p>
            <button
              onClick={() => {
                setActiveTab("ALL");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-verdant-gold hover:text-verdant-emerald transition-colors pt-2 cursor-pointer font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          /* ORDERS LIST (Expanded luxury card layout) */
          <div className="space-y-6 mb-16">
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
                  className="glass-card bg-white/75 border border-verdant-emerald/10 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(53,30,40,0.03)] backdrop-blur-xl hover:shadow-[0_12px_45px_rgba(53,30,40,0.06)] hover:border-verdant-gold/35 transition-all duration-300 text-left"
                >
                  {/* CARD HEADER */}
                  <div className="bg-verdant-cream/60 border-b border-verdant-emerald/10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-sans">
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border ${badge.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass} animate-pulse`} />
                        <span>{badge.label}</span>
                      </span>

                      {/* Placed Date */}
                      <span className="text-verdant-emerald/60 text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-verdant-gold" />
                        <span>Placed on <strong className="text-verdant-emerald font-semibold">{placedDate}</strong></span>
                      </span>

                      {/* Order Number */}
                      <span className="inline-flex items-center gap-1 text-verdant-emerald/70 font-mono text-xs">
                        <span>Ref:</span>
                        <strong className="text-verdant-emerald font-semibold">#{order.orderNumber}</strong>
                        <button
                          onClick={(e) => handleCopyOrderId(e, order.orderNumber)}
                          title="Copy Order ID"
                          className="text-verdant-emerald/40 hover:text-verdant-emerald cursor-pointer p-1"
                        >
                          {copiedId === order.orderNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </span>
                    </div>

                    {/* Total & Action */}
                    <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-verdant-emerald/10">
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-verdant-gold block font-mono font-bold">
                          Total Investment
                        </span>
                        <span className="font-serif text-lg sm:text-xl font-normal text-verdant-emerald">
                          ₹{order.grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white hover:bg-verdant-cream border border-verdant-emerald/15 hover:border-verdant-gold/50 text-verdant-emerald px-4 py-2 rounded-full text-xs font-serif tracking-wider uppercase font-semibold transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
                      >
                        <span>View Receipt</span>
                        <ChevronRight className="w-3.5 h-3.5 text-verdant-gold" />
                      </button>
                    </div>
                  </div>

                  {/* WHATSAPP CALLOUT IF PENDING */}
                  {isPending && order.whatsappUrl && (
                    <div className="bg-gradient-to-r from-amber-500/15 via-emerald-900/10 to-amber-500/10 border-b border-amber-500/30 px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start sm:items-center gap-2.5 text-amber-950 font-sans">
                        <MessageCircle className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <strong className="font-semibold text-amber-900">Direct WhatsApp Confirmation Pending:</strong>{" "}
                          <span className="text-verdant-emerald/80">Connect with our support team to confirm bespoke specifications and delivery.</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(order.whatsappUrl, "_blank", "noopener,noreferrer");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] uppercase font-mono tracking-widest font-bold px-5 py-2.5 rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Confirm on WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* TIMELINE STEPPER FOR ACTIVE ORDERS */}
                  {!isCancelled && (
                    <div className="px-5 sm:px-8 py-4 bg-white/50 border-b border-verdant-emerald/10">
                      <div className="relative flex items-center justify-between max-w-xl mx-auto py-1">
                        {/* Background track */}
                        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-verdant-emerald/15 z-0" />
                        {/* Progress line */}
                        <div
                          className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 bg-verdant-gold transition-all duration-500 z-0"
                          style={{
                            width:
                              stepIndex <= 1
                                ? "0%"
                                : stepIndex === 2
                                ? "33%"
                                : stepIndex === 3
                                ? "66%"
                                : stepIndex === 4
                                ? "85%"
                                : "calc(100% - 32px)"
                          }}
                        />

                        {/* Step 1: Placed */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-verdant-gold text-verdant-emerald flex items-center justify-center text-[10px] font-bold shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-verdant-emerald mt-1.5 font-mono">
                            Commissioned
                          </span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs transition-colors ${
                              stepIndex >= 2
                                ? "bg-verdant-gold text-verdant-emerald"
                                : "bg-white border border-verdant-emerald/20 text-verdant-emerald/40"
                            }`}
                          >
                            {stepIndex >= 2 ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "02"}
                          </div>
                          <span
                            className={`text-[9px] uppercase tracking-wider font-semibold mt-1.5 font-mono ${
                              stepIndex >= 2 ? "text-verdant-emerald" : "text-verdant-emerald/40"
                            }`}
                          >
                            Confirmed
                          </span>
                        </div>

                        {/* Step 3: Shipped */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs transition-colors ${
                              stepIndex >= 4
                                ? "bg-verdant-gold text-verdant-emerald"
                                : "bg-white border border-verdant-emerald/20 text-verdant-emerald/40"
                            }`}
                          >
                            {stepIndex >= 4 ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "03"}
                          </div>
                          <span
                            className={`text-[9px] uppercase tracking-wider font-semibold mt-1.5 font-mono ${
                              stepIndex >= 4 ? "text-verdant-emerald" : "text-verdant-emerald/40"
                            }`}
                          >
                            In Transit
                          </span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs transition-colors ${
                              stepIndex >= 5
                                ? "bg-emerald-600 text-white"
                                : "bg-white border border-verdant-emerald/20 text-verdant-emerald/40"
                            }`}
                          >
                            {stepIndex >= 5 ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "04"}
                          </div>
                          <span
                            className={`text-[9px] uppercase tracking-wider font-semibold mt-1.5 font-mono ${
                              stepIndex >= 5 ? "text-emerald-700 font-bold" : "text-verdant-emerald/40"
                            }`}
                          >
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ORDER ITEMS LIST */}
                  <div className="p-5 sm:p-6 divide-y divide-verdant-emerald/10">
                    {order.items?.map((item, idx) => {
                      const productId = typeof item.product === "object" && item.product !== null ? item.product._id || item.product.id || "" : (item.product as string) || "";
                      const hasReviewed = reviewedProductIds[productId];

                      return (
                        <div
                          key={idx}
                          className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Product Thumbnail Frame */}
                            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-verdant-cream border border-verdant-gold/25 overflow-hidden shrink-0 flex items-center justify-center p-1 relative shadow-xs group">
                              {isVideoUrl(item.image) ? (
                                <video
                                  src={getImageUrl(item.image)}
                                  className="w-full h-full object-contain rounded-xl"
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
                                  className="w-full h-full object-contain rounded-xl"
                                  loading="lazy"
                                />
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="font-serif text-sm sm:text-base font-normal text-verdant-emerald truncate">
                                {item.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] text-verdant-emerald/70 font-mono">
                                <span className="bg-white border border-verdant-emerald/10 px-2 py-0.5 rounded-md font-bold">
                                  Qty: {item.quantity}
                                </span>
                                {item.size && (
                                  <span className="bg-verdant-gold/10 border border-verdant-gold/25 text-verdant-gold px-2 py-0.5 rounded-md font-bold">
                                    Size {item.size}
                                  </span>
                                )}
                                {item.variant && (
                                  <span className="bg-verdant-gold/10 border border-verdant-gold/25 text-verdant-gold px-2 py-0.5 rounded-md font-bold">
                                    {item.variant}
                                  </span>
                                )}
                                <span className="text-verdant-emerald/30">&bull;</span>
                                <span className="font-mono text-xs text-verdant-emerald/80">
                                  ₹{item.price.toLocaleString("en-IN")} each
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Line Total & Review Trigger */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-verdant-emerald/10 gap-1.5">
                            <span className="font-serif text-sm sm:text-base font-semibold text-verdant-emerald">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>

                            {isDelivered && (
                              <div className="pt-0.5">
                                {hasReviewed ? (
                                  <span className="text-[11px] font-sans text-emerald-700 flex items-center gap-1 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Review Submitted
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReview(productId, item.name);
                                    }}
                                    className="text-[11px] font-sans font-medium text-verdant-gold hover:text-verdant-emerald flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Star className="w-3 h-3 fill-verdant-gold text-verdant-gold" />
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
                  <div className="px-5 sm:px-6 py-3.5 bg-verdant-cream/50 border-t border-verdant-emerald/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                    <div className="flex items-center gap-2 text-verdant-emerald/70 text-[11px] truncate">
                      <MapPin className="w-3.5 h-3.5 text-verdant-gold shrink-0" />
                      <span className="truncate">
                        Dispatched to <strong className="text-verdant-emerald font-semibold">{order.shippingAddress?.name || "Customer"}</strong>
                        {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-serif uppercase tracking-wider font-semibold text-verdant-gold hover:text-verdant-emerald transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>Full Receipt &amp; Tracking Log</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ORDER DETAILS MODAL / RECEIPT */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 select-none print:p-0 print:fixed print:inset-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-verdant-emerald/50 backdrop-blur-sm print:hidden"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white border border-verdant-emerald/15 w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden max-h-[92vh] flex flex-col text-left text-verdant-emerald print:max-w-none print:h-auto print:max-h-none print:border-none print:shadow-none print:rounded-none"
            >
              {/* Receipt Header with House Seal */}
              <div className="p-6 sm:p-8 border-b border-verdant-emerald/10 bg-gradient-to-b from-verdant-cream/90 to-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-verdant-gold/15 to-transparent blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-verdant-gold/30 flex items-center justify-center shrink-0 shadow-sm">
                      <CrestMark size={28} />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-verdant-gold font-bold block mb-1">
                        Fine Jewelry &bull; Official Registry
                      </span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-verdant-emerald uppercase">
                        GEETEJ VIRAASAT
                      </h2>
                      <p className="text-[11px] text-verdant-emerald/65 font-sans mt-0.5">
                        Official Purchase Receipt &bull; Certificate of Authenticity
                      </p>
                    </div>
                  </div>

                  {/* Actions: Print & Close */}
                  <div className="flex items-center gap-2 self-end sm:self-start print:hidden">
                    <button
                      onClick={handlePrintReceipt}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-verdant-cream border border-verdant-emerald/15 hover:border-verdant-gold text-xs font-mono font-medium text-verdant-emerald transition-all shadow-xs cursor-pointer"
                      title="Print Official Receipt"
                    >
                      <Printer className="w-3.5 h-3.5 text-verdant-gold" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-verdant-cream border border-verdant-emerald/15 hover:border-verdant-emerald flex items-center justify-center text-verdant-emerald/60 hover:text-verdant-emerald transition-colors shadow-xs cursor-pointer"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Receipt Quick Info Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-verdant-emerald/10 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-verdant-emerald/50 uppercase tracking-wider block mb-0.5">Commission No.</span>
                    <div className="flex items-center gap-1">
                      <strong className="text-verdant-emerald font-semibold text-xs">#{selectedOrder.orderNumber}</strong>
                      <button
                        onClick={(e) => handleCopyOrderId(e, selectedOrder.orderNumber)}
                        className="text-verdant-emerald/40 hover:text-verdant-emerald p-0.5 cursor-pointer print:hidden"
                        title="Copy"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-verdant-emerald/50 uppercase tracking-wider block mb-0.5">Registry Date</span>
                    <span className="text-verdant-emerald font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-verdant-emerald/50 uppercase tracking-wider block mb-0.5">Status</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        getStatusBadge(selectedOrder.orderStatus || "Pending Confirmation").badgeClass
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(selectedOrder.orderStatus || "Pending Confirmation").dotClass}`} />
                      {getStatusBadge(selectedOrder.orderStatus || "Pending Confirmation").label}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-verdant-emerald/50 uppercase tracking-wider block mb-0.5">Fulfillment Mode</span>
                    <span className="text-verdant-emerald font-medium truncate block">
                      WhatsApp Direct Order
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Receipt Content */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6" data-lenis-prevent>
                {/* WhatsApp Action Callout (if pending) */}
                {selectedOrder.orderStatus === "Pending Confirmation" && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-950 text-xs font-sans">
                        <MessageCircle className="w-4 h-4 text-emerald-700" />
                        <span>Awaiting WhatsApp Confirmation</span>
                      </div>
                      <p className="text-xs text-amber-900/80 font-sans leading-relaxed">
                        Please deliver your pre-filled order details to our team on WhatsApp to confirm your order.
                      </p>
                    </div>
                    {selectedOrder.whatsappUrl && (
                      <button
                        onClick={() => window.open(selectedOrder.whatsappUrl, "_blank", "noopener,noreferrer")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono tracking-widest uppercase font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Open WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Masterpiece Manifest (Items List) */}
                <div>
                  <div className="flex items-center justify-between border-b border-verdant-emerald/10 pb-2.5 mb-3">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-verdant-gold font-bold font-mono">
                      Commissioned Masterpiece Manifest ({selectedOrder.items?.length || 0})
                    </span>
                    <span className="text-[10px] text-verdant-emerald/50 font-mono">
                      BIS Hallmarked &bull; GIA/IGI Certified
                    </span>
                  </div>

                  <div className="divide-y divide-verdant-emerald/10">
                    {selectedOrder.items?.map((item, idx) => {
                      const productId = typeof item.product === "object" && item.product !== null ? item.product._id || item.product.id || "" : (item.product as string) || "";
                      const hasReviewed = reviewedProductIds[productId];
                      const isDelivered =
                        selectedOrder.orderStatus === "Completed" || selectedOrder.orderStatus === "Delivered";

                      return (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-xl bg-verdant-cream border border-verdant-gold/25 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs">
                              {isVideoUrl(item.image) ? (
                                <video
                                  src={getImageUrl(item.image)}
                                  className="w-full h-full object-contain rounded-lg"
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
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="font-serif text-sm font-normal text-verdant-emerald truncate">
                                {item.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-verdant-emerald/65 font-mono">
                                <span className="bg-verdant-cream border border-verdant-emerald/10 px-2 py-0.5 rounded-md font-bold">
                                  Qty: {item.quantity}
                                </span>
                                {item.size && (
                                  <span className="bg-verdant-gold/10 border border-verdant-gold/20 text-verdant-gold px-2 py-0.5 rounded-md font-bold">
                                    Size {item.size}
                                  </span>
                                )}
                                {item.variant && (
                                  <span className="bg-verdant-gold/10 border border-verdant-gold/20 text-verdant-gold px-2 py-0.5 rounded-md font-bold">
                                    {item.variant}
                                  </span>
                                )}
                                <span className="text-verdant-emerald/30">&bull;</span>
                                <span>₹{item.price.toLocaleString("en-IN")} each</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-serif text-sm sm:text-base font-semibold text-verdant-emerald block">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                            {isDelivered && (
                              <div className="mt-1 print:hidden">
                                {hasReviewed ? (
                                  <span className="text-[10px] text-emerald-700 font-semibold inline-flex items-center gap-1 font-sans">
                                    <CheckCircle2 className="w-3 h-3" /> Reviewed
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleOpenReview(productId, item.name)}
                                    className="text-[10px] text-verdant-gold hover:text-verdant-emerald font-semibold inline-flex items-center gap-1 font-sans cursor-pointer"
                                  >
                                    <Star className="w-3 h-3 fill-current" /> Write Review
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery & Logistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Delivery Address */}
                  <div className="bg-verdant-cream/50 border border-verdant-emerald/10 rounded-2xl p-4 text-xs font-sans space-y-1">
                    <div className="flex items-center gap-1.5 text-verdant-gold font-bold text-[10px] uppercase tracking-wider mb-2 font-mono">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Armored Delivery Destination</span>
                    </div>
                    <p className="font-serif text-sm font-medium text-verdant-emerald">{selectedOrder.shippingAddress?.name}</p>
                    <p className="text-verdant-emerald/75 leading-relaxed">
                      {selectedOrder.shippingAddress?.addressLine1}
                      {selectedOrder.shippingAddress?.addressLine2 && <>, {selectedOrder.shippingAddress.addressLine2}</>}
                      <br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.postalCode}
                      <br />
                      <span className="font-semibold text-verdant-emerald/80">🇮🇳 {selectedOrder.shippingAddress?.country || "India"}</span>
                    </p>
                    <p className="font-mono text-[11px] pt-1 text-verdant-emerald/60">
                      Contact: <strong className="text-verdant-emerald">{selectedOrder.shippingAddress?.phone}</strong>
                    </p>
                  </div>

                  {/* Courier & Transit Details */}
                  <div className="bg-verdant-cream/50 border border-verdant-emerald/10 rounded-2xl p-4 text-xs font-sans space-y-1.5">
                    <div className="flex items-center gap-1.5 text-verdant-gold font-bold text-[10px] uppercase tracking-wider mb-2 font-mono">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Transit &amp; Security Protocol</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-verdant-emerald/50 block font-mono">Ordering Channel</span>
                      <span className="font-medium text-verdant-emerald">WhatsApp Direct &bull; Geetej Viraasat</span>
                    </div>
                    {selectedOrder.courierName && (
                      <div>
                        <span className="text-[9px] uppercase text-verdant-emerald/50 block font-mono">Courier Partner</span>
                        <span className="font-medium text-verdant-emerald">{selectedOrder.courierName}</span>
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div>
                        <span className="text-[9px] uppercase text-verdant-emerald/50 block font-mono">Tracking Airway Bill</span>
                        <span className="font-mono font-semibold text-verdant-emerald">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                    <div className="pt-1.5 text-[10px] text-emerald-800 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Insured Armored Transit with Signature Adult Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Shipment Milestones Timeline */}
                {selectedOrder.statusTimeline && selectedOrder.statusTimeline.length > 0 && (
                  <div>
                    <span className="text-[10px] tracking-wider uppercase text-verdant-gold font-bold font-mono block mb-2.5 border-b border-verdant-emerald/10 pb-1.5">
                      Order Milestones
                    </span>
                    <div className="space-y-2 text-xs font-sans">
                      {selectedOrder.statusTimeline.map((item, idx) => {
                        const cleanComment = getCustomerFacingComment(item.comment);
                        const itemBadge = getStatusBadge(item.status);

                        return (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-verdant-cream/50 border border-verdant-emerald/10">
                            <Clock className="w-3.5 h-3.5 text-verdant-gold shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold font-mono uppercase tracking-wider border ${itemBadge.badgeClass}`}>
                                  {itemBadge.label}
                                </span>
                                <span className="text-[10px] text-verdant-emerald/50 font-mono">
                                  {new Date(item.date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                              {cleanComment && (
                                <p className="text-[11px] text-verdant-emerald/75 mt-1 font-sans leading-relaxed">
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

                {/* Certificate of Authenticity Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-verdant-gold/10 via-white to-verdant-gold/10 border border-verdant-gold/30 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-mono text-verdant-gold font-bold block">
                      Certificate of Authenticity
                    </span>
                    <p className="text-xs text-verdant-emerald/80 font-sans">
                      All Geetej Viraasat creations are certified by BIS Hallmarking standards with guaranteed purity of precious metals and verified natural stones.
                    </p>
                  </div>
                  <div className="shrink-0 text-center">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-verdant-emerald/60 block">Official Seal</span>
                    <span className="font-serif text-xs font-bold text-verdant-gold uppercase tracking-wider">GEETEJ VIRAASAT</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer & Breakdown */}
              <div className="p-5 sm:p-6 border-t border-verdant-emerald/10 bg-verdant-cream/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto font-mono text-xs space-y-1">
                  <div className="flex justify-between gap-8 text-verdant-emerald/65 text-[11px]">
                    <span>Items Subtotal:</span>
                    <span>₹{(selectedOrder.subtotal || selectedOrder.grandTotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-verdant-emerald/65 text-[11px]">
                    <span>Armored Delivery:</span>
                    <span className="text-emerald-700 font-sans font-medium">Complimentary</span>
                  </div>
                  <div className="flex justify-between gap-8 text-verdant-emerald/65 text-[11px]">
                    <span>Applicable Taxes (GST 3%):</span>
                    <span className="text-verdant-emerald/50">Included in Price</span>
                  </div>
                  <div className="flex justify-between gap-8 pt-1.5 border-t border-verdant-emerald/15 font-sans">
                    <span className="font-medium text-xs text-verdant-emerald uppercase tracking-wider">Total Investment:</span>
                    <span className="font-serif text-lg font-semibold text-verdant-emerald">
                      ₹{selectedOrder.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto print:hidden">
                  <button
                    onClick={handlePrintReceipt}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-full border border-verdant-emerald/15 hover:border-verdant-gold bg-white text-xs font-serif uppercase tracking-wider font-semibold text-verdant-emerald transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-verdant-gold" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-full gold-gradient-bg text-verdant-emerald text-xs font-serif uppercase tracking-wider font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all"
                  >
                    Close Receipt
                  </button>
                </div>
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
              className="absolute inset-0 bg-verdant-emerald/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-verdant-emerald/15 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative z-10 text-left text-verdant-emerald"
            >
              <button
                onClick={() => setReviewItem(null)}
                className="absolute top-5 right-5 text-verdant-emerald/40 hover:text-verdant-emerald cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-5">
                <span className="text-[9px] uppercase tracking-[0.25em] text-verdant-gold font-mono font-bold block mb-1">
                  Customer Review
                </span>
                <h3 className="font-serif text-xl font-light text-verdant-emerald">
                  {reviewItem.productName}
                </h3>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Rating */}
                <div>
                  <label className="block text-[11px] font-medium text-verdant-emerald/75 mb-2 font-sans">
                    Artisanal Rating *
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
                            className={`w-6 h-6 transition-colors ${
                              isActive ? "text-amber-500 fill-amber-500" : "text-neutral-200"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="font-mono text-xs font-semibold text-verdant-emerald/70 ml-2">
                      {reviewRating} / 5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[11px] font-medium text-verdant-emerald/75 mb-1.5 font-sans">
                    Your Review &amp; Feedback *
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    placeholder="Reflect on the artistry, stone setting, finishing, and packaging..."
                    className="w-full p-3.5 rounded-2xl bg-verdant-cream/50 border border-verdant-emerald/15 text-xs text-verdant-emerald placeholder:text-verdant-emerald/40 focus:border-verdant-gold focus:ring-2 focus:ring-verdant-gold/20 focus:outline-hidden font-sans transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5 justify-end pt-2 font-sans">
                  <button
                    type="button"
                    onClick={() => setReviewItem(null)}
                    className="px-5 py-2.5 rounded-full border border-verdant-emerald/15 text-xs text-verdant-emerald hover:bg-verdant-cream/50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !reviewComment.trim()}
                    className="gold-gradient-bg text-verdant-emerald px-6 py-2.5 rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-xs"
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
