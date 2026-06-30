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
    }, 50);

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
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#080808] select-none"
        >
          {/* FILM GRAIN BACKGROUND */}
          <div className="grain-overlay" />

          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-radial from-[#ff5a1f]/8 to-transparent blur-[80px] pointer-events-none" />

          <div className="flex flex-col items-center gap-8 max-w-xs w-full relative z-10">
            {/* Spinning Diamond wireframe Monolith */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="relative w-28 h-28 flex items-center justify-center"
            >
              {/* Rotating Diamond Vector */}
              <motion.svg
                className="w-20 h-20 stroke-[#ff5a1f]"
                fill="none"
                strokeWidth="0.75"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                {/* Facets */}
                <circle cx="50" cy="50" r="46" strokeDasharray="2 4" opacity="0.25" />
                <polygon points="50,15 78,40 50,85 22,40" />
                <line x1="22" y1="40" x2="78" y2="40" />
                <line x1="50" y1="15" x2="50" y2="85" />
                <line x1="22" y1="40" x2="50" y2="45" />
                <line x1="78" y1="40" x2="50" y2="45" />
              </motion.svg>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <h2 className="font-serif font-light text-lg tracking-[0.3em] text-white uppercase">
                VERDANT JEWELS
              </h2>
              <span className="text-[8px] tracking-[0.2em] text-[#ff5a1f] font-mono uppercase mt-1.5 block">
                SYSTEM CORRELATION ACTIVE
              </span>
            </motion.div>

            {/* Massive bold progress numbers */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-2"
            >
              <span className="text-6xl md:text-7xl font-sans font-black tracking-tighter text-white">
                {progress}%
              </span>
            </motion.div>
          </div>

          {/* Bottom Loading Progress Line spanning full-width */}
          <div
            className="fixed bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#ff5a1f] to-[#c300ff] transition-all duration-100 shadow-[0_0_12px_#ff5a1f]"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
