"use client";

import { useState, useEffect } from "react";
import { fetchCategories, CategoryData } from "../../services/productListing";
import { Filter, RotateCcw } from "lucide-react";

interface FilterState {
  category: string;
  material: string;
  gender: string;
  minPrice: string;
  maxPrice: string;
  availability: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  onClear: () => void;
}

export default function ProductFilters({ filters, onChange, onClear }: ProductFiltersProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        if (res.success) {
          setCategories(res.categories);
        }
      } catch (err) {
        // Ignored
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const materials = ["Gold", "Platinum", "Silver", "Rose Gold", "White Gold"];
  const genders = ["Men", "Women", "Unisex"];

  return (
    <div className="glass-card rounded-3xl p-6 border border-verdant-emerald/5 flex flex-col gap-6 text-left select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-verdant-emerald/5">
        <div className="flex items-center gap-2 text-verdant-emerald">
          <Filter className="w-4 h-4 text-verdant-gold" />
          <h3 className="font-serif text-base font-light tracking-wide uppercase">Curation Filters</h3>
        </div>
        <button
          onClick={onClear}
          className="text-verdant-gold hover:text-verdant-emerald flex items-center gap-1 text-[8px] tracking-widest font-bold uppercase transition-colors"
          aria-label="Reset Filters"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Category Section */}
      <div>
        <label className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block mb-3">
          exhibit collections
        </label>
        <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-2 custom-scrollbar">
          <button
            onClick={() => onChange({ category: "" })}
            className={`text-[10px] text-left py-1.5 transition-all duration-300 font-bold tracking-widest uppercase flex items-center gap-2 cursor-pointer ${
              filters.category === ""
                ? "text-verdant-emerald border-l-2 border-verdant-gold pl-2.5"
                : "text-verdant-emerald/50 hover:text-verdant-emerald pl-0 hover:translate-x-1"
            }`}
          >
            All Exhibits
          </button>
          {loading ? (
            <div className="h-6 w-3/4 bg-verdant-emerald/5 rounded-full animate-pulse my-2" />
          ) : (
            categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onChange({ category: cat.slug })}
                className={`text-[10px] text-left py-1.5 transition-all duration-300 font-bold tracking-widest uppercase flex items-center gap-2 cursor-pointer ${
                  filters.category === cat.slug
                    ? "text-verdant-emerald border-l-2 border-verdant-gold pl-2.5"
                    : "text-verdant-emerald/50 hover:text-verdant-emerald pl-0 hover:translate-x-1"
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Material Section */}
      <div>
        <label className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block mb-3">
          metal composition
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ material: "" })}
            className={`text-[9px] tracking-widest uppercase font-bold px-3 py-2 border rounded-xl transition-all duration-300 cursor-pointer ${
              filters.material === ""
                ? "bg-verdant-emerald border-verdant-emerald text-white shadow-md scale-102"
                : "border-verdant-emerald/10 text-verdant-emerald/70 hover:bg-verdant-emerald/5 hover:text-verdant-emerald bg-white/20"
            }`}
          >
            All Metals
          </button>
          {materials.map((m) => {
            const isActive = filters.material === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ material: m })}
                className={`text-[9px] tracking-widest uppercase font-bold px-3 py-2 border rounded-xl transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-verdant-emerald border-verdant-emerald text-white shadow-md scale-102"
                    : "border-verdant-emerald/10 text-verdant-emerald/70 hover:bg-verdant-emerald/5 hover:text-verdant-emerald bg-white/20"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>



      {/* Gender Section */}
      <div>
        <label className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block mb-2">
          intended styling
        </label>
        <div className="flex gap-2">
          {genders.map((g) => (
            <button
              key={g}
              onClick={() => onChange({ gender: filters.gender === g ? "" : g })}
              className={`flex-1 text-[9px] tracking-widest font-bold uppercase py-2.5 border rounded-xl transition-all ${
                filters.gender === g
                  ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs scale-102"
                  : "border-verdant-emerald/10 text-verdant-emerald/70 hover:bg-verdant-emerald/5 hover:text-verdant-emerald bg-white/25"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div>
        <label className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block mb-2">
          valuation range (INR)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="MIN"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="w-1/2 text-xs text-verdant-emerald bg-white/40 border border-verdant-emerald/10 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-verdant-gold focus:bg-white/80 transition-all font-bold"
          />
          <span className="text-verdant-emerald/30 text-xs font-bold">-</span>
          <input
            type="number"
            placeholder="MAX"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="w-1/2 text-xs text-verdant-emerald bg-white/40 border border-verdant-emerald/10 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-verdant-gold focus:bg-white/80 transition-all font-bold"
          />
        </div>
      </div>

      {/* Stock Availability Section */}
      <div className="flex items-center gap-2 pt-2 border-t border-verdant-emerald/5">
        <input
          type="checkbox"
          id="availability"
          checked={filters.availability === "in-stock"}
          onChange={(e) => onChange({ availability: e.target.checked ? "in-stock" : "" })}
          className="accent-luxury-gold w-4 h-4 cursor-pointer"
        />
        <label
          htmlFor="availability"
          className="text-[9px] tracking-widest font-bold uppercase text-verdant-emerald/70 cursor-pointer select-none"
        >
          In Stock Only
        </label>
      </div>
    </div>
  );
}
