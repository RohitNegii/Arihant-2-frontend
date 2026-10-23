"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import PolicyTOCMobile from "@/components/global/PolicyTOCMobile";
import PolicyHeaderTabs from "@/components/global/PolicyHeaderTabs";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    {
      id: "introduction",
      number: "01",
      title: "1. Introduction & Scope",
      icon: <FileText className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Welcome to <strong className="font-semibold text-verdant-emerald">GEETEJ VIRAASAT</strong>. We respect your privacy and are committed to protecting your personal data. This privacy policy informs you of how we look after your personal information when you visit our website, explore our bespoke jewelry showrooms, or purchase luxury creations from our jewelry house.
          </p>
          <p className="leading-relaxed">
            By accessing or using our services, you consent to the collection, transfer, processing, and storage of your information as described in this Privacy Policy. All operations are conducted in strict compliance with applicable global privacy standards and consumer data protection laws.
          </p>
        </div>
      ),
    },
    {
      id: "information-collection",
      number: "02",
      title: "2. Information We Collect",
      icon: <Eye className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            We collect personal data to provide a seamless, personalized luxury experience. The categories of information we process include:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {[
              {
                title: "Identity Data",
                desc: "Full name, styling preferences, ring and wrist sizing measurements, and custom engraving inscriptions.",
              },
              {
                title: "Contact Data",
                desc: "Email address, billing address, insured shipping address, and telephone contact details.",
              },
              {
                title: "Transaction Data",
                desc: "Records of completed bespoke commissions, payment verification tokens, invoices, and GIA certificates.",
              },
              {
                title: "Technical Data",
                desc: "Internet protocol (IP) address, browser classification, device telemetry, time zone, and session security cookies.",
              },
            ].map((cat, i) => (
              <div
                key={i}
                className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-3.5 space-y-1 text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-verdant-emerald">
                  <CheckCircle2 className="w-3.5 h-3.5 text-verdant-gold" />
                  {cat.title}
                </div>
                <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-verdant-emerald/70 italic pt-1">
            * We do not collect Special Categories of Personal Data (such as race, religious beliefs, biometrics, or health data).
          </p>
        </div>
      ),
    },
    {
      id: "how-we-use",
      number: "03",
      title: "3. How We Use Your Data",
      icon: <Sparkles className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            We will only use your personal data when authorized by law and strictly for genuine business functions:
          </p>
          <ul className="space-y-2.5">
            {[
              "To register and authenticate you as a bespoke client.",
              "To manufacture, configure, insure, and securely deliver your commissioned fine jewelry.",
              "To safeguard the registry of your GIA and international diamond certification credentials.",
              "To notify you of essential updates regarding order status, collection releases, or private appointments.",
              "To maintain our bespoke customer care archive and deliver tailored jewelry recommendations.",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-left">
                <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold mt-2 shrink-0" />
                <span className="text-verdant-emerald/80 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: "data-security",
      number: "04",
      title: "4. Data Security & Payment Isolation",
      icon: <Lock className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            We implement stringent physical, digital, and procedural safeguards to prevent your personal data from accidental loss, unauthorized access, alteration, or disclosure.
          </p>
          <div className="bg-[#FAF8F5] border border-[#EAE2D8] rounded-xl p-4 space-y-2 text-left">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-verdant-emerald flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-verdant-gold" /> Isolated Vault Architecture
            </h4>
            <p className="text-xs text-verdant-emerald/75 leading-relaxed font-sans">
              All payment transactions are processed directly through 256-bit SSL encrypted PCI-DSS Level 1 compliant gateways. We do not store, retain, or have visibility into raw payment card credentials on our servers.
            </p>
          </div>
          <p className="leading-relaxed">
            Access to client records is strictly restricted to certified personnel and master craft coordinators with an operational need-to-know, all bound by comprehensive non-disclosure and confidentiality obligations.
          </p>
        </div>
      ),
    },
    {
      id: "your-rights",
      number: "05",
      title: "5. Your Legal Rights",
      icon: <Shield className="w-4 h-4 text-verdant-gold" />,
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Under international privacy regulations (including GDPR and CCPA standards), you have well-defined rights regarding your personal information:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: "Right to Access",
                desc: "Request a digital copy of all personal records we maintain about you.",
              },
              {
                title: "Right to Rectification",
                desc: "Update or correct any inaccurate sizing, address, or identity details.",
              },
              {
                title: "Right to Erasure",
                desc: "Request deletion of your data when retention is no longer legally mandated.",
              },
              {
                title: "Right to Object",
                desc: "Opt out of direct marketing, profiling, or non-essential communication.",
              },
            ].map((right, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[#EAE2D8] bg-[#FAF8F5] text-left space-y-1"
              >
                <span className="text-xs font-semibold text-verdant-emerald block">
                  {right.title}
                </span>
                <span className="text-[11px] text-verdant-emerald/70 block leading-relaxed">
                  {right.desc}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-verdant-emerald/75 leading-relaxed pt-2">
            To exercise any of these rights, simply email our compliance desk at{" "}
            <a
              href="mailto:care@geetejviraasat.com"
              className="text-verdant-emerald font-semibold underline underline-offset-4 hover:text-verdant-gold transition-colors"
            >
              care@geetejviraasat.com
            </a>{" "}
            or use our concierge inquiry form.
          </p>
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
        currentPolicy="privacy-policy"
        title="Privacy & Data Protection"
        subtitle="Learn how we safeguard your personal data, secure GIA diamond certifications, and encrypt all boutique client records."
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
                  <CrestMark size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-verdant-emerald">
                    Privacy Concierge
                  </h4>
                  <p className="text-[10px] text-verdant-emerald/60">
                    Questions about data records?
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-verdant-emerald/75 leading-relaxed font-sans">
                Our client desk assists with certification lookups, data access requests, and authentication inquiries.
              </p>

              <div className="pt-1">
                <a
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-verdant-emerald text-white text-[11px] font-semibold tracking-wider hover:bg-[#2C1820] transition-colors"
                >
                  Contact Desk <ArrowUpRight className="w-3.5 h-3.5 text-verdant-gold" />
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
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-verdant-emerald/70">
                    Official Policy Document &bull; Section By Section
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-verdant-emerald/60">
                  <span>Version 2.4</span>
                  <span>&bull;</span>
                  <span>Active Status</span>
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
                  <p>Certified Document &bull; Last Revised October 2026</p>
                  <p className="text-verdant-emerald/50">All trademarks &amp; certifications registered.</p>
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
