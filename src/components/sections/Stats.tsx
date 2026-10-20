"use client";

import { useEffect, useRef } from "react";
import { useInView, motion, animate } from "framer-motion";

interface CounterProps {
  value: number;
  suffix?: string;
}

function Counter({ value, suffix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (!inView) return;
    
    const node = ref.current;
    if (!node) return;
    
    const controls = animate(0, value, {
      duration: 2.5,
      ease: [0.16, 1, 0.3, 1], // premium out-expo easing
      onUpdate(val) {
        node.textContent = Math.round(val).toLocaleString() + suffix;
      },
    });
    
    return () => controls.stop();
  }, [value, inView, suffix]);

  return <span ref={ref} className="font-serif font-light">0{suffix}</span>;
}

export default function Stats() {
  const stats = [
    { value: 5001, suffix: "+", label: "Happy Clients" },
    { value: 120, suffix: "+", label: "Exclusive Designs" },
    { value: 25, suffix: " Years", label: "Craftsmanship" },
    { value: 98, suffix: "%", label: "Customer Satisfaction" },
  ];

  return (
    <section className="relative py-20 bg-transparent border-t border-verdant-emerald/5 overflow-hidden">
      <div className="absolute inset-0 bg-radial from-verdant-gold/3 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-6 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-verdant-emerald font-serif mb-3 flex items-center justify-center">
                <span className="gold-gradient-text">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </span>
              </div>
              <p className="text-[10px] md:text-xs tracking-[0.25em] text-verdant-emerald/50 uppercase font-light">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
