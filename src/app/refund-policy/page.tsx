"use client";

import { useState } from "react";
import {
  ShieldCheck,
  HelpCircle,
  Scale,
  Info,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Wrench,
  Gem,
} from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import PolicyTOCMobile from "@/components/global/PolicyTOCMobile";
import PolicyHeaderTabs from "@/components/global/PolicyHeaderTabs";
import { motion } from "framer-motion";

export default function RefundPolicyPage() {
  const [activeSection, setActiveSection] = useState("policy");

  const sections = [
    {
      id: "policy",
      number: "01",
      title: "1. Policy Overview & Absolute No-Refund Notice",
      icon: <Ban className="w-4 h-4 text-amber-600" />,
      content: (
        <div className="space-y-4">
          {/* Prominent High-Contrast Callout Card */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 sm:p-6 text-left relative overflow-hidden shadow-2xs">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-600/10 border border-amber-600/20 text-[10px] tracking-[0.2em] font-bold text-amber-800 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-700" />
                Final Transaction Agreement
              </span>
            </div>

            <h3 className="font-serif text-base sm:text-lg text-verdant-emerald font-semibold leading-snug mb-2.5">
              Once any purchase is completed, money will not be refunded under any circumstances.
            </h3>

            <p className="text-xs sm:text-[13px] text-verdant-emerald/80 leading-relaxed font-sans mb-3">
              Every purchase of a <strong className="font-semibold text-verdant-emerald">GEETEJ VIRAASAT</strong> creation represents an individual, custom-allocated acquisition involving high-purity precious metals, hand-selected diamonds, and custom workshop hours. Because of this, all sales are strictly final, and we do not issue monetary refunds, cash returns, or card chargebacks.
            </p>

            <div className="text-[11px] text-amber-900/80 bg-amber-100/50 rounded-xl p-3 border border-amber-200/60 leading-relaxed">
              We urge all clients to carefully review their specifications, finger sizing guidelines, diamond classifications (color/clarity/cut), and personalized engraving preferences prior to confirming payment.
            </div>
          </div>

          <p className="text-xs sm:text-sm text-verdant-emerald/80 leading-relaxed font-sans pt-1">
            By authorizing payment, the buyer expressly acknowledges that fine jewelry made or adjusted for their order cannot be returned or refunded.
          </p>
        </div>
      ),
    },
    {
      id: "why-final",
      number: "02",
      title: "2. Why All Sales Are Final",
      icon: <Scale className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Due to the rare nature of bespoke fine jewelry and immediate capital allocations, transactions cannot be reversed once initiated:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {[
              {
                icon: <Gem className="w-4 h-4 text-verdant-gold" />,
                title: "Bespoke Tailoring & Engraving",
                desc: "Rings, pendants, and bracelets are adjusted or mounted specifically to your exact size specifications and personalized inscriptions. A custom piece cannot be restocked.",
              },
              {
                icon: <Scale className="w-4 h-4 text-verdant-gold" />,
                title: "Immediate Metal & Gem Lock-in",
                desc: "Upon receipt of payment, our treasury immediately secures the raw components (platinum, 18k solid gold alloy, and certified diamond gems) at prevailing market commodity indices.",
              },
              {
                icon: <Wrench className="w-4 h-4 text-verdant-gold" />,
                title: "Master Artisanal Allocation",
                desc: "Handcrafting slots by master jewelers are scheduled immediately upon order confirmation. Compensation and bench hours for artisan craftsmanship are locked instantly.",
              },
            ].map((reason, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-4 text-left space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center">
                  {reason.icon}
                </div>
                <h4 className="text-xs font-semibold text-verdant-emerald">
                  {reason.title}
                </h4>
                <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                  {reason.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "guarantees",
      number: "03",
      title: "3. Structural & Sizing Guarantees",
      icon: <ShieldCheck className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            While we maintain an unwavering no-refund protocol, we stand firmly behind the structural integrity and artisanal quality of every piece. Every creation is backed by:
          </p>

          <div className="space-y-3">
            {[
              {
                title: "Complimentary Ring Resizing",
                tag: "Within 30 Days",
                desc: "We provide one complimentary resizing adjustment for rings within 30 days of delivery (applicable to resizable mountings; full-eternity diamond bands are excluded due to structural stone settings).",
              },
              {
                title: "Lifetime Manufacturing Warranty",
                tag: "Craft Guarantee",
                desc: "If any jewelry piece exhibits structural defects resulting from workshop fabrication or raw metal casting, we will repair or service the item free of charge. This guarantee excludes regular wear and tear, surface scratches, or trauma caused by external impact.",
              },
              {
                title: "Lifetime Boutique Maintenance",
                tag: "Complimentary Care",
                desc: "Enjoy lifetime access to complimentary professional ultrasonic cleaning, steam-cleaning, and prong security audits at any GEETEJ VIRAASAT flagship showroom.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 text-left"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-verdant-emerald">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans pl-6">
                    {item.desc}
                  </p>
                </div>
                <span className="self-start sm:self-center px-2 py-0.5 rounded-full bg-verdant-gold/15 text-[10px] font-mono font-medium text-verdant-emerald border border-verdant-gold/30 shrink-0">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>

          <div className="text-xs text-verdant-emerald/70 bg-verdant-emerald/5 rounded-xl p-3 border border-verdant-emerald/10">
            <strong>Logistics Notice:</strong> Shipping and insurance expenses for resizing or warranty evaluations remain the responsibility of the client.
          </div>
        </div>
      ),
    },
    {
      id: "order-integrity",
      number: "04",
      title: "4. Quality Audits & Insured Transport",
      icon: <Info className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Every jewelry piece leaves our workshop only after a double-grade physical quality control audit. We examine clarity parameters under 10x magnification and cross-reference GIA registration numbers directly against corresponding certificates.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-verdant-emerald">
                <Truck className="w-4 h-4 text-verdant-gold" /> Armored Transport &amp; Signature
              </div>
              <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                All parcels are dispatched via specialized armored courier services, fully insured up to their declared value, and require an adult signature upon delivery.
              </p>
            </div>
            <div className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-verdant-emerald">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Transit Damage Claims (24 Hours)
              </div>
              <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                In the rare event of transit damage, report it within 24 hours of delivery with photographic evidence, and our team will initiate an expedited insurance replacement claim.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-verdant-cream text-verdant-emerald selection:bg-verdant-gold selection:text-black flex flex-col justify-between">
      {/* Navbar */}
      <Navbar />

      {/* Header with Switcher Tabs */}
      <PolicyHeaderTabs
        currentPolicy="refund-policy"
        title="Refund & Cancellation Policy"
        subtitle="Review our strict final sale parameters, bespoke metal lock-in guidelines, and lifetime warranty coverage."
        lastUpdated="October 2026"
      />

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Sticky Sidebar (Desktop) */}
          <aside className="lg:col-span-4 xl:col-span-3 sticky top-28 space-y-4 hidden lg:block text-left">
            {/* Table of Contents Card */}
            <div className="bg-white rounded-2xl border border-[#EAE2D8] p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8] mb-3">
                <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-verdant-emerald/60">
                  Contents
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-verdant-emerald/5 text-verdant-emerald/70 border border-[#EAE2D8]">
                  {sections.length} Sections
                </span>
              </div>

              <nav className="flex flex-col gap-1">
                {sections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveSection(sec.id);
                        const el = document.getElementById(sec.id);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs tracking-wide text-left transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-verdant-emerald text-white font-medium shadow-2xs"
                          : "text-verdant-emerald/70 hover:text-verdant-emerald hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-verdant-emerald/5 text-verdant-emerald/60"
                        }`}
                      >
                        {sec.number}
                      </span>
                      <span className="truncate">{sec.title.replace(/^\d+\.\s*/, "")}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Assistance Card */}
            <div className="bg-white rounded-2xl border border-[#EAE2D8] p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-verdant-gold" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-verdant-emerald">
                    Sizing Questions?
                  </h4>
                  <p className="text-[10px] text-verdant-emerald/60">
                    Verify sizing before you order
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                Our bespoke specialists can guide you through precise ring measurements and diamond classifications.
              </p>

              <div className="pt-1">
                <a
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-verdant-emerald text-white text-[11px] font-semibold tracking-wider hover:bg-[#2C1820] transition-colors"
                >
                  Client Concierge <ArrowUpRight className="w-3.5 h-3.5 text-verdant-gold" />
                </a>
              </div>
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <main className="lg:col-span-8 xl:col-span-9">
            {/* Mobile Table of Contents Accordion */}
            <PolicyTOCMobile
              sections={sections}
              activeSection={activeSection}
              onSelect={setActiveSection}
            />

            {/* Unified Policy Document */}
            <div className="bg-white rounded-2xl border border-[#EAE2D8] shadow-xs overflow-hidden">
              {/* Document Header Band */}
              <div className="bg-[#FAF8F5] border-b border-[#EAE2D8] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-verdant-emerald/70">
                    Bespoke Transaction Charter &bull; All Sales Final
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-verdant-emerald/60">
                  <span>Policy ID: GV-REF-2026</span>
                  <span>&bull;</span>
                  <span>Certified</span>
                </div>
              </div>

              {/* Document Sections */}
              <div className="divide-y divide-[#EAE2D8]/70">
                {sections.map((sec) => (
                  <motion.section
                    key={sec.id}
                    id={sec.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35 }}
                    onViewportEnter={() => setActiveSection(sec.id)}
                    className="p-6 sm:p-8 md:p-9 text-left space-y-4 scroll-mt-28"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center shrink-0">
                        {sec.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono tracking-wider font-bold uppercase text-verdant-gold block">
                          Section {sec.number}
                        </span>
                        <h2 className="font-serif text-lg sm:text-xl font-normal text-verdant-emerald tracking-wide">
                          {sec.title}
                        </h2>
                      </div>
                    </div>

                    <div className="text-[13px] sm:text-sm text-verdant-emerald/80 font-sans leading-relaxed pt-1">
                      {sec.content}
                    </div>
                  </motion.section>
                ))}
              </div>

              {/* Document Signoff Footer */}
              <div className="bg-[#FAF8F5] border-t border-[#EAE2D8] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-verdant-emerald/60">
                <div className="flex items-center gap-2">
                  <CrestMark size={20} />
                  <span className="font-serif tracking-wider text-verdant-emerald text-xs">
                    GEETEJ VIRAASAT COMPLIANCE &amp; LEGAL
                  </span>
                </div>
                <div className="text-[11px] sm:text-right">
                  <p>Certified Final Sale Protocol &bull; Binding on Purchase</p>
                  <p className="text-verdant-emerald/50">All rights reserved &bull; 2001&ndash;2026</p>
                </div>
              </div>
            </div>
          </main>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
