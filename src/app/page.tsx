"use client";

import { useState, useEffect, useRef } from "react";
// Only the disabled floating product card and the disabled thirteen-zone cards
// used it — uncomment along with either of them.
// import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Gem,
  MessageSquare,
  ShieldCheck,
  Truck,
} from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import MouseFollower from "@/components/MouseFollower";
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/sections/Navbar";
import { journeyProgress, journeySpan, scrollToOffset } from "@/store/scroll-store";
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

/** Scroll progress at which the journey hands over to the collection finale. */
const FINALE_AT = 0.95;

/**
 * How far past the end of the journey the footer has to be before the fixed
 * overlays get out of its way — a fraction of a viewport. They are all
 * `position: fixed`, so nothing scrolls them off on its own.
 */
const FOOTER_AT = 0.2;

function goToZone(zone: number) {
  scrollToOffset(((zone + 0.25) / ZONE_COUNT) * journeySpan());
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
 *
 * Sticky rather than fixed. Fixed, it either covered the footer or had to be
 * hidden before you reached it; stuck to the journey it holds still over the
 * finale room, then rides the last of the journey up and comes to rest
 * directly on top of the footer, which is where it should be at the end.
 *
 * The offset is written in `vh` on purpose: a percentage offset on a sticky
 * element resolves against its containing block, and the containing block here
 * is the whole seven-screen journey. There is no `translate` centring it
 * either — a transform still applies once the element stops sticking, and it
 * would lift the card behind the navbar at rest. Half its height is subtracted
 * from the offset instead, so the resting position is exactly the journey's
 * last pixel: the card's foot on the footer's head.
 */
function CollectionFinale() {
  const categories = [
    { name: "Rings & Solitaires", href: "/products?category=rings" },
    { name: "Necklaces & Pendants", href: "/products?category=necklaces" },
    { name: "Earrings & Studs", href: "/products?category=earrings" },
    { name: "Bangles & Bracelets", href: "/products?category=braceletsbangles" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-[max(5rem,calc(50svh-14rem))] md:top-[calc(50vh-14rem)] flex justify-center px-4 pointer-events-none"
    >
      <div className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl pointer-events-auto">
        {/* Ambient Atmospheric Halo Glow */}
        <div className="absolute -inset-4 sm:-inset-8 bg-radial from-verdant-gold/25 via-verdant-gold/5 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="finale-card relative rounded-3xl border border-verdant-gold/45 bg-[#FAF6F0]/95 md:bg-[#FAF6F0]/92 backdrop-blur-2xl shadow-[0_24px_70px_rgba(53,30,40,0.18),0_0_40px_rgba(200,169,106,0.12)] p-5 sm:p-8 md:p-10 text-center overflow-hidden">
          
          {/* Heritage Golden Corner Accents */}
          <span className="absolute top-3.5 left-3.5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t-2 border-l-2 border-verdant-gold/60 rounded-tl-sm pointer-events-none" />
          <span className="absolute top-3.5 right-3.5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t-2 border-r-2 border-verdant-gold/60 rounded-tr-sm pointer-events-none" />
          <span className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b-2 border-l-2 border-verdant-gold/60 rounded-bl-sm pointer-events-none" />
          <span className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b-2 border-r-2 border-verdant-gold/60 rounded-br-sm pointer-events-none" />

          {/* Top Brand & Chapter Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-verdant-gold/40 bg-verdant-gold/10 mb-3 sm:mb-4 shadow-xs">
            <CrestMark size={14} />
            <span className="text-[9px] sm:text-[9.5px] tracking-[0.25em] uppercase text-verdant-gold font-bold font-mono">
              Geetej Viraasat Fine Jewelry
            </span>
            <span className="w-1 h-1 rounded-full bg-verdant-gold/60" />
            <span className="text-[8.5px] sm:text-[9px] tracking-[0.2em] uppercase text-verdant-emerald/60 font-medium">
              The Grand Finale
            </span>
          </div>

          {/* Main Headline */}
          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight text-verdant-emerald font-light">
            Find Your Forever{" "}
            <span className="italic text-verdant-gold font-normal">Masterpiece</span>
          </h3>

          {/* Royal Hallmark Separator */}
          <div className="flex items-center justify-center gap-2.5 my-3 sm:my-4">
            <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-verdant-gold/50 to-verdant-gold" />
            <span className="w-1.5 h-1.5 rotate-45 border border-verdant-gold bg-verdant-gold/20" />
            <Sparkles className="w-3.5 h-3.5 text-verdant-gold" />
            <span className="w-1.5 h-1.5 rotate-45 border border-verdant-gold bg-verdant-gold/20" />
            <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent via-verdant-gold/50 to-verdant-gold" />
          </div>

          {/* Subtitle / Descriptive Copy */}
          <p className="font-serif text-xs sm:text-sm text-verdant-emerald/80 max-w-lg mx-auto leading-relaxed mb-5 sm:mb-6 font-light">
            Step from the exhibition into our complete jewelry collection. Handcrafted in 22K certified gold, natural diamonds, and custom family heirlooms created to be cherished for generations.
          </p>

          {/* Quick Category Discovery Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-7">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="hover-target inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-serif text-verdant-emerald/80 bg-white/70 hover:bg-white hover:text-verdant-emerald border border-verdant-emerald/10 hover:border-verdant-gold/60 shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
              >
                <Gem className="w-3 h-3 text-verdant-gold" />
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
            <Link
              href="/products"
              className="hover-target group w-full sm:w-auto gold-gradient-bg text-verdant-emerald font-serif tracking-[0.15em] uppercase font-semibold text-xs px-8 py-3.5 sm:py-4 rounded-full shadow-[0_6px_25px_rgba(200,169,106,0.35)] hover:shadow-[0_8px_35px_rgba(200,169,106,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <span>Explore The Full Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/contact"
              className="hover-target w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-full border border-verdant-emerald/20 hover:border-verdant-gold bg-white/50 hover:bg-white text-verdant-emerald font-serif tracking-[0.12em] uppercase text-xs font-medium shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-verdant-gold" />
              <span>Custom Consultation</span>
            </Link>
          </div>

          {/* Trust Hallmark Strip */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-verdant-emerald/10 text-[8.5px] sm:text-[9.5px] text-verdant-emerald/65 font-medium tracking-wider uppercase font-mono">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-verdant-gold shrink-0" />
              <span>Certified Gold</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-verdant-gold shrink-0" />
              <span>Natural Gemstones</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-verdant-gold shrink-0" />
              <span>Insured Shipping</span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

function ChapterDot({
  zone,
  zoneIndex,
  isActive,
}: {
  zone: Zone;
  zoneIndex: number;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => goToZone(zoneIndex)}
      aria-label={`Go to chapter ${zone.chapter}: ${zone.title}`}
      aria-current={isActive ? "step" : undefined}
      className={`hover-target pointer-events-auto text-[9px] tracking-[0.15em] font-semibold w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
        isActive
          ? "bg-verdant-emerald text-verdant-cream border border-verdant-gold/50 scale-110"
          : "text-verdant-emerald/45 hover:text-verdant-gold"
      }`}
    >
      {zone.chapter}
    </button>
  );
}

export default function Home() {
  const [activeZone, setActiveZone] = useState(0);
  const [showEntranceCTA] = useState(true);
  const [atFinale, setAtFinale] = useState(false);
  const [inFooter, setInFooter] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const progress = journeyProgress();

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
      }
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.round(progress * 100)}%`;
      }

      setActiveZone(Math.min(Math.floor(progress * ZONE_COUNT), ZONE_COUNT - 1));
      setAtFinale(progress >= FINALE_AT);
      setInFooter(window.scrollY - journeySpan() > window.innerHeight * FOOTER_AT);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      desc: "Drift between gilded frames of our signature heirlooms — six handcrafted pieces photographed in the studio, hanging along both gallery walls.",
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
      title: "Craftsmanship Studio",
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
      desc: "The virtual mirror previews a styled look — jade medallions reflected back as if already worn.",
    },
    {
      title: "Jewelry Museum",
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
    <>
      <div
        data-journey
        className="journey relative overflow-x-clip select-none pointer-events-none"
      >
      <MouseFollower />
      <Navbar />

      <div className="absolute inset-x-0 top-0 bottom-10 sm:bottom-12 md:bottom-16 z-20 pointer-events-none">
        <AnimatePresence>{atFinale && <CollectionFinale />}</AnimatePresence>
      </div>

      <div
        className={`fixed z-10 pointer-events-none left-4 right-[3.25rem] bottom-[calc(1.25rem+env(safe-area-inset-bottom))] md:left-5 lg:left-8 md:right-auto md:w-full md:max-w-sm md:bottom-auto md:top-1/2 md:-translate-y-1/2 ${
          atFinale || inFooter ? "hidden" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 30, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="story-card glass-effect-gold p-4 sm:p-8 md:p-10 rounded-3xl border border-verdant-gold/30 bg-gradient-to-br from-[var(--color-background)]/85 to-[var(--color-background)]/70 shadow-[0_8px_40px_rgba(200,169,106,0.18)] text-left"
          >
            {currentZone.chapter ? (
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <span className="font-serif text-xl sm:text-2xl md:text-3xl text-verdant-gold font-light leading-none">
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

            <h3 className="story-title font-serif text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight text-verdant-emerald font-light mb-2.5 sm:mb-4">
              {currentZone.subtitle}
              {currentZone.accent && (
                <span className="block italic text-verdant-gold">
                  {currentZone.accent}
                </span>
              )}
            </h3>

            {currentZone.chapter && (
              <div className="hidden md:flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rotate-45 border border-verdant-gold/70" />
                <span className="h-px w-14 bg-verdant-gold/30" />
                <span className="w-1.5 h-1.5 rotate-45 border border-verdant-gold/70" />
              </div>
            )}

            <p className="story-desc text-verdant-emerald/70 text-xs md:text-sm font-light leading-snug sm:leading-relaxed tracking-wide mb-3.5 sm:mb-5 md:mb-8">
              {currentZone.desc}
            </p>

            {currentZone.cta && <div className="story-cta">{currentZone.cta}</div>}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className={`md:hidden fixed right-1 top-1/2 -translate-y-1/2 z-20 ${
          atFinale || inFooter ? "hidden" : ""
        }`}
      >
        {inStory && (
          <div className="glass-effect-gold flex flex-col items-center gap-1.5 rounded-full px-1 py-2">
            {zones.slice(1, STORY_ZONES).map((zone, i) => (
              <ChapterDot
                key={zone.chapter}
                zone={zone}
                zoneIndex={i + 1}
                isActive={activeZone === i + 1}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={`hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3 ${
          inFooter ? "md:hidden" : ""
        }`}
      >
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
                    <ChapterDot
                      zone={zone}
                      zoneIndex={zoneIndex}
                      isActive={isActive}
                    />
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
                      <CrestMark size={16} /> Geetej Viraasat
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

      <div
        className={`fixed left-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-8 md:left-8 z-10 hidden md:flex items-center gap-3 md:gap-4 text-[9px] uppercase tracking-[0.25em] text-verdant-emerald/70 ${
          inFooter ? "md:hidden" : ""
        }`}
      >
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

      {/* The footer scrolls up over the fixed canvas on its own — it is opaque
          and sits above it — but the overlays are fixed too, so they are told
          to leave. */}
      <div className="relative z-30">
        <Footer />
      </div>
    </>
  );
}
