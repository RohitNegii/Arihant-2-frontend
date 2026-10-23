"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Check, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { getRequest, postRequest } from "../../utils/api";
import { ReviewData } from "../../services/productListing";

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialReviews: ReviewData[];
}

export default function ProductReviews({
  productId,
  productName,
  initialReviews,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [prevInitial, setPrevInitial] = useState(initialReviews);

  if (initialReviews !== prevInitial) {
    setPrevInitial(initialReviews);
    setReviews(initialReviews);
  }
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

  const mockReviews: ReviewData[] = [
    {
      user: "mock1",
      name: "Aria Thorne",
      rating: 5,
      comment:
        "Absolutely spectacular craftsmanship. The geometry of this piece catches the light in a way standard jewelry never does. Truly a signature addition to my collection.",
      createdAt: "2026-05-14T00:00:00.000Z",
    },
    {
      user: "mock2",
      name: "Devon Vance",
      rating: 5,
      comment:
        "Commissioned this for a bespoke wedding gift. The purity is immaculate, and the weight feels solid and rich. The packaging and delivery was perfectly secured.",
      createdAt: "2026-05-10T00:00:00.000Z",
    },
  ];


  useEffect(() => {
    let mounted = true;
    const checkReviewStatus = async () => {
      if (!isAuthenticated) {
        if (mounted) {
          setCanReview(false);
          setCheckMessage("Please log in to share your experience.");
        }
        return;
      }
      try {
        const res = await getRequest<{ success: boolean; canReview: boolean; message?: string }>(
          `/products/${productId}/can-review`
        );
        if (res.success && mounted) {
          setCanReview(res.canReview);
          if (res.message) {
            setCheckMessage(res.message);
          }
        }
      } catch {
        if (mounted) {
          setCanReview(false);
          setCheckMessage("Could not verify purchase status.");
        }
      }
    };

    if (productId) {
      checkReviewStatus();
    }
    return () => {
      mounted = false;
    };
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
        setCanReview(false);
        setCheckMessage("You have already reviewed this product.");
        setTimeout(() => {
          setSuccessMsg(false);
        }, 4000);
      } else {
        setFormError(res.message || "Failed to submit review.");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : "Could not publish your review. Please try again.";
      setFormError(message || "Could not publish your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayReviews = reviews.length > 0 ? reviews : mockReviews;

  const avgRating =
    displayReviews.length > 0
      ? (displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 border border-verdant-emerald/10 text-left select-none max-w-4xl mx-auto w-full shadow-[0_4px_25px_rgba(var(--color-primary-rgb),0.02)]">
      <span className="text-[8px] uppercase tracking-[0.25em] text-verdant-gold font-bold font-mono block mb-2">
        Customer Testimonials
      </span>

      {/* Review summary header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-verdant-emerald/10 mb-8">
        <div>
          <h3 className="font-serif text-2xl md:text-3xl text-verdant-emerald font-light">
            Customer Reviews & Ratings
          </h3>
          <div className="flex items-center gap-3 mt-2.5 font-mono text-[10px]">
            <div className="flex text-verdant-gold">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-4 h-4 ${
                    idx < Math.round(parseFloat(avgRating))
                      ? "fill-verdant-gold text-verdant-gold"
                      : "text-verdant-emerald/15"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-verdant-emerald font-sans">
              {avgRating} / 5.0 ({displayReviews.length} {displayReviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {canReview ? (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="gold-gradient-bg text-black hover:scale-102 active:scale-95 text-[9px] tracking-widest uppercase font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {showForm ? "Cancel Review" : "Write a Review"}
          </button>
        ) : (
          <div className="text-[9px] tracking-wider uppercase font-bold text-verdant-emerald/50 border border-verdant-emerald/10 rounded-full px-4 py-2 bg-white/40 flex items-center gap-1.5 select-none font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-verdant-gold" />
            {isAuthenticated ? "Verified Buyers Only" : "Log In to Review"}
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
            className="mb-6 bg-verdant-success/10 border border-verdant-success/20 text-verdant-success p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold"
          >
            <Check className="w-4 h-4 text-verdant-success shrink-0" />
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
            className="mb-8 border border-verdant-emerald/10 bg-white/60 p-6 sm:p-7 rounded-2xl flex flex-col gap-4 overflow-hidden shadow-xs"
          >
            <h4 className="font-serif text-base text-verdant-emerald uppercase tracking-wider font-light">
              Share Your Collection Experience with {productName}
            </h4>

            {formError && (
              <div className="p-3.5 rounded-xl bg-verdant-danger/10 border border-verdant-danger/20 text-verdant-danger text-[10px] uppercase tracking-wider font-semibold font-mono">
                {formError}
              </div>
            )}

            {/* Rating Stars Input Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracking-widest text-verdant-emerald/70 uppercase font-bold font-mono">
                Your Rating:
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
                      className="p-1 hover:scale-115 transition-transform cursor-pointer"
                      aria-label={`Rate ${starVal} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          starVal <= (hoverRating ?? rating)
                            ? "fill-verdant-gold text-verdant-gold"
                            : "text-verdant-emerald/20"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Author Moniker */}
            <div className="text-left font-mono text-[9px] uppercase tracking-widest text-verdant-emerald/60">
              Posting As:{" "}
              <span className="font-sans font-bold text-verdant-emerald text-xs tracking-normal">
                {user?.name || "Verified Customer"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details on the finishing, diamond brilliance, weight, and presentation..."
                required
                rows={4}
                className="w-full text-xs text-verdant-emerald bg-white/80 border border-verdant-emerald/15 rounded-xl px-4 py-3 focus:outline-hidden focus:border-verdant-gold focus:bg-white transition-all font-medium leading-relaxed placeholder:text-verdant-emerald/40"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="gold-gradient-bg text-black hover:scale-102 active:scale-95 text-[9px] tracking-[0.2em] uppercase font-bold py-3.5 rounded-full flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 w-full cursor-pointer mt-1 disabled:opacity-50"
            >
              {submitting ? "Publishing Review..." : "Publish Review"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      <div className="flex flex-col gap-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar text-left">
        {displayReviews.length === 0 ? (
          <p className="text-verdant-emerald/50 text-xs italic tracking-wider py-4">
            Be the first to leave a review for this jewelry piece.
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
              <div className="flex text-verdant-gold mb-2.5">
                {Array.from({ length: 5 }).map((_, sIdx) => (
                  <Star
                    key={sIdx}
                    className={`w-3.5 h-3.5 ${
                      sIdx < rev.rating
                        ? "fill-verdant-gold text-verdant-gold"
                        : "text-verdant-emerald/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-verdant-emerald/75 text-xs font-light leading-relaxed tracking-wide italic">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          ))
        )}
      </div>

      {/* Notice info banner */}
      {!canReview && (
        <div className="text-[9px] uppercase tracking-wider font-mono text-verdant-emerald/45 text-center mt-6 pt-4 border-t border-verdant-emerald/5 leading-relaxed">
          {checkMessage ||
            "Only verified customers who have purchased this piece are eligible to leave reviews."}
        </div>
      )}
    </div>
  );
}
