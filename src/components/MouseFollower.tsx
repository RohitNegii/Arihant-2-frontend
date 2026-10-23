"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function MouseFollower() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    setHasFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!hasFinePointer) return;

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    const HOVERABLE = "a, button, [role='button'], .hover-target";
    const handleOver = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(HOVERABLE)) setIsHovered(true);
    };
    const handleOut = (e: MouseEvent) => {
      const from = (e.target as Element | null)?.closest?.(HOVERABLE);
      const to = (e.relatedTarget as Element | null)?.closest?.(HOVERABLE);
      if (from && from !== to) setIsHovered(false);
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    document.addEventListener("mouseover", handleOver, { passive: true });
    document.addEventListener("mouseout", handleOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [mouseX, mouseY, hasFinePointer]);

  if (!hasFinePointer || !isVisible) return null;

  return (
    <>
      {/* Outer Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[45]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          width: isHovered ? 64 : 24,
          height: isHovered ? 64 : 24,
          border: isHovered
            ? "1px solid rgba(255, 255, 255, 0.8)"
            : "1px solid rgba(212, 175, 55, 0.6)",
          background: isHovered
            ? "radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0) 70%)"
            : "radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0) 70%)",
          boxShadow: isHovered
            ? "0 0 20px rgba(212, 175, 55, 0.3)"
            : "0 0 8px rgba(212, 175, 55, 0.1)",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
      />
      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-luxury-gold rounded-full pointer-events-none z-[45]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          scale: isHovered ? 0.5 : 1,
        }}
      />
    </>
  );
}
