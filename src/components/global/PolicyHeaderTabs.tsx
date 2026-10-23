"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Shield, FileText, Ban, Scale } from "lucide-react";
import Breadcrumb from "@/components/global/Breadcrumb";

export interface PolicyHighlight {
  icon: ReactNode;
  title: string;
  description: string;
}

interface PolicyHeaderTabsProps {
  currentPolicy: "privacy-policy" | "refund-policy" | "terms-of-use";
  title: string;
  subtitle: string;
  lastUpdated?: string;
  highlights?: PolicyHighlight[];
}

const POLICY_TABS = [
  {
    key: "privacy-policy",
    name: "Privacy Policy",
    href: "/privacy-policy",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  {
    key: "refund-policy",
    name: "Refund Policy",
    href: "/refund-policy",
    icon: <Ban className="w-3.5 h-3.5" />,
  },
  {
    key: "terms-of-use",
    name: "Terms of Use",
    href: "/terms-of-use",
    icon: <Scale className="w-3.5 h-3.5" />,
  },
];

export default function PolicyHeaderTabs({
  currentPolicy,
  title,
  subtitle,
  lastUpdated = "October 2026",
  highlights = [],
}: PolicyHeaderTabsProps) {
  const currentTab = POLICY_TABS.find((t) => t.key === currentPolicy);

  return (
    <div className="relative border-b border-[#EAE2D8] bg-gradient-to-b from-[#FAF8F5] via-[#F6F1EB] to-verdant-cream/50 pt-6 pb-6 md:pt-8 md:pb-7 overflow-hidden">
      {/* Subtle Ambient Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[36vw] h-[36vw] bg-radial from-verdant-gold/8 to-transparent blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[36vw] h-[36vw] bg-radial from-verdant-emerald/5 to-transparent blur-[110px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-2">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Legal & Compliance", href: "/terms-of-use" },
              { label: currentTab?.name || title },
            ]}
          />
        </div>

        {/* Header Content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-5 border-b border-[#EAE2D8]/70">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-verdant-emerald/5 border border-verdant-emerald/10 text-[10px] tracking-[0.22em] uppercase font-bold text-verdant-emerald/80">
              <Shield className="w-3 h-3 text-verdant-gold" />
              <span>GEETEJ VIRAASAT &bull; Legal Directory</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-verdant-emerald tracking-tight">
              {title}
            </h1>

            <p className="text-xs sm:text-sm text-verdant-emerald/75 font-sans leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Metadata pill */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-end text-[11px] text-verdant-emerald/65 bg-white/70 border border-[#EAE2D8] rounded-xl px-3.5 py-2 shadow-2xs backdrop-blur-xs">
            <span className="font-medium">Last Revised:</span>
            <span className="font-semibold text-verdant-emerald">{lastUpdated}</span>
            <span className="text-verdant-gold">&bull;</span>
            <span className="text-verdant-emerald/70">Binding Charter</span>
          </div>
        </div>

        {/* Tab Navigation Switcher between all 3 Policies */}
        <div className="pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-verdant-emerald/60 text-left">
              Browse Policies:
            </div>

            <div className="inline-flex flex-wrap items-center gap-2">
              {POLICY_TABS.map((tab) => {
                const isActive = tab.key === currentPolicy;
                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs tracking-wider transition-all duration-200 ${
                      isActive
                        ? "bg-verdant-emerald text-white font-semibold shadow-xs"
                        : "bg-white/90 text-verdant-emerald/70 hover:text-verdant-emerald hover:bg-white border border-[#EAE2D8] hover:border-verdant-gold/40 shadow-2xs"
                    }`}
                  >
                    <span className={isActive ? "text-verdant-gold" : "text-verdant-emerald/60"}>
                      {tab.icon}
                    </span>
                    <span>{tab.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Optional Highlights Strip */}
        {highlights.length > 0 && (
          <div className="mt-5 pt-5 border-t border-[#EAE2D8]/60 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-left">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-xs rounded-xl border border-[#EAE2D8] p-3.5 sm:p-4 shadow-2xs flex items-start gap-3 hover:border-verdant-gold/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center shrink-0 text-verdant-gold">
                  {item.icon}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-semibold text-verdant-emerald tracking-wide">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-verdant-emerald/70 leading-relaxed font-sans line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
