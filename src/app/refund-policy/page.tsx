"use client";

import { useState } from "react";
import { ShieldCheck, HelpCircle, Sparkles, Scale, Info, ArrowUpRight, Ban } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import PolicyTOCMobile from "@/components/global/PolicyTOCMobile";
import { motion } from "framer-motion";

export default function RefundPolicyPage() {
  const [activeSection, setActiveSection] = useState("policy");

  const sections = [
    {
      id: "policy",
      title: "1. Policy Overview",
      icon: <Ban className="w-4 h-4 text-verdant-danger" />,
      content: (
        <div className="space-y-4">
          <div className="glass-card bg-verdant-gold/5 border border-verdant-gold/30 rounded-2xl p-6 text-left relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-verdant-gold/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-[9px] tracking-[0.2em] font-bold text-verdant-gold uppercase flex items-center gap-1.5 mb-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-verdant-gold" /> Final Transaction Agreement
            </span>
            <p className="font-serif text-base text-verdant-emerald font-semibold leading-relaxed mb-3">
              Once any purchase is completed, money will not be refunded under any circumstances.
            </p>
            <p className="text-xs text-verdant-emerald/70 leading-relaxed font-sans">
              Every purchase of a GEETEJ VIRAASAT creation represents a singular transaction involving high-purity precious metals, hand-selected diamonds, and custom workshop hours. Because of this, all sales are strictly final, and we do not issue monetary refunds, cash returns, or card chargebacks.
            </p>
          </div>
          <p className="text-xs md:text-sm text-verdant-emerald/80 leading-relaxed font-sans">
            We urge all buyers to double-check their specifications, finger sizing guidelines, diamond classifications (color/clarity/cut), and engraving preferences before submitting their final transaction token.
          </p>
        </div>
      ),
    },
    {
      id: "why-final",
      title: "2. Why All Sales Are Final",
      icon: <Scale className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            Due to the exceptional nature of high-end jewelry and custom order allocations, we cannot reverse transaction processes for the following reasons:
          </p>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Bespoke Tailoring & Engraving:</strong> The majority of our rings and pendants are adjusted or fully structured based on your size specifications and personalized inscriptions. A custom piece cannot be restocked.
            </li>
            <li>
              <strong>Immediate Metal & Gem Lock-in:</strong> Upon receipt of payment, our treasury department immediately secures the raw components (platinum, 18k gold alloy, and certified diamond gems) at prevailing market commodity indices.
            </li>
            <li>
              <strong>Master Artisanal Allocation:</strong> Handcrafting slots by our master jewelers are scheduled immediately upon order confirmation. Compensation for artisan craft hours is locked instantly.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "guarantees",
      title: "3. Structural & Sizing Guarantees",
      icon: <ShieldCheck className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            While we maintain a strict no-refund protocol, we stand behind the outstanding quality and design integrity of our jewelry. To provide peace of mind, every purchase is backed by:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><strong>Complimentary Resizing:</strong> We provide one free resizing support adjustment for rings within 30 days of receiving your item (applicable to resizable designs; exclusions apply to eternity bands).</li>
            <li><strong>Manufacturing Warranty:</strong> If any diamond ornament shows structural damage due to a raw manufacturing defect, we will repair or replace the element free of charge. This does not cover daily wear, scratches, or cosmetic marks.</li>
            <li><strong>Lifetime Maintenance:</strong> Access to complimentary professional inspection and steam-cleaning at any of our flagship boutiques.</li>
          </ul>
          <p>
            Please note that shipping expenses for resizing or warranty verification remain the responsibility of the client.
          </p>
        </>
      ),
    },
    {
      id: "order-integrity",
      title: "4. Quality Audits & Shipping",
      icon: <Info className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            Every jewelry piece leaves our atelier only after a double-grade physical quality control audit. We verify clarity parameters under 10x magnification and cross-reference GIA registration numbers directly against corresponding dossiers.
          </p>
          <p>
            All parcels are shipped via armored transport couriers, fully insured, and require a direct signature upon receipt. In the highly unlikely event that an item is damaged during transit, notify us within 24 hours of delivery with photographic evidence, and we will initiate an expedited insurance replacement claim.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-verdant-cream text-verdant-emerald selection:bg-verdant-gold selection:text-black">
      {/* Navbar */}
      <Navbar />

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[25%] left-[-15%] w-[55vw] h-[55vw] bg-radial from-verdant-gold/6 to-transparent blur-[130px] pointer-events-none z-0" />
        <div className="absolute bottom-[20%] right-[-15%] w-[50vw] h-[50vw] bg-radial from-verdant-emerald/4 to-transparent blur-[140px] pointer-events-none z-0" />
      </div>

      {/* Header Banner */}
      <div className="relative w-full h-[320px] md:h-[360px] overflow-hidden flex items-center justify-center border-b border-verdant-emerald/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Jewelry Craftsmanship"
            className="w-full h-full object-cover object-center opacity-85 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-verdant-cream/10 via-verdant-cream/45 to-verdant-cream" />
        </div>

        <div className="relative z-10 max-w-4xl w-full mx-auto px-6 pt-12 flex justify-center">
          <div className="glass-effect rounded-3xl p-6 md:p-8 max-w-2xl border border-verdant-emerald/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-2">
            <span className="text-[9px] tracking-[0.3em] uppercase text-verdant-gold font-bold flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> GEETEJ VIRAASAT TRANSACTION POLICY
            </span>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-wide text-verdant-emerald leading-tight">
              Refund & Return Policy
            </h1>
            <p className="text-[10px] md:text-xs text-verdant-emerald/75 leading-relaxed font-sans max-w-xl mx-auto">
              Please review our final sale guidelines, bespoke commissioning terms, and structural warranty parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left Sidebar navigation */}
          <div className="lg:col-span-4 sticky top-28 space-y-4 hidden lg:block">
            <div className="glass-card bg-white/50 backdrop-blur-md border border-verdant-emerald/10 rounded-2xl p-6 shadow-xs text-left">
              <h3 className="font-serif text-sm tracking-wider font-semibold text-verdant-emerald uppercase mb-4">
                Policy Chapters
              </h3>
              <div className="flex flex-col gap-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      const el = document.getElementById(sec.id);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-wider transition-all duration-300 cursor-pointer ${
                      activeSection === sec.id
                        ? "bg-verdant-emerald/10 text-verdant-emerald font-semibold border-l-2 border-verdant-gold"
                        : "text-verdant-emerald/65 hover:text-verdant-emerald hover:bg-verdant-emerald/5"
                    }`}
                  >
                    {sec.icon}
                    <span>{sec.title.substring(3)}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Help desk Box */}
            <div className="glass-card bg-verdant-emerald/5 border border-verdant-emerald/10 rounded-2xl p-6 text-left">
              <h4 className="font-serif text-xs tracking-wider font-semibold text-verdant-emerald uppercase mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-verdant-gold" /> Questions?
              </h4>
              <p className="text-[10px] text-verdant-emerald/65 leading-relaxed font-sans mb-3">
                Do you have inquiries about ring sizing dimensions or metal certifications before purchasing?
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-1 text-[9px] tracking-widest uppercase font-bold text-verdant-gold hover:text-verdant-emerald transition-colors"
              >
                Client Concierge <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-8">
            <PolicyTOCMobile
              sections={sections}
              activeSection={activeSection}
              onSelect={setActiveSection}
            />

            <div className="space-y-6">
            {sections.map((sec) => (
              <motion.div
                key={sec.id}
                id={sec.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                onViewportEnter={() => setActiveSection(sec.id)}
                className={`glass-card backdrop-blur-md border rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.02)] text-left space-y-4 ${
                  sec.id === "policy"
                    ? "bg-verdant-gold/5 border-verdant-gold/20"
                    : "bg-white/60 border-verdant-emerald/10"
                }`}
              >
                <div className="flex items-center gap-3 border-b border-verdant-emerald/5 pb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    sec.id === "policy"
                      ? "bg-verdant-gold/5 border-verdant-gold/25"
                      : "bg-verdant-emerald/5 border-verdant-emerald/10"
                  }`}>
                    {sec.icon}
                  </div>
                  <h2 className="font-serif text-lg tracking-wide font-light text-verdant-emerald">
                    {sec.title}
                  </h2>
                </div>
                <div className="text-xs md:text-sm text-verdant-emerald/80 leading-relaxed font-sans">
                  {sec.content}
                </div>
              </motion.div>
            ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
