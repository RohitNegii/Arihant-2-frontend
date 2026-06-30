"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export default function MouseFollower() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Fast spring for the inner dot to keep it highly responsive
  const dotSpringConfig = { damping: 20, stiffness: 450, mass: 0.2 };
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  // Slower spring for the outer ring to create a fluid, lagging trail effect
  const ringSpringConfig = { damping: 25, stiffness: 150, mass: 0.8 };
  const ringX = useSpring(mouseX, ringSpringConfig);
  const ringY = useSpring(mouseY, ringSpringConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    window.addEventListener("mousemove", moveCursor);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const updateHoverListeners = () => {
      const hoverables = document.querySelectorAll(
        "a, button, [role='button'], .hover-target"
      );
      hoverables.forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
      });
    };

    const observer = new MutationObserver(updateHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    updateHoverListeners();

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      const hoverables = document.querySelectorAll(
        "a, button, [role='button'], .hover-target"
      );
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
      observer.disconnect();
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Glow Ring (with elastic lag trailing) */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: isHovered ? 52 : 24,
          height: isHovered ? 52 : 24,
          border: isHovered
            ? "1px solid rgba(255, 90, 31, 0.7)"
            : "1px solid rgba(255, 255, 255, 0.3)",
          background: isHovered
            ? "rgba(255, 90, 31, 0.08)"
            : "rgba(255, 255, 255, 0.01)",
          boxShadow: isHovered
            ? "0 0 15px rgba(255, 90, 31, 0.25)"
            : "none",
        }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="font-serif italic text-[#ff5a1f] text-[9px] tracking-wide"
            >
              view
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Inner Sparkle Dot (tight snap tracking) */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#ff5a1f] rounded-full pointer-events-none z-[10000] shadow-[0_0_8px_#ff5a1f]"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          scale: isHovered ? 0 : 1,
        }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.15 }}
      />
    </>
  );
}
