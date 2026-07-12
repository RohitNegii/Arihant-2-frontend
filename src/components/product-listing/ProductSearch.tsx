"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export default function ProductSearch({ value, onChange }: ProductSearchProps) {
  const [localVal, setLocalVal] = useState(value);

  // Sync state if parent value changes
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localVal !== value) {
        onChange(localVal);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localVal, onChange, value]);

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        placeholder="SEARCH MASTERPIECES..."
        className="w-full pl-10 pr-10 py-3 rounded-full bg-white/40 border border-verdant-emerald/10 text-verdant-emerald placeholder-verdant-emerald/30 text-[10px] tracking-widest focus:outline-hidden focus:border-verdant-gold focus:bg-white/80 transition-all duration-300 font-bold"
      />
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-verdant-emerald/40 pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
      {localVal && (
        <button
          onClick={() => setLocalVal("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-verdant-emerald/40 hover:text-verdant-emerald transition-colors"
          aria-label="Clear Search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
