"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Maximize2, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../../utils/api";
import { useScrollLock } from "@/hooks/useScrollLock";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

// Media from the API lives on a host that is only known at runtime, so it can't
// be listed in `images.remotePatterns` — skip the optimizer for those URLs and
// let local assets (the fallback) still go through it.
const isRemote = (url: string) => /^https?:\/\//.test(url);

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock document scroll when full-screen lightbox is open
  useScrollLock(showLightbox);

  // Reset to the first slide when a different image set arrives
  const [prevImages, setPrevImages] = useState(images);
  if (prevImages !== images) {
    setPrevImages(images);
    setActiveIdx(0);
  }

  const galleryImages = images.length > 0 ? images : ["/emerald_ring.png"];
  const activeImage = getImageUrl(galleryImages[activeIdx]);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const nextSlide = () => {
    setActiveIdx((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setActiveIdx((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!showLightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLightbox(false);
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox, galleryImages.length]);

  return (
    <div className="flex flex-col gap-4 select-none relative z-10">
      {/* Active Main Image Display */}
      <div className="relative w-full aspect-square rounded-3xl border border-verdant-emerald/10 bg-gradient-to-b from-white/90 via-verdant-cream/50 to-verdant-emerald/[0.03] flex items-center justify-center p-6 sm:p-8 overflow-hidden group shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.03)]">
        {/* Subtle premium shimmer line */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />

        {/* Counter Badge */}
        {galleryImages.length > 1 && (
          <div
            className={`absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-md border border-verdant-emerald/10 text-verdant-emerald font-mono text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-xs transition-opacity duration-200 ${
              isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {activeIdx + 1} / {galleryImages.length}
          </div>
        )}

        {/* Zoomable Image/Video Window */}
        <div
          className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-2xl"
          onClick={() => setShowLightbox(true)}
        >
          {isVideoUrl(galleryImages[activeIdx]) ? (
            <video
              src={activeImage}
              className="w-full h-full object-cover rounded-2xl cursor-zoom-in"
              controls
              autoPlay
              muted
              loop
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="w-full h-full relative cursor-zoom-in flex items-center justify-center overflow-hidden rounded-2xl"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <Image
                ref={imageRef}
                src={activeImage}
                alt={`${name} - Active view`}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
                unoptimized={isRemote(activeImage)}
                className={`w-full h-full object-cover rounded-2xl transition-transform duration-200 ${
                  isZoomed ? "scale-200" : "scale-100"
                }`}
                style={
                  isZoomed
                    ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : undefined
                }
              />
            </div>
          )}
        </div>

        {/* Navigation Chevrons on Main Frame */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-verdant-emerald hover:text-black border border-verdant-emerald/10 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer ${
                isZoomed ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
              }`}
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-verdant-emerald hover:text-black border border-verdant-emerald/10 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer ${
                isZoomed ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
              }`}
              aria-label="Next Image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Maximize Icon Overlay */}
        <button
          type="button"
          onClick={() => setShowLightbox(true)}
          className={`absolute bottom-4 right-4 bg-white/80 hover:bg-white text-verdant-emerald hover:text-verdant-gold p-2.5 rounded-full shadow-md backdrop-blur-xs transition-all active:scale-95 z-20 border border-verdant-emerald/10 cursor-pointer ${
            isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          aria-label="Enlarge Image"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails list */}
      {galleryImages.length > 1 && (
        <div className="flex gap-3 justify-center sm:justify-start overflow-x-auto py-2 scrollbar-none">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden p-1 border transition-all cursor-pointer shrink-0 bg-white/60 ${
                activeIdx === idx
                  ? "border-verdant-gold ring-1 ring-verdant-gold/50 shadow-xs scale-102"
                  : "border-verdant-emerald/10 opacity-70 hover:opacity-100 hover:border-verdant-emerald/30"
              }`}
            >
              {isVideoUrl(img) ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-xl overflow-hidden">
                  <video
                    src={getImageUrl(img)}
                    className="object-cover w-full h-full"
                    muted
                    playsInline
                  />
                  <span className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </span>
                </div>
              ) : (
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={getImageUrl(img)}
                    alt={`${name} - Thumb ${idx + 1}`}
                    fill
                    sizes="80px"
                    unoptimized={isRemote(getImageUrl(img))}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Full-screen Lightbox Modal (Portaled to document.body) */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showLightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLightbox(false)}
              className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 select-none overscroll-contain"
              data-lenis-prevent
            >
              {/* Close button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(false);
                }}
                className="absolute top-5 right-5 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-[100000] cursor-pointer shadow-lg"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Slider window */}
              <div
                className="relative max-w-4xl w-full aspect-square flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    className="absolute left-2 sm:left-4 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-all cursor-pointer z-10 shadow-lg"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {isVideoUrl(galleryImages[activeIdx]) ? (
                  <motion.video
                    key={activeIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    src={activeImage}
                    className="max-h-[80vh] max-w-[85vw] object-contain rounded-2xl"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  <motion.img
                    key={activeIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    src={activeImage}
                    alt={`${name} - Enlarged`}
                    className="max-h-[80vh] max-w-[85vw] object-contain rounded-2xl"
                  />
                )}

                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    className="absolute right-2 sm:right-4 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-all cursor-pointer z-10 shadow-lg"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Index label indicator */}
              <span className="text-white/60 text-[10px] tracking-[0.25em] font-bold font-mono mt-6">
                EXHIBIT {activeIdx + 1} OF {galleryImages.length}
              </span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
