"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CrestMark from "@/components/global/CrestMark";
import { useScrollLock } from "@/hooks/useScrollLock";
import { isSceneReady, onSceneReady, setSceneRevealed } from "@/components/3d/scene-ready";
import {
  isPreloadComplete,
  markPreloadComplete,
  onPreloadComplete,
  onPreloadProgress,
} from "@/components/3d/preload";

const MIN_MS = 700;
const MAX_FAILSAFE_MS = 3800;

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(() => isSceneReady());
  useScrollLock(!isDone);

  useEffect(() => {
    if (isSceneReady()) {
      setIsDone(true);
      return;
    }

    const startedAt = performance.now();
    const elapsed = () => performance.now() - startedAt;
    let finishing = false;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;

    // Smoothly advance progress toward 90% while 3D shaders and geometry initialize
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + Math.max(0.7, (90 - prev) * 0.1)));
    }, 75);

    const finish = (force = false) => {
      if (finishing) return;
      if (!force && !isSceneReady()) return;
      finishing = true;
      clearInterval(interval);
      setProgress(100);
      const remainingMin = Math.max(0, MIN_MS - elapsed());
      finishTimer = setTimeout(() => {
        setIsDone(true);
      }, remainingMin + 200);
    };

    const unsubscribeReady = onSceneReady(() => finish(false));
    const unsubscribePreload = onPreloadComplete(() => finish(false));

    // Also listen to incremental progress if reported by texture builders
    const unsubscribeProgress = onPreloadProgress((p) => {
      setProgress((prev) => Math.max(prev, p * 100));
    });

    // Failsafe timer so the visitor is never trapped even on weak devices
    const failsafe = setTimeout(() => {
      markPreloadComplete();
      finish(true);
    }, MAX_FAILSAFE_MS);

    return () => {
      unsubscribeReady();
      unsubscribePreload();
      unsubscribeProgress();
      clearInterval(interval);
      clearTimeout(failsafe);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={() => setSceneRevealed(true)}>
      {!isDone && (
        <motion.div
          key="exhibition-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          }}
          className="pointer-events-auto fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-verdant-cream select-none"
        >
          <div className="flex flex-col items-center gap-6 sm:gap-8 max-w-xs w-full px-6">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              {/* Outer spinning gold rings */}
              <div
                className="absolute inset-0 rounded-full border border-verdant-emerald/15 border-t-verdant-gold animate-spin"
                style={{ animationDuration: "3.5s" }}
              />
              <div
                className="absolute inset-1.5 rounded-full border border-verdant-gold/10 border-b-verdant-gold/40 animate-spin"
                style={{ animationDuration: "5s", animationDirection: "reverse" }}
              />
              {/* Brand House Crest */}
              <CrestMark size={50} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <h2 className="font-serif text-lg sm:text-xl tracking-[0.3em] text-verdant-emerald font-light uppercase">
                GEETEJ VIRAASAT
              </h2>
              <span className="text-[9px] tracking-[0.25em] text-verdant-gold font-mono uppercase mt-1 block font-medium">
                Luxury Boutique
              </span>
            </motion.div>

            <div className="w-full mt-4">
              <div className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase text-verdant-emerald/50 mb-2 font-mono">
                <span>Entering Showroom</span>
                <span className="text-verdant-gold font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1 bg-verdant-emerald/10 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full w-full origin-left bg-gradient-to-r from-verdant-gold/70 to-verdant-gold rounded-full shadow-[0_0_10px_rgba(200,169,106,0.5)]"
                  style={{
                    transform: `scaleX(${Math.max(progress, 2) / 100})`,
                    transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
