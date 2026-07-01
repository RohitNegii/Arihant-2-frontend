"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Shield, Award, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import LoadingScreen from "@/components/LoadingScreen";
import MouseFollower from "@/components/MouseFollower";
import Navbar from "@/components/sections/Navbar";
import StoryCanvas, { setActiveCollectionHover } from "@/components/3d/StoryCanvas";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);

  const [activeZone, setActiveZone] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Monitor scroll height
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // GSAP ScrollTrigger timelines
    // Card Cascade for Materials (Scene 4)
    gsap.fromTo(
      ".material-card",
      { opacity: 0, y: 80, scale: 0.9, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        stagger: 0.25,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: materialsRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Testimonial Cards Fade-in (Scene 8)
    gsap.fromTo(
      ".testimonial-card",
      { opacity: 0, x: -60, filter: "blur(6px)" },
      {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        stagger: 0.3,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: testimonialRef.current,
          start: "top center+=200",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      window.removeEventListener("scroll", handleScroll);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const getScrollLimit = () => {
    if (typeof document === "undefined") return 1;
    return document.documentElement.scrollHeight - window.innerHeight || 1;
  };

  const progress = scrollY / getScrollLimit();

  // Update active zone (9 scenes mapped evenly from 0.0 to 1.0)
  useEffect(() => {
    const zone = Math.min(Math.floor(progress * 9), 8);
    setActiveZone(zone);
  }, [progress]);

  const scrollToZone = (index: number) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const targetScroll = (index / 8) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const zoneNames = [
    "Introduction",
    "Heritage Story",
    "Layered Art",
    "Precious Elements",
    "Featured Collection",
    "Showcase Medallion",
    "Atelier Manifesto",
    "Client Testaments",
    "Bespoke Consultation",
  ];

  return (
    <div ref={containerRef} className="relative min-h-[900vh] bg-[#0D0D0D] overflow-x-hidden select-none text-[#F5F0E8] font-sans">
      {/* FILM GRAIN OVERLAY */}
      <div className="grain-overlay" />

      {/* LUXURY EDITORIAL BACKGROUND MATRIX */}
      <div className="fixed inset-0 pointer-events-none z-1 flex justify-between px-[6vw]">
        <div className="w-[1px] h-full bg-[#F5F0E8]/[0.02]" />
        <div className="w-[1px] h-full bg-[#F5F0E8]/[0.02] hidden md:block" />
        <div className="w-[1px] h-full bg-[#F5F0E8]/[0.02] hidden md:block" />
        <div className="w-[1px] h-full bg-[#F5F0E8]/[0.02]" />
      </div>

      <LoadingScreen />
      <MouseFollower />
      <Navbar />

      {/* ROTATED SIDE TEXT */}
      <div className="fixed left-6 md:left-[3.5vw] top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[8px] uppercase tracking-[0.4em] text-[#F5F0E8]/20 select-none z-10 pointer-events-none hidden xl:block font-medium">
        AURA ATELIER // HERITAGE FILIGREE // DESIGNER COUTURE MILANO
      </div>

      {/* FIXED 3D BACKGROUND CANVAS */}
      <StoryCanvas />

      {/* =============================================================
          9 HTML STORYTELLING PANELS (STACKED FOR SCROLL TRIGGERING)
          ============================================================= */}

      {/* SCENE 1: HERO */}
      <section className="relative h-screen w-full flex items-center justify-center bg-transparent z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col items-start text-left pt-20 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C7A66A]/20 bg-[#C7A66A]/5 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7A66A] animate-pulse" />
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#F5F0E8]/80 font-medium">
              Handcrafted Couture Series
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight leading-[0.95] text-[#F5F0E8] mb-6 font-light capitalize"
          >
            Traditional Art
            <br />
            Designer Details
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.4, ease: "easeOut" }}
            className="text-[#F5F0E8]/60 text-xs md:text-sm max-w-sm font-light leading-relaxed mb-8 tracking-wider"
          >
            Explore our collection of hand-sculpted peacock filigree, lapis fish drops, and jade shield earrings.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.6, ease: "easeOut" }}
            className="pointer-events-auto flex items-center gap-2"
          >
            <button
              onClick={() => scrollToZone(1)}
              className="hover-target shimmer-btn bg-[#C7A66A] hover:bg-[#B69259] text-[#0D0D0D] font-bold text-[9px] tracking-[0.25em] uppercase px-8 py-3.5 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300"
            >
              Begin Journey <ArrowRight className="w-3.5 h-3.5 text-[#0D0D0D]" />
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-[8px] uppercase tracking-[0.3em] text-[#F5F0E8]/40">
          <span>Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 rounded-full bg-[#C7A66A]"
          />
        </div>
      </section>

      {/* SCENE 2: BRAND STORY */}
      <section id="story" className="relative h-screen w-full flex items-center justify-center bg-transparent z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C7A66A] mb-3 font-semibold">
              The Artisan Heritage
            </span>
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-[#F5F0E8] leading-tight font-light mb-6">
              Sown in Heritage,
              <br />
              <span className="gold-gradient-text font-serif italic">Forged by Tradition</span>
            </h2>
            <div className="w-10 h-[1px] bg-[#C7A66A]/40 mb-6" />
            <p className="text-[#F5F0E8]/75 text-xs md:text-sm font-light leading-relaxed tracking-wider mb-4">
              Our designs combine historic metalwork and artistic complexity. We merge oxidized sterling silver, gold peacock leaf filigree, lapis lazuli inlays, jade stones, and rubies into bespoke jewelry masterpieces.
            </p>
            <p className="text-[#F5F0E8]/40 text-[10px] md:text-xs font-light leading-relaxed tracking-wider">
              AURA focuses on deep color contrasts, detailed borders, and natural reflections that capture authentic studio lookbooks.
            </p>
          </div>
        </div>
      </section>

      {/* SCENE 3: CRAFTSMANSHIP (DECOMPOSING EARRING) */}
      <section id="craftsmanship" className="relative h-screen w-full flex items-center justify-center bg-transparent z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex justify-end">
          <div className="max-w-md flex flex-col items-start text-left">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C7A66A] mb-3 font-semibold">
              Anatomy of Craft
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#F5F0E8] leading-tight font-light mb-6">
              The Layered Art of
              <br />
              <span className="gold-gradient-text font-serif italic">The Peacock Drop</span>
            </h2>
            <p className="text-[#F5F0E8]/75 text-xs md:text-sm font-light leading-relaxed tracking-wider mb-6">
              Watch the artisan layers align. Scroll back and forth to witness the hexagonal plate, golden peacock, grooved spindle, and hanging ghungroo bells separate vertically and converge back into a unified earring.
            </p>
            
            {/* Tech data readout list */}
            <div className="flex flex-col gap-2.5 font-mono text-[9px] text-[#F5F0E8]/90 tracking-widest w-full">
              <div className="flex justify-between border-b border-[#F5F0E8]/5 pb-2">
                <span className="text-[#F5F0E8]/40">PEACOCK EMBLEM</span>
                <span className="text-[#C7A66A] font-medium">Hand-Carved Gold</span>
              </div>
              <div className="flex justify-between border-b border-[#F5F0E8]/5 pb-2">
                <span className="text-[#F5F0E8]/40">HEXAGON PLATE</span>
                <span className="text-white">Oxidized Sterling Silver</span>
              </div>
              <div className="flex justify-between border-b border-[#F5F0E8]/5 pb-2">
                <span className="text-[#F5F0E8]/40">DROPS & BELLS</span>
                <span className="text-[#C7A66A] font-medium">Hanging Gold Ghungroos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 4: MATERIALS */}
      <section ref={materialsRef} id="materials" className="relative h-screen w-full flex items-center justify-center bg-transparent z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C7A66A] mb-3 font-semibold">
              Heritage Materials
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#F5F0E8] leading-tight font-light mb-6">
              Bespoke Elements
            </h2>
            <p className="text-[#F5F0E8]/75 text-xs md:text-sm font-light leading-relaxed tracking-wider mb-4">
              We specialize in custom alloy formulations, merging oxidized sterling silver with gold leaves, blue lapis, jade green, and rubies to build high-end contrast designs.
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col sm:grid sm:grid-cols-2 gap-4 w-full text-left pointer-events-auto">
            {[
              { title: "Oxidized Silver", desc: "Darkened and textured to provide a high-contrast, antique backdrop for gold filigree leaves." },
              { title: "Semi-Precious Stones", desc: "Deep lapis lazuli inlays, turquoise cabochons, and square emerald-green jade blocks." },
              { title: "Gold Filigree", desc: "Hand-sculpted golden peacock symbols and daisy flowers representing classic beauty." },
              { title: "Ruby Accents", desc: "Vibrant square-cut rubies mounted in custom gold bezels at the center of filigree plates." }
            ].map((card, i) => (
              <div
                key={i}
                className="material-card glass-effect hover:border-[#C7A66A]/20 p-5 rounded-xl transition-all duration-300 group hover:translate-y-[-2px] bg-[#0D0D0D]/65"
              >
                <h3 className="font-serif text-[#C7A66A] text-lg mb-2 font-medium group-hover:text-white transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-[#F5F0E8]/60 text-[11px] font-light leading-relaxed tracking-wide">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SCENE 5: FEATURED COLLECTION (3D HOVER STATE) */}
      <section id="collection" className="relative h-screen w-full flex items-center justify-center bg-transparent z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col items-center">
          
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C7A66A] mb-3 font-semibold">
              The Collection
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#F5F0E8] font-light">
              Featured Couture Series
            </h2>
            <div className="w-10 h-[1px] bg-[#C7A66A]/40 mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pointer-events-auto">
            {[
              { index: 0, name: "Peacock Spindle Drops", price: "$2,450", spec: "Oxidized Silver // Gold Peacock & Bells" },
              { index: 1, name: "Lapis Triangle Drops", price: "$1,950", spec: "Daisy Floral Stud // Lapis Lazuli & Fish" },
              { index: 2, name: "Jade Filigree Shield", price: "$2,800", spec: "Jade Block Stud // Silver Frame & Ruby" }
            ].map((prod) => (
              <div
                key={prod.index}
                onMouseEnter={() => setActiveCollectionHover(prod.index)}
                onMouseLeave={() => setActiveCollectionHover(-1)}
                className="glass-effect border-[#F5F0E8]/5 hover:border-[#C7A66A]/25 p-6 rounded-2xl transition-all duration-300 group hover:translate-y-[-4px] flex flex-col items-start justify-between min-h-[220px] bg-[#0D0D0D]/65 cursor-pointer"
              >
                <div>
                  <span className="text-[8px] tracking-[0.2em] uppercase text-[#C7A66A]/60 font-mono">
                    CATALOG REF: COU-{700 + prod.index}
                  </span>
                  <h3 className="font-serif text-lg text-white font-medium mt-1 mb-2 group-hover:text-[#C7A66A] transition-colors duration-300 text-left">
                    {prod.name}
                  </h3>
                  <p className="text-[#F5F0E8]/50 text-[10px] tracking-wide font-mono text-left">
                    {prod.spec}
                  </p>
                </div>

                <div className="flex justify-between items-center w-full mt-8 border-t border-[#F5F0E8]/5 pt-4">
                  <span className="font-serif text-[#C7A66A] font-bold text-sm tracking-widest">{prod.price}</span>
                  <button className="text-[8px] tracking-[0.2em] uppercase text-white font-bold flex items-center gap-1 group-hover:text-[#C7A66A] transition-colors">
                    INSPECT <ArrowRight className="w-3 h-3 text-[#C7A66A] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SCENE 6: JEWELRY SHOWCASE (NECKLACE CAMERA ORBIT) */}
      <section id="showcase" className="relative h-screen w-full flex items-center justify-center bg-transparent z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C7A66A] mb-3 font-semibold">
              Product Focus
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#F5F0E8] leading-tight font-light mb-6">
              The Heritage
              <br />
              <span className="gold-gradient-text font-serif italic">Turquoise Disc Earring</span>
            </h2>
            <div className="w-10 h-[1px] bg-[#C7A66A]/40 mb-6" />
            <p className="text-[#F5F0E8]/75 text-xs md:text-sm font-light leading-relaxed tracking-wider mb-6">
              An ancestral statement. Featuring an octagonal silver stud with a square turquoise stone, suspending a large circular silver plate with scalloped edge floral detailing and a vibrant central turquoise cabochon.
            </p>
            
            <div className="flex flex-col gap-2 font-mono text-[9px] text-[#F5F0E8]/85 tracking-widest w-full">
              <div className="flex justify-between border-b border-[#F5F0E8]/5 pb-1.5">
                <span className="text-[#F5F0E8]/40">STUD DETAIL</span>
                <span>Octagonal Silver & Turquoise</span>
              </div>
              <div className="flex justify-between border-b border-[#F5F0E8]/5 pb-1.5">
                <span className="text-[#F5F0E8]/40">DISC DETAIL</span>
                <span>Scalloped Rim Floral Carving</span>
              </div>
              <div className="flex justify-between border-b border-[#F5F0E8]/5 pb-1.5">
                <span className="text-[#F5F0E8]/40">STONE WEIGHT</span>
                <span className="text-[#C7A66A] font-semibold">8.5 Carats Turquoise</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SCENE 7: LUXURY EXPERIENCE (CINEMATIC TYPOGRAPHY) */}
      <section className="relative h-screen w-full flex items-center justify-center bg-transparent z-10 pointer-events-none">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-6"
          >
            <span className="text-[8px] tracking-[0.3em] uppercase text-[#C7A66A] font-bold">
              ATELIER MANIFESTO
            </span>
            <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-[#F5F0E8]/90 leading-relaxed max-w-2xl">
              "Elegance is not about standing out, but about being remembered. It is the elimination of the unnecessary."
            </h2>
            <div className="w-12 h-[1px] bg-[#C7A66A]/30 mt-2" />
            <span className="font-serif text-[10px] tracking-[0.25em] text-[#C7A66A] uppercase font-semibold">
              Heritage Couture Campaign
            </span>
          </motion.div>
        </div>
      </section>

      {/* SCENE 8: TESTIMONIALS */}
      <section ref={testimonialRef} className="relative h-screen w-full flex items-center justify-center bg-transparent z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C7A66A] mb-3 font-semibold">
              Client Testaments
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#F5F0E8] leading-tight font-light mb-6">
              Atelier
              <br />
              Sentiments
            </h2>
            <p className="text-[#F5F0E8]/75 text-xs md:text-sm font-light leading-relaxed tracking-wider">
              Letters from art curators and campaign stylists who appreciate our handcrafted contrast metalwork.
            </p>
          </div>

          <div className="lg:col-span-8 flex flex-col md:grid md:grid-cols-2 gap-4 pointer-events-auto text-left">
            {[
              { author: "Elena Rostova", role: "Creative Director, Geneva", text: "The contrast of the gold peacock on the oxidized silver hexagon is outstanding. The hanging bells sound like soft whispers. An absolute masterpiece." },
              { author: "Julian Mercer", role: "Heritage Campaign Stylist", text: "AURA's focus on traditional filigree, lapis triangle cuts, and jade green structures creates a stunning look. The pieces drape beautifully." },
              { author: "Clara Vincenzi", role: "Milan Gallery Curator", text: "I visited the digital showroom and loved the turquoise disc earrings. The scalloped rims and central turquoise add a perfect antique pop." },
              { author: "Sophia Dumont", role: "Bespoke Jewelry Curator", text: "The oxidized finish has a gorgeous antique look. The handcrafted details are unparalleled. The lapis and jade elements are beautiful." }
            ].map((item, i) => (
              <div
                key={i}
                className="testimonial-card glass-effect hover:border-[#C7A66A]/20 p-6 rounded-xl transition-all duration-300 bg-[#0D0D0D]/65"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, idx) => (
                    <Sparkles key={idx} className="w-2.5 h-2.5 text-[#C7A66A]" />
                  ))}
                </div>
                <p className="text-[#F5F0E8]/75 text-[11px] font-light leading-relaxed tracking-wide mb-4 italic">
                  "{item.text}"
                </p>
                <div className="border-t border-[#F5F0E8]/5 pt-3">
                  <h4 className="text-white text-[10px] tracking-wider uppercase font-bold">{item.author}</h4>
                  <span className="text-[#C7A66A] text-[8px] tracking-wider uppercase font-medium">{item.role}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SCENE 9: FINAL CTA & FOOTER */}
      <section id="appointment" className="relative h-screen w-full flex flex-col justify-between bg-transparent z-10 pt-24 pb-8">
        
        {/* Main CTA Block */}
        <div className="max-w-4xl mx-auto px-6 text-center flex-1 flex flex-col justify-center items-center gap-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] tracking-[0.3em] uppercase text-[#C7A66A] font-semibold"
          >
            Define Your Daily Signature
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.2 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#F5F0E8]"
          >
            Bespoke Styling Consultation
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.4 }}
            className="text-[#F5F0E8]/60 text-xs md:text-sm max-w-md font-light leading-relaxed tracking-wider"
          >
            Begin your styling journey. Consult with our master craftsmen to design a bespoke peacock, lapis, jade, or turquoise heritage piece tailored to your story.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-4 pointer-events-auto"
          >
            <button className="shimmer-btn bg-[#C7A66A] hover:bg-[#B69259] text-[#0D0D0D] px-8 py-4 rounded-full text-[9px] tracking-[0.25em] uppercase font-black flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]">
              Explore Catalog <ArrowRight className="w-3.5 h-3.5 text-[#0D0D0D]" />
            </button>
            <button className="glass-effect hover:bg-[#F5F0E8]/5 border border-[#F5F0E8]/10 text-white px-8 py-4 rounded-full text-[9px] tracking-[0.25em] uppercase font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]">
              Book Appointment <Calendar className="w-3.5 h-3.5 text-[#C7A66A]" />
            </button>
          </motion.div>
        </div>

        {/* Cinematic Luxury Footer */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full border-t border-[#F5F0E8]/5 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-end">
          {/* Info */}
          <div className="flex flex-col items-start gap-1">
            <span className="font-serif font-light text-lg tracking-[0.3em] text-white uppercase select-none">
              A U R A
            </span>
            <p className="text-[#F5F0E8]/40 text-[9px] tracking-widest font-mono uppercase mt-1">
              HAUTE JOAILLERIE © 2026 // MILAN
            </p>
          </div>

          {/* Sourcing */}
          <div className="flex items-center gap-4 text-[9px] tracking-widest uppercase font-mono text-[#F5F0E8]/40 md:justify-center">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-[#C7A66A]" /> Responsible Sourced</span>
            <span className="flex items-center gap-1.5"><Award className="w-3 h-3 text-[#C7A66A]" /> Handcrafted Filigree</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-[9px] tracking-widest uppercase font-mono text-[#F5F0E8]/50 md:justify-end">
            <MapPin className="w-3 h-3 text-[#C7A66A]" />
            <span>Duomo Gallery, Milan, Italy</span>
          </div>
        </div>

      </section>

      {/* =============================================================
          PERSISTENT PAGE CONTROLS (SCROLL COUNTER & PROGRESS DOCK)
          ============================================================= */}

      {/* INTERACTIVE VERTICAL DOT NAVIGATION */}
      <div className="fixed right-6 md:right-16 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 items-end hidden md:flex">
        {zoneNames.map((name, idx) => {
          const isActive = idx === activeZone;
          return (
            <button
              key={idx}
              onClick={() => scrollToZone(idx)}
              className="group flex items-center gap-3.5 focus:outline-hidden cursor-pointer relative"
              aria-label={`Go to ${name}`}
            >
              {/* Tooltip */}
              <span className={`text-[8px] uppercase tracking-[0.25em] font-semibold text-white/80 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none absolute right-6 whitespace-nowrap bg-[#0D0D0D]/95 border border-[#F5F0E8]/10 px-2.5 py-1 rounded-sm shadow-md ${isActive ? "text-[#C7A66A]" : ""}`}>
                {name}
              </span>
              
              {/* Circular Dot Indicator */}
              <div className="w-3 h-3 flex items-center justify-center relative">
                {isActive ? (
                  <>
                    <motion.div
                      layoutId="activeNavigationDotOutline"
                      className="absolute inset-[-4px] rounded-full border border-[#C7A66A]/40"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C7A66A] shadow-[0_0_6px_#C7A66A]" />
                  </>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/70 transition-colors duration-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* PERSISTENT PROGRESS STATS DOCK */}
      <div className="fixed bottom-8 right-8 z-10 flex items-center gap-4 text-[9px] uppercase tracking-[0.2em] text-[#F5F0E8]/50">
        <span>Story Progress</span>
        <div className="w-24 h-[1px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C7A66A] shadow-[0_0_6px_#C7A66A] transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[#C7A66A] font-bold font-mono">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}
