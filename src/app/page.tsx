"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
// Only the disabled floating product card and the disabled thirteen-zone cards
// used it — uncomment along with either of them.
// import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import MouseFollower from "@/components/MouseFollower";
import Navbar from "@/components/sections/Navbar";
import { scrollToOffset } from "@/store/scroll-store";
import { JEWELRY_IMAGES, type JewelryImage } from "@/content/jewelry";

interface Zone {
  chapter?: string;
  title: string;
  subtitle: string;
  accent?: string;
  desc: string;
  cta?: React.ReactNode;
  image?: JewelryImage;
}

const ZONE_COUNT = 6;
const STORY_ZONES = 6;

/** Scroll progress at which the journey hands over to the category finale. */
const FINALE_AT = 0.95;

/** `gender` is the exact value the products filter expects — see ProductFilters. */
const CATEGORIES = [
  { label: "For Him", gender: "Men", note: "Signet rings, cufflinks, chains" },
  { label: "For Her", gender: "Women", note: "Chandbalis, drops, medallions" },
  { label: "Unisex", gender: "Unisex", note: "Bands, studs, everyday pieces" },
] as const;

const ShowroomCanvas = dynamic(() => import("@/components/3d/ShowroomCanvas"), {
  ssr: false,
});

function goToZone(zone: number) {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight || 1;
  scrollToOffset(((zone + 0.25) / ZONE_COUNT) * maxScroll);
}

