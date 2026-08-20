"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../../utils/api";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const ext = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
};

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setActiveIdx(0);
  }, [images]);

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

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Active Main Image Display */}
      <div className="relative w-full aspect-square rounded-3xl border border-verdant-emerald/5 bg-verdant-emerald/5 flex items-center justify-center p-6 overflow-hidden group">
        {/* Zoomable Image/Video Window */}
        <div
          className="w-full h-full relative"
          onClick={() => setShowLightbox(true)}
        >
          {isVideoUrl(galleryImages[activeIdx]) ? (
            <video
              src={activeImage}
              className="w-full h-full object-cover cursor-zoom-in"
              controls
              autoPlay
              muted
              loop
              playsInline
              onClick={(e) => e.stopPropagation()} // Prevent clicking video controls from triggering lightbox
            />
          ) : (
            <div
              className="w-full h-full cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                ref={imageRef}
                src={activeImage}
                alt={`${name} - Active view`}
                className={`w-full h-full object-cover transition-transform duration-200 ${
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

        {/* Maximize Icon Overlay */}
        <button
          onClick={() => setShowLightbox(true)}
          className="absolute bottom-4 right-4 bg-[#FAF7F2]/80 hover:bg-[#FAF7F2] text-verdant-emerald hover:text-verdant-gold p-2.5 rounded-full shadow-md backdrop-blur-xs transition-all active:scale-95 z-10"
          aria-label="Enlarge Image"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails list */}
      {galleryImages.length > 1 && (
        <div className="flex gap-3 justify-center overflow-x-auto py-1">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`w-16 h-16 rounded-2xl overflow-hidden p-1.5 border transition-all bg-verdant-emerald/5 flex items-center justify-center ${
                activeIdx === idx
                  ? "border-verdant-gold ring-1 ring-verdant-gold/30 scale-102"
                  : "border-verdant-emerald/5 hover:border-verdant-emerald/20 opacity-70 hover:opacity-100"
              }`}
            >
              {isVideoUrl(img) ? (
                <video
                  src={getImageUrl(img)}
                  className="object-cover w-full h-full"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={getImageUrl(img)}
                  alt={`${name} - Thumb ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Full-screen Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6 md:p-12 select-none"
          >
            {/* Close button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-[210] cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slider window */}
            <div className="relative max-w-4xl w-full aspect-square flex items-center justify-center">
              {galleryImages.length > 1 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-0 bg-white/10 hover:bg-white/20 hover:text-white text-white/70 p-3 rounded-full transition-all cursor-pointer z-10"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
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
                  className="max-h-[80vh] max-w-[85vw] object-contain"
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
                  className="max-h-[80vh] max-w-[85vw] object-contain"
                />
              )}

              {galleryImages.length > 1 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-0 bg-white/10 hover:bg-white/20 hover:text-white text-white/70 p-3 rounded-full transition-all cursor-pointer z-10"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Index label indicator */}
            <span className="text-white/40 text-[10px] tracking-[0.25em] font-bold font-mono mt-6">
              EXHIBIT {activeIdx + 1} OF {galleryImages.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
