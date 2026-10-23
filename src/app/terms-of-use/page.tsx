"use client";

import { useState } from "react";
import {
  Scale,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ScrollText,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  Lock,
  Building2,
} from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import PolicyTOCMobile from "@/components/global/PolicyTOCMobile";
import PolicyHeaderTabs from "@/components/global/PolicyHeaderTabs";
import { motion } from "framer-motion";

export default function TermsOfUsePage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const sections = [
    {
      id: "acceptance",
      number: "01",
      title: "1. Acceptance of Terms & Legal Scope",
      icon: <BookOpen className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and <strong className="font-semibold text-verdant-emerald">GEETEJ VIRAASAT</strong>. By accessing our immersive showroom platform, browsing our collections, or initiating a bespoke order, you confirm that you have read, understood, and agreed to be bound by all of these terms.
          </p>
          <div className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-4 text-left space-y-1.5">
            <h4 className="text-xs font-semibold text-verdant-emerald">
              Mandatory Discontinuation
            </h4>
            <p className="text-xs text-verdant-emerald/75 leading-relaxed font-sans">
              If you do not agree with all of these terms of use, then you are expressly prohibited from using our site and services, and you must discontinue browsing and transaction activities immediately.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "no-refunds",
      number: "02",
      title: "2. Absolute No-Refund & Final Sale Policy",
      icon: <Ban className="w-4 h-4 text-amber-600" />,
      content: (
        <div className="space-y-4">
          {/* Prominent Callout Card */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 sm:p-6 text-left relative overflow-hidden shadow-2xs">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-600/10 border border-amber-600/20 text-[10px] tracking-[0.2em] font-bold text-amber-800 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                Critical Purchase Notice
              </span>
            </div>

            <h3 className="font-serif text-base sm:text-lg text-verdant-emerald font-semibold leading-snug mb-2.5">
              Once any product is purchased from GEETEJ VIRAASAT, money will not be refunded under any circumstances. All sales are absolute and final.
            </h3>

            <p className="text-xs sm:text-[13px] text-verdant-emerald/80 leading-relaxed font-sans mb-3">
              Due to the fluctuating index prices of gold, platinum, and diamonds, alongside bespoke artisanal labor and craftsmanship hours dedicated to configuring each gem piece, we are unable to process cancellations, returns, or cash refunds.
            </p>

            <div className="text-[11px] text-amber-900/80 bg-amber-100/50 rounded-xl p-3 border border-amber-200/60 leading-relaxed">
              By checking out and completing your order, you explicitly waive any right to dispute charges based on change-of-mind, design choice, or shipping transit times. Structural defects are resolved strictly via complimentary resizing or manufacturing repair guarantees, never cash refunds.
            </div>
          </div>

          <p className="text-xs sm:text-sm text-verdant-emerald/80 leading-relaxed font-sans pt-1">
            Clients are expected to review diamond certification dossiers, metal hallmarks, and sizing guides prior to submitting their final order authorization.
          </p>
        </div>
      ),
    },
    {
      id: "accounts",
      number: "03",
      title: "3. Accounts & Client Authentication",
      icon: <Scale className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            You may be required to register an account with us to purchase bespoke jewelry or access personalized price quotes. You agree to keep your password confidential and will be held responsible for all activity conducted under your credentials.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-3.5 text-left space-y-1">
              <span className="text-xs font-semibold text-verdant-emerald flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accurate Information
              </span>
              <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                You warrant that all registration details submitted are truthful, current, and complete.
              </p>
            </div>
            <div className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-3.5 text-left space-y-1">
              <span className="text-xs font-semibold text-verdant-emerald flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-verdant-gold" /> Account Security
              </span>
              <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                We reserve the right to suspend or reclaim accounts created under fictitious identity or violating trademark rights.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      number: "04",
      title: "4. Intellectual Property Rights",
      icon: <Sparkles className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Unless otherwise indicated, the website, the bespoke 3D modeling systems, source code, database structures, designs, text, graphics, and logos are our proprietary intellectual property and are protected by international copyright, trademark, and trade dress regulations.
          </p>
          <div className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-4 text-left space-y-2">
            <h4 className="text-xs font-semibold text-verdant-emerald flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-verdant-gold" /> Exclusive Atelier Designs
            </h4>
            <p className="text-xs text-verdant-emerald/75 leading-relaxed font-sans">
              No part of our catalogs, custom ring mount templates, or web visualizations may be copied, reproduced, aggregated, republished, uploaded, posted, or publicly displayed for any commercial or competitive purpose without our express prior written permission.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "governing-law",
      number: "05",
      title: "5. Governing Law & Dispute Resolution",
      icon: <ScrollText className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            These terms of use and your use of the website are governed by and construed in accordance with the laws of the State of New York, USA, without regard to its conflict of law principles.
          </p>
          <div className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-verdant-emerald">
              <Building2 className="w-4 h-4 text-verdant-gold" /> Exclusive Legal Jurisdiction
            </div>
            <p className="text-xs text-verdant-emerald/75 leading-relaxed font-sans">
              Any legal action or proceeding arising out of or related to these terms shall be brought exclusively in the federal or state courts located in New York County, New York, and all parties consent to personal jurisdiction in such courts.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-verdant-cream text-verdant-emerald selection:bg-verdant-gold selection:text-black">
      {/* Navbar */}
      <Navbar />

      {/* Header with Switcher Tabs */}
      <PolicyHeaderTabs
        currentPolicy="terms-of-use"
        title="Terms of Use & Agreement"
        subtitle="Review the binding legal terms, intellectual property protections, and transactional obligations governing our bespoke atelier services."
        lastUpdated="October 2026"
      />

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
                  <CrestMark size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-verdant-emerald">
                    Legal Counsel Desk
                  </h4>
                  <p className="text-[10px] text-verdant-emerald/60">
                    Questions on charter terms?
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                Our legal team assists with intellectual property licensing, commercial terms, and compliance matters.
              </p>

              <div className="pt-1">
                <a
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-verdant-emerald text-white text-[11px] font-semibold tracking-wider hover:bg-[#2C1820] transition-colors"
                >
                  Contact Counsel <ArrowUpRight className="w-3.5 h-3.5 text-verdant-gold" />
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

            {/* Unified Luxury Document Dossier */}
            <div className="bg-white rounded-2xl border border-[#EAE2D8] shadow-xs overflow-hidden">
              {/* Document Header Band */}
              <div className="bg-[#FAF8F5] border-b border-[#EAE2D8] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-verdant-gold" />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-verdant-emerald/70">
                    Official Regulatory Charter &bull; Binding Terms
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-verdant-emerald/60">
                  <span>Charter Ref: GV-TOU-2026</span>
                  <span>&bull;</span>
                  <span>Enforceable</span>
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
                    GEETEJ VIRAASAT ATELIER COMPLIANCE
                  </span>
                </div>
                <div className="text-[11px] sm:text-right">
                  <p>Certified Terms of Use &bull; Enforceable Under Law</p>
                  <p className="text-verdant-emerald/50">New York Jurisdiction &bull; 2001&ndash;2026</p>
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
