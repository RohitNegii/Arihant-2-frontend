"use client";

import { useState } from "react";
import { Shield, Lock, Eye, FileText, Sparkles, ArrowUpRight } from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import PolicyTOCMobile from "@/components/global/PolicyTOCMobile";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: <FileText className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            Welcome to <strong>GEETEJVIRAASAT</strong>. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website, browse our bespoke jewelry showrooms, or purchase our luxury articles.
          </p>
          <p>
            By accessing or using our services, you consent to the collection, transfer, manipulation, storage, disclosure, and other uses of your information as described in this Privacy Policy.
          </p>
        </>
      ),
    },
    {
      id: "information-collection",
      title: "2. Information We Collect",
      icon: <Eye className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            We collect personal data to provide a tailored luxury experience. The categories of information we collect include:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><strong>Identity Data:</strong> First name, last name, and styling preferences.</li>
            <li><strong>Contact Data:</strong> Email address, billing address, shipping address, and telephone number.</li>
            <li><strong>Transaction Data:</strong> Details about payments to and from you, and other details of products you have purchased from us.</li>
            <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting and location, and operating system.</li>
          </ul>
          <p>
            We do not collect any Special Categories of Personal Data (such as details about your race, religious beliefs, or health information).
          </p>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Data",
      icon: <Sparkles className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we use your data in the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To register you as a new client and verify authentication details.</li>
            <li>To process and deliver your order, including managing payments, fees, and charges.</li>
            <li>To manage our relationship with you, including notifying you about updates to our terms, collections, or GIA-certified reserve lists.</li>
            <li>To deliver relevant website content and product recommendations based on your preferences.</li>
          </ul>
        </>
      ),
    },
    {
      id: "data-security",
      title: "4. Data Security & Protection",
      icon: <Lock className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. 
          </p>
          <p className="mb-4">
            All transaction databases are isolated, and raw payment processing occurs strictly via encrypted payment gateways. We do not store credit card credentials on our servers.
          </p>
          <p>
            In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
          </p>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "5. Your Legal Rights",
      icon: <Shield className="w-4 h-4 text-verdant-gold" />,
      content: (
        <>
          <p className="mb-4">
            Under certain circumstances, you have rights under data protection laws in relation to your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Request access:</strong> Receive a copy of the personal data we hold about you.</li>
            <li><strong>Request correction:</strong> Ask us to correct any incomplete or inaccurate data we hold about you.</li>
            <li><strong>Request erasure:</strong> Ask us to delete personal data where there is no good reason for us continuing to process it.</li>
            <li><strong>Object to processing:</strong> Object to processing of your personal data where we are relying on a legitimate interest.</li>
          </ul>
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
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Jewelry Studio"
            className="w-full h-full object-cover object-center opacity-85 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-verdant-cream/10 via-verdant-cream/45 to-verdant-cream" />
        </div>

        <div className="relative z-10 max-w-4xl w-full mx-auto px-6 pt-12 flex justify-center">
          <div className="glass-effect rounded-3xl p-6 md:p-8 max-w-2xl border border-verdant-emerald/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-2">
            <span className="text-[9px] tracking-[0.3em] uppercase text-verdant-gold font-bold flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" /> GEETEJVIRAASAT TRUST PROTOCOL
            </span>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-wide text-verdant-emerald leading-tight">
              Privacy Policy
            </h1>
            <p className="text-[10px] md:text-xs text-verdant-emerald/75 leading-relaxed font-sans max-w-xl mx-auto">
              Learn how we safeguard your information, secure GIA certifications, and process encrypted bespoke transaction details.
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
                Policy Sections
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
            <div className="glass-card bg-verdant-emerald/5 border border-verdant-emerald/10 rounded-2xl p-6 text-left">
              <h4 className="font-serif text-xs tracking-wider font-semibold text-verdant-emerald uppercase mb-1 flex items-center gap-1.5">
                <CrestMark size={18} /> Need Assistance?
              </h4>
              <p className="text-[10px] text-verdant-emerald/65 leading-relaxed font-sans mb-3">
                If you have questions regarding data retention or GIA credentials, please contact our legal desk.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-1 text-[9px] tracking-widest uppercase font-bold text-verdant-gold hover:text-verdant-emerald transition-colors"
              >
                Legal Concierge <ArrowUpRight className="w-3 h-3" />
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
                className="glass-card bg-white/60 backdrop-blur-md border border-verdant-emerald/10 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.02)] text-left space-y-4"
              >
                <div className="flex items-center gap-3 border-b border-verdant-emerald/5 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center shrink-0">
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
