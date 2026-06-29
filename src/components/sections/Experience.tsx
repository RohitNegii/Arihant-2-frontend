"use client";

import { motion } from "framer-motion";
import { Award, Shield, Globe, Sparkles } from "lucide-react";

export default function Experience() {
  const experiences = [
    {
      icon: <Award className="w-8 h-8 text-verdant-gold" />,
      title: "Hallmarked Gold",
      desc: "Our creations are crafted exclusively from refined 18K and 24K gold, stamped with certifications verifying metal purity.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-verdant-gold" />,
      title: "Conflict-Free Diamonds",
      desc: "We strictly adhere to the Kimberley Process, sourcing certified diamonds that support miners and protect ecosystems.",
    },
    {
      icon: <Shield className="w-8 h-8 text-verdant-gold" />,
      title: "Lifetime Warranty",
      desc: "We stand behind our craftsmanship. Enjoy lifetime complimentary deep-cleaning, micro-prong inspection, structural checks, and restorative polish services.",
    },
    {
      icon: <Globe className="w-8 h-8 text-verdant-gold" />,
      title: "Worldwide Shipping",
      desc: "Your shipments are fully bonded, insured, and tracked under secure logistics, ensuring door-to-door delivery.",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-verdant-emerald/5">
      
      {/* Animated Floating Glow Circles in Background */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-[35vw] h-[35vw] bg-radial from-verdant-gold/5 to-transparent blur-[120px] pointer-events-none"
      />
      
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-radial from-verdant-emerald/3 to-transparent blur-[140px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Experience Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 md:mb-24">
          <div className="lg:col-span-6 text-left">
            <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-3 block font-light">
              Brand Philosophy
            </span>
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-wide text-verdant-emerald leading-tight font-light">
              The Uncompromising
              <br />
              <span className="gold-gradient-text font-serif italic">Atelier Standard</span>
            </h2>
          </div>
          <div className="lg:col-span-6 flex items-end text-left">
            <p className="text-verdant-emerald/60 text-xs md:text-sm font-light leading-relaxed tracking-wider">
              From our clean-room sourcing practices to micro-prong setting designs, we reject shortcuts. Each creation undergoes hours of inspection to ensure it passes GIA authentication and satisfies structural standards built to span generations.
            </p>
          </div>
        </div>

        {/* 4 Columns Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="hover-target glass-effect rounded-3xl p-8 lg:p-10 border border-verdant-emerald/5 hover:border-verdant-gold/30 bg-[#F8F4EA]/30 hover:bg-[#F8F4EA]/60 transition-all duration-500 group flex flex-col items-start text-left shadow-xs hover:shadow-[0_15px_30px_rgba(15,76,58,0.05)]"
            >
              <div className="p-4 rounded-2xl bg-verdant-emerald/3 border border-verdant-emerald/5 group-hover:bg-verdant-gold/5 group-hover:border-verdant-gold/30 transition-all duration-500 mb-8">
                {exp.icon}
              </div>
              <h3 className="font-serif text-xl tracking-wide text-verdant-emerald group-hover:text-verdant-gold transition-colors duration-300">
                {exp.title}
              </h3>
              <p className="text-verdant-emerald/60 text-xs md:text-sm font-light leading-relaxed tracking-wide">
                {exp.desc}
              </p>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
