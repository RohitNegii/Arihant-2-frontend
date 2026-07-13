"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-verdant-emerald/5 py-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left hover-target py-2 font-serif text-sm md:text-base text-verdant-emerald hover:text-verdant-gold transition-colors duration-200"
      >
        <span>{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-verdant-gold transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-verdant-emerald/70 text-xs md:text-sm font-light leading-relaxed tracking-wide py-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I care for my custom Verdant Jewelry?",
      answer: "We recommend cleaning your jewelry with a very soft brush, warm water, and mild detergent. Dry thoroughly with a lint-free polishing cloth. Keep pieces separated in soft pouches when stored to prevent surface scratches.",
    },
    {
      question: "Are the gemstones conflict-free and certified?",
      answer: "Yes, every single diamond and precious gem is sourced under conflict-free Kimberly Process promises, and GIA certificates are provided for qualifying center stones exceeding 0.3 carats.",
    },
    {
      question: "Is international shipping fully insured?",
      answer: "Absolutely. We provide fully insured global shipping via specialized armored logistics couriers. A signature is always required upon delivery.",
    },
    {
      question: "What is your warranty and resizing policy?",
      answer: "We provide a complimentary lifetime warranty against manufacturing defects. Bespoke bands include one free ring resizing within the first 12 months of purchase.",
    },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 border border-verdant-emerald/5 max-w-3xl mx-auto w-full">
      <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block mb-2">faq sheet</span>
      <h3 className="font-serif text-xl md:text-2xl text-verdant-emerald font-light mb-6">
        Frequently Answered Enquiries
      </h3>
      <div className="space-y-1">
        {faqs.map((faq, idx) => (
          <FAQItem
            key={idx}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === idx}
            onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
}
