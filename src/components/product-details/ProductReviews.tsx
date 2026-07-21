"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Check, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { getRequest, postRequest } from "../../utils/api";
import { ReviewData } from "../../services/productListing";

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialReviews: ReviewData[];
}

export default function ProductReviews({ productId, productName, initialReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const [canReview, setCanReview] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");

  // Default mock reviews matching the premium tone to act as fallback if no critiques exist yet
  const mockReviews: ReviewData[] = [
    {
      user: "mock1",
      name: "Aria Thorne",
      rating: 5,
      comment: `Absolutely spectacular craftsmanship. The geometry of this piece catches the light in a way standard rings never do. Truly a signature addition to my jewelry collection.`,
      createdAt: "2026-05-14T00:00:00.000Z",
    },
    {
      user: "mock2",
      name: "Devon Vance",
      rating: 5,
      comment: `Commissioned this for a bespoke wedding gift. The purity is immaculate, and the weight feels solid and rich. The packaging and delivery was perfectly secured. Excellent boutique service.`,
      createdAt: "2026-05-10T00:00:00.000Z",
    },
  ];

  // Sync reviews when initialReviews prop changes
  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  // Check if authenticated user can write a review for this product
  useEffect(() => {
    const checkReviewStatus = async () => {
      if (!isAuthenticated) {
        setCanReview(false);
        setCheckMessage("Please log in to share your experience.");
        return;
      }
      try {
        const res = await getRequest<{ success: boolean; canReview: boolean; message?: string }>(
          `/products/${productId}/can-review`
        );
        if (res.success) {
          setCanReview(res.canReview);
          if (res.message) {
            setCheckMessage(res.message);
          }
        }
      } catch (err: any) {
        setCanReview(false);
        setCheckMessage("Could not verify purchase status.");
      }
    };

    if (productId) {
      checkReviewStatus();
    }
  }, [productId, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;

    setSubmitting(true);
    setFormError("");

    try {
      const res = await postRequest<{ success: boolean; reviews: ReviewData[]; message?: string }>(
        `/products/${productId}/reviews`,
        { rating, comment }
      );

      if (res.success) {
        setReviews(res.reviews);
        setComment("");
        setRating(5);
        setShowForm(false);
        setSuccessMsg(true);
        setCanReview(false); // Can't review again
        setCheckMessage("You have already reviewed this product.");
        setTimeout(() => {
          setSuccessMsg(false);
        }, 4000);
      } else {
        setFormError(res.message || "Failed to submit critique.");
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Could not publish your critique. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayReviews = reviews.length > 0 ? reviews : mockReviews;

  const avgRating = displayReviews.length > 0
    ? (displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 border border-verdant-emerald/5 text-left select-none max-w-3xl mx-auto w-full">
      <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block mb-2">patron testimonials</span>
      
      {/* Review summary header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-verdant-emerald/5 mb-8">
        <div>
          <h3 className="font-serif text-xl md:text-2xl text-verdant-emerald font-light">
            Customer Critiques
          </h3>
          <div className="flex items-center gap-2 mt-2 font-mono text-[10px]">
            <div className="flex text-verdant-gold">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3.5 h-3.5 ${
                    idx < Math.round(parseFloat(avgRating)) ? "fill-verdant-gold text-verdant-gold" : "text-verdant-emerald/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-verdant-emerald font-sans">
              {avgRating} Stars ({displayReviews.length} {displayReviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {canReview ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="gold-gradient-bg text-black hover:scale-103 active:scale-95 text-[9px] tracking-widest uppercase font-bold px-6 py-3 rounded-full flex items-center gap-1.5 shadow-xs transition-all duration-300 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" /> {showForm ? "Cancel Critique" : "Submit Critique"}
          </button>
        ) : (
          <div className="text-[9px] tracking-wider uppercase font-bold text-verdant-emerald/40 border border-verdant-emerald/10 rounded-full px-5 py-2.5 bg-verdant-emerald/[0.02] flex items-center gap-1.5 select-none font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-verdant-gold" />
            {isAuthenticated ? "Verified Buyers Only" : "Log In to Critiques"}
          </div>
        )}
      </div>

      {/* Success alert message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold"
          >
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            Your review has been published successfully! Thank you for sharing your feedback.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form sheet */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 border border-verdant-emerald/10 bg-verdant-emerald/5 p-6 rounded-2xl flex flex-col gap-4 overflow-hidden"
          >
            <h4 className="font-serif text-sm text-verdant-emerald uppercase tracking-wider">
              Share Your Collection Experience
            </h4>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-700 text-[9px] uppercase tracking-wider font-semibold font-mono">
                {formError}
              </div>
            )}

            {/* Rating Stars Input Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-verdant-emerald/60 uppercase font-bold">
                your rating:
              </span>
              <div className="flex text-verdant-gold">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const starVal = idx + 1;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`Rate ${starVal} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          starVal <= (hoverRating ?? rating)
                            ? "fill-verdant-gold text-verdant-gold"
                            : "text-verdant-emerald/10"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Author Moniker */}
            <div className="text-left font-mono text-[9px] uppercase tracking-widest text-verdant-emerald/60">
              Posting As: <span className="font-sans font-bold text-verdant-emerald text-xs tracking-normal">{user?.name || "Bespoke Patron"}</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="WRITE YOUR DETAILED EXPERIENTIAL REVIEW..."
                required
                rows={4}
                className="w-full text-xs text-verdant-emerald bg-white/60 border border-verdant-emerald/10 rounded-xl px-4 py-3 focus:outline-hidden focus:border-verdant-gold focus:bg-white transition-all font-semibold tracking-wide"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="gold-gradient-bg text-black hover:scale-102 active:scale-95 text-[9px] tracking-widest uppercase font-bold py-3.5 rounded-full flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 w-full cursor-pointer mt-2 disabled:opacity-50"
            >
              {submitting ? "Publishing Critique..." : "Publish Critique"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      <div className="flex flex-col gap-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar text-left">
        {displayReviews.length === 0 ? (
          <p className="text-verdant-emerald/50 text-xs italic tracking-wider py-4">
            Be the first to leave a critique for this masterpiece.
          </p>
        ) : (
          displayReviews.map((rev, idx) => (
            <div
              key={rev._id || idx}
              className="border-b border-verdant-emerald/5 pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex justify-between items-center gap-4 mb-2">
                <span className="font-serif text-sm font-semibold text-verdant-emerald">
                  {rev.name}
                </span>
                <span className="text-[9px] text-verdant-emerald/40 font-mono tracking-widest">
                  {new Date(rev.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex text-verdant-gold mb-3">
                {Array.from({ length: 5 }).map((_, sIdx) => (
                  <Star
                    key={sIdx}
                    className={`w-3 h-3 ${
                      sIdx < rev.rating ? "fill-verdant-gold text-verdant-gold" : "text-verdant-emerald/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-verdant-emerald/75 text-xs font-light leading-relaxed tracking-wide italic">
                "{rev.comment}"
              </p>
            </div>
          ))
        )}
      </div>
      
      {/* Notice info banner */}
      {!canReview && (
        <div className="text-[9.5px] uppercase tracking-wider font-mono text-verdant-emerald/40 text-center mt-6 pt-4 border-t border-verdant-emerald/5 leading-relaxed">
          {checkMessage || "Only patrons who have purchased this masterpiece are eligible to leave critiques."}
        </div>
      )}
    </div>
  );
}
