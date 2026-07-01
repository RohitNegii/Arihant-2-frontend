"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth progress increment
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const duration = 3000; // 3 seconds
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(
        Math.round((currentStep / steps) * 100),
        100
      );
      setProgress(nextProgress);

      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          document.body.style.overflow = "unset";
        }, 500);
      }
    }, intervalTime);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "unset";
    };
  }, []);

  // 2D Canvas Gold Particles Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle class definition
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      opacitySpeed: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 60;

    const createParticle = (isInitial = false): Particle => ({
      x: Math.random() * width,
      y: isInitial ? Math.random() * height : height + 10,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.8 + 0.4),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: isInitial ? Math.random() * 0.5 + 0.2 : 0,
      opacitySpeed: Math.random() * 0.008 + 0.004,
    });

    // Populate initial particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial dark background gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, "#121212");
      bgGrad.addColorStop(1, "#0D0D0D");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.opacity < 0.8 && p.y > 100) {
          p.opacity += p.opacitySpeed;
        }

        // Fade out near top
        if (p.y < 100) {
          p.opacity -= 0.01;
        }

        // Recycled dead particles
        if (p.y < -10 || p.opacity <= 0) {
          particles[i] = createParticle(false);
          continue;
        }

        // Draw particle with luxury gold glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(199, 166, 106, ${Math.max(0, p.opacity)})`;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = "#C7A66A";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // SVG drawing configuration
  const logoPathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="loader"
          exit={{
            opacity: 0,
            y: "-100vh",
            filter: "blur(20px)",
            transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden select-none bg-[#0D0D0D]"
        >
          {/* Particles Background */}
          <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

          {/* Film Grain */}
          <div className="grain-overlay" />

          {/* Golden Center Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-radial from-[#C7A66A]/6 to-transparent blur-[90px] pointer-events-none" />

          {/* Central content */}
          <div className="flex flex-col items-center gap-6 relative z-10 text-center">
            {/* SVG Logo Reveal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-24 h-24 flex items-center justify-center mb-2"
            >
              <svg
                className="w-20 h-20"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Interlocking geometric luxury diamond/A monogram */}
                <motion.path
                  d="M50 15 L82 45 L50 82 L18 45 Z"
                  stroke="#C7A66A"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={logoPathVariants}
                  initial="hidden"
                  animate="visible"
                />
                <motion.path
                  d="M50 15 L50 82"
                  stroke="#C7A66A"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                  variants={logoPathVariants}
                  initial="hidden"
                  animate="visible"
                />
                <motion.path
                  d="M18 45 L82 45"
                  stroke="#C7A66A"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                  variants={logoPathVariants}
                  initial="hidden"
                  animate="visible"
                />
                <motion.path
                  d="M34 30 L50 45 L66 30"
                  stroke="#C7A66A"
                  strokeWidth="1"
                  variants={logoPathVariants}
                  initial="hidden"
                  animate="visible"
                />
                <motion.path
                  d="M34 60 L50 45 L66 60"
                  stroke="#C7A66A"
                  strokeWidth="1"
                  variants={logoPathVariants}
                  initial="hidden"
                  animate="visible"
                />
              </svg>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-1.5"
            >
              <h1 className="font-serif font-light text-2xl tracking-[0.4em] text-[#F5F0E8] uppercase">
                A U R A
              </h1>
              <span className="text-[7.5px] tracking-[0.3em] text-[#C7A66A] font-sans uppercase font-medium">
                HAUTE JOAILLERIE ATELIER
              </span>
            </motion.div>

            {/* Editorial Progress Numbers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6"
            >
              <span className="text-6xl md:text-7xl font-serif font-light tracking-tight text-[#F5F0E8]">
                {progress.toString().padStart(3, "0")}
              </span>
            </motion.div>
          </div>

          {/* Thin Progress bar at bottom */}
          <div className="fixed bottom-0 left-0 w-full h-[2px] bg-white/[0.04] z-20">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8C6F3E] via-[#C7A66A] to-[#F5F0E8] shadow-[0_0_8px_#C7A66A]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
