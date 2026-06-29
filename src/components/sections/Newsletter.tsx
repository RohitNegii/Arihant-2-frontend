"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section id="boutique" className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-verdant-emerald/5">
      <div className="absolute top-[10%] right-[-10%] w-[35vw] h-[35vw] bg-radial from-verdant-gold/3 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-effect rounded-3xl p-8 md:p-16 border border-verdant-emerald/5 hover:border-verdant-gold/20 transition-all duration-500 bg-white/20"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold mb-4 block font-light">
            exclusive access
          </span>
          
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-verdant-emerald mb-4 font-light text-center">
            Become Part Of Our Story
          </h2>
          
          <p className="text-verdant-emerald/60 text-xs md:text-sm font-light leading-relaxed max-w-lg mx-auto mb-10 tracking-wider">
            Receive private portfolios, private gallery previews, and private collection curation notifications directly from our artisans.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-verdant-gold font-light tracking-[0.1em] text-sm py-4 border border-verdant-gold/20 rounded-xl bg-verdant-gold/5 max-w-md mx-auto"
            >
              Thank you. Your invitation to the Circle is processing.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto z-20 relative">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="hover-target flex-1 px-6 py-4 rounded-full bg-white/50 border border-verdant-emerald/10 text-verdant-emerald placeholder-verdant-emerald/30 text-xs tracking-wider focus:outline-hidden focus:border-verdant-gold focus:bg-white/90 transition-all font-light"
              />
              <button
                type="submit"
                className="hover-target gold-gradient-bg text-black font-semibold text-xs tracking-[0.15em] uppercase px-8 py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200,169,106,0.15)] hover:shadow-[0_0_30px_rgba(200,169,106,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Subscribe
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
