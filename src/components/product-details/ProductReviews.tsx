"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Default mock reviews matching the premium tone
  const getMockReviews = (): Review[] => {
    return [
      {
        name: "Aria Thorne",
        rating: 5,
        comment: `Absolutely spectacular craftsmanship. The geometry of this piece catches the light in a way standard rings never do. Truly a signature addition to my jewelry collection.`,
        date: "May 14, 2026",
      },
      {
        name: "Devon Vance",
        rating: 5,
        comment: `Commissioned this for a bespoke wedding gift. The purity is immaculate, and the weight feels solid and rich. The packaging and delivery was perfectly secured. Excellent boutique service.`,
        date: "May 10, 2026",
      },
    ];
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`aurum_reviews_${productId}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        const mocks = getMockReviews();
        setReviews(mocks);
        localStorage.setItem(`aurum_reviews_${productId}`, JSON.stringify(mocks));
      }
    } catch (e) {
      // Ignored
    }
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    const newReview: Review = {
      name,
      rating,
      comment,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const updated = [newReview, ...reviews];
    try {
      localStorage.setItem(`aurum_reviews_${productId}`, JSON.stringify(updated));
    } catch (err) {
      // Ignored
    }
    setReviews(updated);

    setName("");
    setComment("");
    setRating(5);
    setShowForm(false);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
    }, 4000);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
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
          <div className="flex items-center gap-2 mt-2">
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
            <span className="text-xs font-bold text-verdant-emerald">
              {avgRating} Stars ({reviews.length} reviews)
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="gold-gradient-bg text-black hover:scale-103 active:scale-95 text-[9px] tracking-widest uppercase font-bold px-6 py-3 rounded-full flex items-center gap-1.5 shadow-xs transition-all duration-300 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Submit Critique
        </button>
      </div>

      {/* Success alert message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold"
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

            {/* Form Fields */}
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="YOUR NAME / MONIKER"
                required
                className="w-full text-xs text-verdant-emerald bg-white/60 border border-verdant-emerald/10 rounded-xl px-4 py-3 focus:outline-hidden focus:border-verdant-gold focus:bg-white transition-all font-bold uppercase tracking-wider"
              />
            </div>

            <div className="flex flex-col gap-1.5">
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
              className="gold-gradient-bg text-black hover:scale-102 active:scale-95 text-[9px] tracking-widest uppercase font-bold py-3.5 rounded-full flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 w-full cursor-pointer mt-2"
            >
              <Send className="w-3.5 h-3.5" /> Publish Critique
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      <div className="flex flex-col gap-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {reviews.length === 0 ? (
          <p className="text-verdant-emerald/50 text-xs italic tracking-wider py-4">
            Be the first to leave a critique for this masterpiece.
          </p>
        ) : (
          reviews.map((rev, idx) => (
            <div
              key={idx}
              className="border-b border-verdant-emerald/5 pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex justify-between items-center gap-4 mb-2">
                <span className="font-serif text-sm font-semibold text-verdant-emerald">
                  {rev.name}
                </span>
                <span className="text-[9px] text-verdant-emerald/40 font-mono tracking-widest">
                  {rev.date}
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
    </div>
  );
}
