"use client";

import { useState } from "react";
import { Scale, ShieldAlert, Sparkles, BookOpen, ScrollText, ArrowUpRight, Ban } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { motion } from "framer-motion";

export default function TermsOfUsePage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: <BookOpen className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            These terms of use represent a binding legal agreement between you and <strong>VERDANT JEWELS</strong>. By accessing our immersive showroom platform, browsing our catalog, or initiating an order, you confirm that you have read, understood, and agreed to be bound by all of these terms.
          </p>
          <p>
            If you do not agree with all of these terms of use, then you are expressly prohibited from using our site and services, and you must discontinue use immediately.
          </p>
        </>
      ),
    },
    {
      id: "no-refunds",
      title: "2. Absolute No-Refund Policy",
      icon: <Ban className="w-4 h-4 text-red-500" />,
      content: (
        <div className="space-y-4">
          <div className="glass-card bg-red-950/5 border border-red-500/20 rounded-2xl p-6 text-left relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
            <span className="text-[9px] tracking-[0.2em] font-bold text-red-600 uppercase flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Critical Purchase Notice
            </span>
            <p className="font-serif text-sm text-verdant-emerald font-semibold leading-relaxed mb-3">
              Once any product is purchased from VERDANT JEWELS, money will not be refunded under any circumstances. All sales are absolute and final.
            </p>
            <p className="text-xs text-verdant-emerald/70 leading-relaxed font-sans">
              Due to the fluctuating index prices of gold, platinum, and diamonds, alongside the bespoke artisanal labor and craftsmanship hours dedicated to configuring each gem piece, we are unable to process cancellations, returns, or cash refunds.
            </p>
          </div>
          <p className="text-xs md:text-sm text-verdant-emerald/80 leading-relaxed font-sans">
            By checking out and completing your order, you explicitly waive your right to dispute charges based on change-of-mind, design choice, or shipping transit times. We stand behind our jewelry quality, and if structural issues arise, they will be handled strictly via our complimentary resizing or repair assurance, not cash refunds.
          </p>
        </div>
      ),
    },
    {
      id: "accounts",
      title: "3. Accounts & Authentication",
      icon: <Scale className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            You may be required to register an account with us to purchase products or view personalized quotes. You agree to keep your password confidential and will be responsible for all use of your account and credentials.
          </p>
          <p>
            We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
          </p>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property",
      icon: <Sparkles className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            Unless otherwise indicated, the website, the bespoke 3D modeling systems, source code, database structures, designs, text, graphics, and logos are our proprietary property and are protected by international copyright, trademark, and trade dress regulations.
          </p>
          <p>
            No part of our catalogs, custom ring mount templates, or web visualizations may be copied, reproduced, aggregated, republished, uploaded, posted, or publicly displayed for any commercial or competitive purpose without our express prior written permission.
          </p>
        </>
      ),
    },
    {
      id: "governing-law",
      title: "5. Governing Law",
      icon: <ScrollText className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            These terms of use and your use of the website are governed by and construed in accordance with the laws of the State of New York, USA, without regard to its conflict of law principles.
          </p>
          <p>
            Any legal action or proceeding arising out of or related to these terms shall be brought exclusively in the federal or state courts located in New York County, New York.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-verdant-emerald overflow-hidden selection:bg-verdant-gold selection:text-black">
      {/* Navbar */}
      <Navbar />

      {/* Background elements */}
      <div className="absolute top-[25%] left-[-15%] w-[55vw] h-[55vw] bg-radial from-[#C8A96A]/6 to-transparent blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-15%] w-[50vw] h-[50vw] bg-radial from-[#0F4C3A]/4 to-transparent blur-[140px] pointer-events-none z-0" />

      {/* Header Banner */}
      <div className="relative w-full h-[320px] md:h-[360px] overflow-hidden flex items-center justify-center border-b border-verdant-emerald/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Diamonds Exhibit"
            className="w-full h-full object-cover object-center opacity-85 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/10 via-[#FAF7F2]/45 to-[#FAF7F2]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full mx-auto px-6 pt-12 flex justify-center">
          <div className="glass-effect rounded-3xl p-6 md:p-8 max-w-2xl border border-verdant-emerald/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-2">
            <span className="text-[9px] tracking-[0.3em] uppercase text-verdant-gold font-bold flex items-center justify-center gap-1.5">
              <Scale className="w-3 h-3" /> VERDANT REGULATORY CHARTER
            </span>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-wide text-verdant-emerald leading-tight">
              Terms of Use
            </h1>
            <p className="text-[10px] md:text-xs text-verdant-emerald/75 leading-relaxed font-sans max-w-xl mx-auto">
              Please review the terms, obligations, and absolute purchase agreements governing our bespoke showroom transactions.
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
                Agreement Chapters
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
            
            {/* Need Help Box */}
            <div className="glass-card bg-[#0F4C3A]/5 border border-verdant-emerald/10 rounded-2xl p-6 text-left">
              <h4 className="font-serif text-xs tracking-wider font-semibold text-verdant-emerald uppercase mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-verdant-gold" /> Need Assistance?
              </h4>
              <p className="text-[10px] text-verdant-emerald/65 leading-relaxed font-sans mb-3">
                Do you require clarity regarding diamond certification or order custom parameters?
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-1 text-[9px] tracking-widest uppercase font-bold text-verdant-gold hover:text-verdant-emerald transition-colors"
              >
                Client Relations <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-8 space-y-6">
            {sections.map((sec) => (
              <motion.div
                key={sec.id}
                id={sec.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                onViewportEnter={() => setActiveSection(sec.id)}
                className={`glass-card backdrop-blur-md border rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(15,76,58,0.02)] text-left space-y-4 ${
                  sec.id === "no-refunds"
                    ? "bg-red-50/20 border-red-500/20"
                    : "bg-white/60 border-verdant-emerald/10"
                }`}
              >
                <div className="flex items-center gap-3 border-b border-verdant-emerald/5 pb-3 animate-none">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    sec.id === "no-refunds"
                      ? "bg-red-500/5 border-red-500/20"
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
