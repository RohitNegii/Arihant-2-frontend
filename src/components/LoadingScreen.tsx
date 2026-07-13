"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Disable scroll on mount
    document.body.style.overflow = "hidden";

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDone(true);
            // Re-enable scroll
            document.body.style.overflow = "unset";
          }, 400);
          return 100;
        }
        return next;
      });
    }, 70);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          exit={{
            opacity: 0,
            y: "-100%",
            filter: "blur(20px)",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-verdant-cream select-none"
        >
          <div className="flex flex-col items-center gap-8 max-w-xs w-full">
            {/* Monogram Monolith */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              {/* Spinning soft border circle */}
              <div className="absolute inset-0 rounded-full border border-verdant-emerald/10 border-t-verdant-emerald animate-spin" style={{ animationDuration: '4s' }} />
              
              {/* Monogram letter */}
              <span className="font-serif text-3xl font-light tracking-[0.1em] text-verdant-emerald select-none">
                V
              </span>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <h2 className="font-serif text-lg tracking-[0.3em] text-verdant-emerald font-light uppercase">
                VERDANT JEWELS
              </h2>
              <span className="text-[9px] tracking-[0.25em] text-verdant-gold font-light uppercase mt-1 block">
                Luxury Boutique
              </span>
            </motion.div>

            {/* Progress counter */}
            <div className="w-full mt-6">
              <div className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase text-verdant-emerald/40 mb-2 font-light">
                <span>Initializing Exhibition</span>
                <span className="text-verdant-gold">{progress}%</span>
              </div>
              <div className="w-full h-[1px] bg-verdant-emerald/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-verdant-gold shadow-[0_0_8px_#C8A96A]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