function StoryCTA({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">
        {label}
      </span>
      <span className="w-7 h-7 rounded-full border border-verdant-gold/60 flex items-center justify-center group-hover:bg-verdant-gold group-hover:text-black transition-colors duration-300">
        <ArrowRight className="w-3 h-3" />
      </span>
    </>
  );

  const className =
    "pointer-events-auto inline-flex items-center gap-3 text-verdant-emerald hover:text-verdant-gold transition-colors duration-300 group cursor-pointer";

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

/**
 * End of the journey. Takes over from the zone card rather than sitting beside
 * it — at this point the story is told and the only job left is to send the
 * visitor into the catalogue.
 */
function CategoryFinale() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-20 flex justify-center px-4 pointer-events-none"
    >
      <div className="glass-effect-gold pointer-events-auto w-full max-w-md md:max-w-2xl rounded-3xl border border-verdant-gold/30 bg-gradient-to-br from-[var(--color-background)]/90 to-[var(--color-background)]/70 shadow-[0_8px_40px_rgba(200,169,106,0.22)] p-6 sm:p-8 md:p-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-verdant-gold/40 bg-verdant-gold/10 mb-4">
          <Sparkles className="w-2.5 h-2.5 text-verdant-gold" />
          <span className="text-[9px] tracking-[0.25em] uppercase text-[var(--color-accent)] font-semibold">
            The Collection
          </span>
        </div>

        <h3 className="font-serif text-2xl md:text-3xl tracking-tight leading-tight text-verdant-emerald font-light">
          Find Your Forever
          <span className="block italic text-verdant-gold">Piece</span>
        </h3>

        <div className="flex items-center justify-center gap-2 my-5">
          <span className="w-1.5 h-1.5 rotate-45 border border-verdant-gold/70" />
          <span className="h-px w-14 bg-verdant-gold/30" />
          <span className="w-1.5 h-1.5 rotate-45 border border-verdant-gold/70" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.gender}
              href={`/products?gender=${c.gender}`}
              className="hover-target group flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 rounded-2xl border border-verdant-emerald/15 bg-white/40 hover:bg-white/70 hover:border-verdant-gold/50 px-4 py-3 sm:py-4 text-left transition-all duration-300 cursor-pointer"
            >
              <span className="font-serif text-lg text-verdant-emerald leading-none">
                {c.label}
              </span>
              <span className="hidden sm:block text-[10px] leading-snug text-verdant-emerald/50 font-light">
                {c.note}
              </span>
              <span className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase font-semibold text-verdant-gold sm:mt-1">
                Shop
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [activeZone, setActiveZone] = useState(0);
  const [showEntranceCTA, setShowEntranceCTA] = useState(false);
  const [atFinale, setAtFinale] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
      }
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.round(progress * 100)}%`;
      }

      setActiveZone(Math.min(Math.floor(progress * ZONE_COUNT), ZONE_COUNT - 1));
      setAtFinale(progress >= FINALE_AT);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEntranceCTA(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const zones: Zone[] = [
    {
      title: "Welcome",
      subtitle: "Every Jewel",
      accent: "Tells a Story",
      desc: "Step into a world where craftsmanship meets emotion, and every piece carries a story of its own.",
      cta: showEntranceCTA && (
        <div className="flex flex-wrap gap-4 pointer-events-auto">
          <button
            type="button"
            onClick={() => goToZone(1)}
            className="gold-gradient-bg text-black px-6 py-2.5 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform cursor-pointer"
          >
            Enter The Showroom <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      chapter: "01",
      title: "The Beginning",
      subtitle: "The Beginning",
      desc: "Every masterpiece begins with inspiration. Our journey started with a dream to create more than just jewellery.",
      cta: <StoryCTA label="Discover Our Story" onClick={() => goToZone(2)} />,
    },
    {
      chapter: "02",
      title: "The Craft",
      subtitle: "The Craft",
      desc: "Handcrafted by skilled artisans who pour their heart into every curve, every detail, every stone.",
      cta: <StoryCTA label="Explore Craftsmanship" onClick={() => goToZone(3)} />,
      image: JEWELRY_IMAGES.peacockHexagon,
    },
    {
      chapter: "03",
      title: "The Collection",
      subtitle: "The Collection",
      desc: "Timeless designs that celebrate tradition while embracing modern elegance.",
      cta: <StoryCTA label="View Collections" href="/products" />,
      image: JEWELRY_IMAGES.royalPeacock,
    },
    {
      chapter: "04",
      title: "Made for Moments",
      subtitle: "Made for Moments",
      desc: "From timeless traditions to modern celebrations, our jewellery is made to be a part of your story.",
      cta: <StoryCTA label="Find Your Moment" onClick={() => goToZone(5)} />,
      image: JEWELRY_IMAGES.abaloneElephant,
    },
    {
      chapter: "05",
      title: "Yours Forever",
      subtitle: "Yours Forever",
      desc: "More than jewellery — a memory, a feeling, a story that lasts forever.",
      cta: <StoryCTA label="Shop Now" href="/products" />,
      image: JEWELRY_IMAGES.jadeMedallion,
    },

    /* ---------- THE ORIGINAL EXHIBITION (disabled) ----------
       The thirteen exhibition zone cards used to follow here, paired with the
       3D rooms now commented out in `ShowroomCanvas`. Restore this block, the
       room mounts there, and ZONE_COUNT = 19 together to bring the old
       showroom back.

    {
      title: "Entrance Hall",
      subtitle: "Jewelry Crafted Beyond Time",
      desc: "Welcome to GEETEJ VIRAASAT. Explore our virtual showroom to discover the organic geometry of high craftsmanship.",
    },
    {
      title: "History Tunnel",
      subtitle: "The Archives of Creation",
      desc: "Drift between gilded frames of our signature heirlooms — six handcrafted pieces photographed in the atelier, hanging along both gallery walls.",
    },
    {
      title: "Floating Gallery",
      subtitle: "Gemstone Levitations",
      desc: "Hover over the glass jewelry boxes floating in space. Watch the lids lift and gems slide upwards on organic rings.",
      image: JEWELRY_IMAGES.royalPeacock,
    },
    {
      title: "Diamond Laboratory",
      subtitle: "GIA Crystallization",
      desc: "Scroll to watch a raw carbon structure explode and rebuild into a faceted emerald gem. We guarantee Cut, Clarity, Color, and Carat purity.",
    },
    {
      title: "Craftsmanship Atelier",
      subtitle: "From fire to form",
      desc: "Scroll to watch raw gold casting melt, morph, and solidify into a mirror-polished luxury band.",
      image: JEWELRY_IMAGES.peacockHexagon,
    },
    {
      title: "Signature Collections",
      subtitle: "Sown in Botany",
      desc: "Witness Rings, Necklaces, Bracelets, and Earrings floating on giant pedestals. Click pedestals to rotate them.",
      image: JEWELRY_IMAGES.emeraldGoddess,
    },
    {
      title: "Virtual Try-On Mirror",
      subtitle: "Interactive Reflexes",
      desc: "The atelier mirror previews a styled look — jade medallions reflected back as if already worn.",
    },
    {
      title: "Atelier Museum",
      subtitle: "Best Sellers Selection",
      desc: "Hover over the museum display glass cubes to open them, floating the jewelry upwards and showing boutique prices.",
      image: JEWELRY_IMAGES.rubyChandbali,
    },
    {
      title: "Voices of Elegance",
      subtitle: "Customer Testaments",
      desc: "Hover over the crystal bubbles floating around you to expand verified letters from art collectors and designers.",
    },
    {
      title: "Earth to Mine Sourcing",
      subtitle: "Botanical Integrity",
      desc: "We fly underground to Colomban veins. Emerald crystals and gold ores are extracted under conflict-free Kimberly promises.",
    },
    {
      title: "The Luxury Promise",
      subtitle: "Stone Pillars of Trust",
      desc: "Four stone columns light up, confirming Hallmarked Gold, GIA Certified Diamonds, Lifetime Warranty, and Insured Worldwide Shipping.",
    },
    {
      title: "Masterpiece Arena",
      subtitle: "The Crown Jewel",
      desc: "Enter a massive circular arena. The most detailed custom ring floats in golden stardust under spotlight matrices.",
      image: JEWELRY_IMAGES.turquoiseChandelier,
    },
    {
      title: "Create Your Forever Story",
      subtitle: "GEETEJ VIRAASAT",
      desc: "Begin your bespoke design consultation with our Milan master craftsmen today.",
      cta: (
        <div className="pointer-events-auto mt-2">
          <div className="flex gap-2.5 mb-6">
            {[
              JEWELRY_IMAGES.abaloneElephant,
              JEWELRY_IMAGES.jadeMedallion,
              JEWELRY_IMAGES.lapisBloom,
            ].map((img) => (
              <div
                key={img.src}
                className="relative flex-1 aspect-[4/5] rounded-xl overflow-hidden ring-1 ring-verdant-gold/40 shadow-md"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="10rem"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="gold-gradient-bg text-black px-8 py-3.5 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-lg">
              Explore Collection <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="glass-effect hover:bg-white/5 border border-verdant-emerald/20 text-[var(--color-accent)] px-8 py-3.5 rounded-full text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2">
              Book Appointment <Calendar className="w-3.5 h-3.5 text-verdant-gold" />
            </button>
          </div>
        </div>
      ),
    },
    ---------- end disabled exhibition ---------- */
  ];

  const currentZone = zones[activeZone] || zones[0];
  const inStory = activeZone < STORY_ZONES;

  return (
    <div className="relative min-h-[700vh] bg-[var(--color-shell)] overflow-x-hidden select-none">
      <LoadingScreen />
      <MouseFollower />
      <Navbar />

      <ShowroomCanvas />

      <AnimatePresence>{atFinale && <CategoryFinale />}</AnimatePresence>

      <div
        className={`fixed z-10 pointer-events-none left-1/2 -translate-x-1/2 bottom-[calc(2.5rem+env(safe-area-inset-bottom))] w-[calc(100%-2rem)] max-w-sm md:left-5 lg:left-8 md:translate-x-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-sm ${
          atFinale ? "hidden" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 30, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-effect-gold p-5 sm:p-8 md:p-10 rounded-3xl border border-verdant-gold/30 bg-gradient-to-br from-[var(--color-background)]/85 to-[var(--color-background)]/70 shadow-[0_8px_40px_rgba(200,169,106,0.18)] text-left"
          >
            {currentZone.chapter ? (
              <div className="flex items-center gap-3 mb-3">
                <span className="font-serif text-2xl md:text-3xl text-verdant-gold font-light leading-none">
                  {currentZone.chapter}
                </span>
                <span className="h-px flex-1 max-w-16 bg-verdant-gold/40" />
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-verdant-gold/40 bg-verdant-gold/10 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold animate-pulse" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-[var(--color-accent)] font-semibold">
                  {currentZone.title}
                </span>
              </div>
            )}

            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight text-verdant-emerald font-light mb-4">
              {currentZone.subtitle}
              {currentZone.accent && (
                <span className="block italic text-verdant-gold">
                  {currentZone.accent}
                </span>
              )}
            </h3>

            {currentZone.chapter && (
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rotate-45 border border-verdant-gold/70" />
                <span className="h-px w-14 bg-verdant-gold/30" />
                <span className="w-1.5 h-1.5 rotate-45 border border-verdant-gold/70" />
              </div>
            )}

            <p className="text-verdant-emerald/70 text-xs md:text-sm font-light leading-relaxed tracking-wide mb-5 md:mb-8">
              {currentZone.desc}
            </p>

            {currentZone.cta && currentZone.cta}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3">
        <AnimatePresence>
          {inStory && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-[8px] tracking-[0.3em] uppercase text-verdant-emerald/40 [writing-mode:vertical-rl] mb-1">
                Scroll
              </span>
              <span className="w-px h-8 bg-verdant-emerald/15" />
              {zones.slice(1, STORY_ZONES).map((zone, i) => {
                const zoneIndex = i + 1;
                const isActive = activeZone === zoneIndex;
                return (
                  <div key={zone.chapter} className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => goToZone(zoneIndex)}
                      aria-label={`Go to chapter ${zone.chapter}: ${zone.title}`}
                      className={`hover-target text-[9px] tracking-[0.15em] font-semibold w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${isActive
                          ? "bg-verdant-emerald text-verdant-cream border border-verdant-gold/50 scale-110"
                          : "text-verdant-emerald/45 hover:text-verdant-gold"
                        }`}
                    >
                      {zone.chapter}
                    </button>
                    {zoneIndex < STORY_ZONES - 1 && (
                      <span className="w-px h-6 bg-verdant-emerald/15" />
                    )}
                  </div>
                );
              })}
              <span className="w-px h-8 bg-verdant-emerald/15" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The floating product card is disabled by request — it sat over the
          right third of every zone and competed with the room behind it. The
          `image` field is still on every entry of `zones`, so restoring it is
          uncommenting this block and nothing else.

          Two things go with it: the `next/image` import at the top of the file,
          which nothing live uses any more, and the note that used to sit on the
          <Image> below — the card was on screen from the first frame, so Next
          measured it as the LCP and it carried `priority` for that reason. With
          the card gone the LCP is the canvas. */}
      {/*
      <div
        className={`fixed right-20 xl:right-28 top-1/2 -translate-y-1/2 z-10 pointer-events-none w-56 xl:w-72 ${
          atFinale ? "hidden" : "hidden lg:block"
        }`}
      >
        <AnimatePresence mode="wait">
          {currentZone.image && (
            <motion.div
              key={currentZone.image.src}
              initial={{ opacity: 0, x: 60, rotate: 3, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 60, rotate: -3, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-verdant-gold/40 shadow-[0_20px_60px_rgba(200,169,106,0.28)]">
                  <Image
                    src={currentZone.image.src}
                    alt={currentZone.image.alt}
                    fill
                    priority
                    sizes="(min-width: 1280px) 18rem, 14rem"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[8px] tracking-[0.3em] uppercase text-verdant-gold font-bold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5" /> Verdant Jewels
                    </p>
                    <p className="font-serif text-lg text-white leading-snug">
                      {currentZone.image.name}
                    </p>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 border-t-2 border-r-2 border-verdant-gold/70 rounded-tr-[1.75rem]" />
                <div className="absolute -bottom-3 -left-3 w-10 h-10 border-b-2 border-l-2 border-verdant-gold/70 rounded-bl-[1.75rem]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      */}

      <div className="fixed left-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-8 md:left-8 z-10 flex items-center gap-3 md:gap-4 text-[9px] uppercase tracking-[0.25em] text-verdant-emerald/70">
        <span className="hidden sm:inline">Exhibition Progress</span>
        <div className="w-20 md:w-32 h-px bg-[var(--color-accent)]/10 rounded-full overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-verdant-gold shadow-[0_0_8px_var(--color-secondary)]"
            style={{ width: "0%" }}
          />
        </div>
        <span ref={progressTextRef} className="text-verdant-gold font-bold">
          0%
        </span>
      </div>
    </div>
  );
}
