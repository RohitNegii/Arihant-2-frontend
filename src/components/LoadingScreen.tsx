"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CrestMark from "@/components/global/CrestMark";
import { isSceneReady, onSceneReady, resetSceneReady, setSceneRevealed } from "@/components/3d/scene-ready";
import {
  fullPreload,
  isPreloadComplete,
  markPreloadComplete,
  onPreloadComplete,
  onPreloadProgress,
  preloadAssets,
  preloadProgress,
} from "@/components/3d/preload";

const MIN_MS = 900;

/**
 * How long the door may be held, from this loader's mount.
 *
 * The progressive path — `?preload=off` — waits only for the canvas to start
 * drawing, so seven seconds is already generous. Full preload is loading every
 * photograph, the film, every shader and every vertex buffer in the show before
 * it opens, and cutting that short hands over the half-warm scene the whole
 * exercise exists to avoid.
 *
 * Forty because thirty was not enough and it failed in the ugliest available
 * way. A cold first visit — no entry in the browser's compiled-program cache —
 * measured 25.5s on an integrated GPU, and the runs that overran it did not
 * degrade quietly: the failsafe fired mid-warm-up and the bar jumped from 30%
 * straight to 100%. The same page on a second visit, with that cache warm, was
 * 7.1s. The number has to clear the cold case on slow hardware, because the
 * warm case was never close to it.
 *
 * It is still a failsafe, not a budget. Nothing waits for it when the preloader
 * reports in, and `WARMUP_DEADLINE_MS` in `ShowroomCanvas` is set to land
 * inside it so an overrun still finishes through `markPreloadComplete`.
 */
const MAX_MS = { full: 40000, progressive: 7000 };

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    resetSceneReady();
    document.body.style.overflow = "hidden";
    const startedAt = performance.now();
    const elapsed = () => performance.now() - startedAt;
    const full = fullPreload();
    let finishing = false;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;

    /**
     * Off full preload there is nothing real to report, so the bar creeps
     * toward a fixed 90 on a timer while the canvas boots — as it always has.
     * Under full preload it is set straight from the preloader instead, and the
     * gliding is left to CSS: see the bar itself for why that matters.
     */
    let interval: ReturnType<typeof setInterval> | undefined;
    if (!full) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + Math.max(0.5, (90 - prev) * 0.08)));
      }, 90);
    }

    const finish = () => {
      if (finishing || !isPreloadComplete() || !isSceneReady()) return;
      finishing = true;
      clearInterval(interval);
      setProgress(100);
      const wait = Math.max(0, MIN_MS - elapsed());
      finishTimer = setTimeout(() => {
        setIsDone(true);
        document.body.style.overflow = "unset";
      }, wait + 250);
    };

    // Started here rather than from the canvas so the photographs download
    // alongside the three.js chunk instead of queueing behind it.
    let unsubscribeProgress = () => {};
    if (full) {
      void preloadAssets();
      const push = (p: number) => setProgress((prev) => Math.max(prev, p * 100));
      push(preloadProgress());
      unsubscribeProgress = onPreloadProgress(push);
    }

    const unsubscribe = onPreloadComplete(finish);
    const unsubscribeReady = onSceneReady(finish);
    const budget = full ? MAX_MS.full : MAX_MS.progressive;

    /**
     * Give up *through* the preloader, not behind its back.
     *
     * `ScenePrewarm` may still be flying the camera down the corridor when this
     * fires, and it stands `CameraController` down while it does. Opening the
     * door without telling it would hand the visitor a scene whose camera is
     * flying away from them and whose controls are still parked. Marking the
     * preload complete ends that pass on its next frame, and `finish` is
     * reached from the same subscription as a real completion.
     */
    const failsafe = setTimeout(
      () => markPreloadComplete(),
      Math.max(300, budget - elapsed())
    );

    return () => {
      unsubscribe();
      unsubscribeReady();
      unsubscribeProgress();
      clearInterval(interval);
      clearTimeout(failsafe);
      clearTimeout(finishTimer);
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={() => setSceneRevealed(true)}>
      {!isDone && (
        <motion.div
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: "easeOut" },
          }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-verdant-cream select-none"
        >
          <div className="flex flex-col items-center gap-8 max-w-xs w-full">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border border-verdant-emerald/10 border-t-verdant-emerald animate-spin" style={{ animationDuration: '4s' }} />

              {/* The house mark, on the same dark roundel the favicon uses —
                  the V was left over from an earlier name. */}
              <CrestMark size={52} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <h2 className="font-serif text-lg tracking-[0.3em] text-verdant-emerald font-light uppercase">
                GEETEJ VIRAASAT
              </h2>
              <span className="text-[9px] tracking-[0.25em] text-verdant-gold font-light uppercase mt-1 block">
                Luxury Boutique
              </span>
            </motion.div>

            <div className="w-full mt-6">
              <div className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase text-verdant-emerald/40 mb-2 font-light">
                <span>Initializing Exhibition</span>
                <span className="text-verdant-gold">{Math.round(progress)}%</span>
              </div>
              {/* Scaled, not resized.
                  A `width` transition is laid out and painted on the main
                  thread, so it stops dead whenever that thread does — and the
                  longest wait behind this screen is one unbroken task the bar
                  used to sit frozen through: the first render of the scene,
                  querying uniform locations for 41 shader programs, measured at
                  19.7s cold on an integrated GPU. A transform runs on the
                  compositor and keeps gliding across a block, the way the
                  spinner above it already did. The easing is long and
                  decelerating for the same reason — each real step from the
                  preloader is still travelling when the next block starts. */}
              <div className="w-full h-px bg-verdant-emerald/10 rounded-full overflow-hidden">
                <div
                  className="h-full w-full origin-left bg-verdant-gold shadow-[0_0_8px_var(--color-secondary)]"
                  style={{
                    transform: `scaleX(${Math.max(progress, 0.5) / 100})`,
                    transition: "transform 2400ms cubic-bezier(0.16, 1, 0.3, 1)",
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
