"use client";

import { useState, useEffect } from "react";
import { fetchCategories, CategoryData } from "../../services/productListing";
import { Filter, RotateCcw, ChevronDown, Check } from "lucide-react";

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
  hideHeader?: boolean;
}

const PRICE_PRESETS = [
  { label: "Under ₹25k", min: "", max: "25000" },
  { label: "₹25k – ₹50k", min: "25000", max: "50000" },
  { label: "₹50k – ₹1L", min: "50000", max: "100000" },
  { label: "Above ₹1L", min: "100000", max: "" },
];

const METALS = [
  { name: "Gold", swatch: "bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600" },
  { name: "Platinum", swatch: "bg-gradient-to-tr from-slate-200 via-slate-300 to-slate-400" },
  { name: "Silver", swatch: "bg-gradient-to-tr from-gray-100 via-gray-300 to-gray-400" },
  { name: "Rose Gold", swatch: "bg-gradient-to-tr from-rose-200 via-rose-300 to-amber-300" },
  { name: "White Gold", swatch: "bg-gradient-to-tr from-slate-100 via-stone-200 to-slate-300" },
];

const GENDERS = [
  { label: "All Styling", value: "" },
  { label: "Women", value: "Women" },
  { label: "Men", value: "Men" },
  { label: "Unisex", value: "Unisex" },
];

export default function ProductFilters({
  filters,
  onChange,
  onClear,
  hideHeader = false,
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    categories: true,
    material: true,
    styling: true,
    price: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        if (res.success && mounted) {
          setCategories(res.categories);
        }
      } catch {
        // Ignored
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Count active filters
  const activeCount = [
    filters.category,
    filters.material,
    filters.gender,
    filters.minPrice || filters.maxPrice,
    filters.availability,
  ].filter(Boolean).length;

  const isPresetActive = (min: string, max: string) => {
    return filters.minPrice === min && filters.maxPrice === max;
  };

  const containerClasses = hideHeader
    ? "flex flex-col gap-5 text-left select-none"
    : "glass-card rounded-3xl p-6 border border-verdant-emerald/10 flex flex-col gap-6 text-left select-none shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.03)] bg-white/75 backdrop-blur-md";

  return (
    <div className={containerClasses}>
      {/* Header with Title & Reset Button (hidden inside mobile drawer to avoid duplicate header) */}
      {!hideHeader && (
        <div className="flex items-center justify-between pb-4 border-b border-verdant-emerald/10">
          <div className="flex items-center gap-2.5 text-verdant-emerald">
            <div className="w-8 h-8 rounded-full bg-verdant-emerald/10 border border-verdant-gold/30 flex items-center justify-center text-verdant-gold shrink-0">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-light tracking-wide text-verdant-emerald uppercase">
                Refine Exhibition
              </h3>
              <span className="text-[8px] tracking-widest text-verdant-emerald/50 uppercase font-mono block">
                Bespoke Facets
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-verdant-gold text-black text-[9px] font-bold font-mono shadow-xs">
                {activeCount} active
              </span>
            )}
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-verdant-emerald/60 hover:text-verdant-gold flex items-center gap-1 text-[8px] tracking-widest font-bold uppercase transition-colors cursor-pointer py-1 px-1.5"
                aria-label="Reset Filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Category / Exhibit Facet */}
      <div className="border-b border-verdant-emerald/10 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-verdant-emerald font-bold font-mono cursor-pointer py-1 group"
        >
          <div className="flex items-center gap-2">
            <span className="group-hover:text-verdant-gold transition-colors">Exhibition Collections</span>
            {filters.category && (
              <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold animate-pulse" />
            )}
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 text-verdant-emerald/50 group-hover:text-verdant-gold ${
              openSections.categories ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.categories && (
          <div className="mt-3 flex flex-col gap-1 max-h-52 overflow-y-auto pr-1.5 custom-scrollbar">
            {/* All Exhibits Option */}
            <button
              type="button"
              onClick={() => onChange({ category: "" })}
              className={`w-full text-left py-2 px-3 rounded-xl transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                filters.category === ""
                  ? "bg-verdant-emerald text-white font-bold shadow-xs border-l-2 border-verdant-gold"
                  : "text-verdant-emerald/70 hover:text-verdant-emerald hover:bg-verdant-emerald/5"
              }`}
            >
              <span className="text-[10px] tracking-wider uppercase font-semibold">
                All Collections
              </span>
              {filters.category === "" && (
                <Check className="w-3.5 h-3.5 text-verdant-gold shrink-0" />
              )}
            </button>

            {loading ? (
              <div className="space-y-2 py-2 px-1">
                <div className="h-4 w-4/5 bg-verdant-emerald/10 rounded-md animate-pulse" />
                <div className="h-4 w-3/5 bg-verdant-emerald/10 rounded-md animate-pulse" />
                <div className="h-4 w-2/3 bg-verdant-emerald/10 rounded-md animate-pulse" />
              </div>
            ) : (
              categories.map((cat) => {
                const isActive = filters.category === cat.slug;
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => onChange({ category: isActive ? "" : cat.slug })}
                    className={`w-full text-left py-2 px-3 rounded-xl transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? "bg-verdant-emerald text-white font-bold shadow-xs border-l-2 border-verdant-gold"
                        : "text-verdant-emerald/70 hover:text-verdant-emerald hover:bg-verdant-emerald/5"
                    }`}
                  >
                    <span className="text-[10px] tracking-wider uppercase font-semibold">
                      {cat.name}
                    </span>
                    {isActive ? (
                      <Check className="w-3.5 h-3.5 text-verdant-gold shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-verdant-emerald/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 2. Precious Metals Facet (with Visual Swatches) */}
      <div className="border-b border-verdant-emerald/10 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("material")}
          className="w-full flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-verdant-emerald font-bold font-mono cursor-pointer py-1 group"
        >
          <div className="flex items-center gap-2">
            <span className="group-hover:text-verdant-gold transition-colors">Precious Metal Composition</span>
            {filters.material && (
              <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold animate-pulse" />
            )}
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 text-verdant-emerald/50 group-hover:text-verdant-gold ${
              openSections.material ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.material && (
          <div className="mt-3 flex flex-wrap gap-2">
            {/* All Metals pill */}
            <button
              type="button"
              onClick={() => onChange({ material: "" })}
              className={`text-[9px] tracking-wider uppercase font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                filters.material === ""
                  ? "bg-verdant-emerald text-white border-verdant-emerald shadow-xs"
                  : "border-verdant-emerald/15 text-verdant-emerald/70 hover:bg-verdant-emerald/5 bg-white/50"
              }`}
            >
              <span>All Metals</span>
            </button>

            {/* Individual Metals with Luxurious Visual Swatches */}
            {METALS.map((m) => {
              const isActive = filters.material === m.name;
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => onChange({ material: isActive ? "" : m.name })}
                  className={`text-[9px] tracking-wider uppercase font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-verdant-emerald text-white border-verdant-emerald shadow-xs ring-1 ring-verdant-gold/50"
                      : "border-verdant-emerald/15 text-verdant-emerald/80 hover:bg-verdant-emerald/5 bg-white/50 hover:border-verdant-gold/40"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs border border-black/10 ${m.swatch}`}
                  />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Curated Styling / Gender Facet */}
      <div className="border-b border-verdant-emerald/10 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("styling")}
          className="w-full flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-verdant-emerald font-bold font-mono cursor-pointer py-1 group"
        >
          <div className="flex items-center gap-2">
            <span className="group-hover:text-verdant-gold transition-colors">Curated Styling</span>
            {filters.gender && (
              <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold animate-pulse" />
            )}
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 text-verdant-emerald/50 group-hover:text-verdant-gold ${
              openSections.styling ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.styling && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {GENDERS.map((g) => {
              const isActive = filters.gender === g.value;
              return (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => onChange({ gender: g.value })}
                  className={`text-[9px] tracking-widest font-bold uppercase py-2.5 px-2 border rounded-xl transition-all cursor-pointer text-center ${
                    isActive
                      ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs ring-1 ring-verdant-gold/40"
                      : "border-verdant-emerald/15 text-verdant-emerald/75 hover:bg-verdant-emerald/5 bg-white/40"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Valuation Range (INR) Facet */}
      <div className="border-b border-verdant-emerald/10 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-verdant-emerald font-bold font-mono cursor-pointer py-1 group"
        >
          <div className="flex items-center gap-2">
            <span className="group-hover:text-verdant-gold transition-colors">Valuation Range</span>
            {(filters.minPrice || filters.maxPrice) && (
              <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold animate-pulse" />
            )}
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 text-verdant-emerald/50 group-hover:text-verdant-gold ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-3">
            {/* Quick Price Preset Chips */}
            <div className="grid grid-cols-2 gap-1.5">
              {PRICE_PRESETS.map((preset) => {
                const active = isPresetActive(preset.min, preset.max);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      if (active) {
                        onChange({ minPrice: "", maxPrice: "" });
                      } else {
                        onChange({ minPrice: preset.min, maxPrice: preset.max });
                      }
                    }}
                    className={`text-[9px] tracking-wider font-semibold py-2 px-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                      active
                        ? "bg-verdant-gold text-black border-verdant-gold font-bold shadow-xs scale-101"
                        : "border-verdant-emerald/15 text-verdant-emerald/80 hover:bg-verdant-emerald/5 bg-white/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min/Max Input Row */}
            <div className="pt-1">
              <span className="text-[8px] uppercase tracking-widest text-verdant-emerald/50 font-mono font-bold block mb-1.5">
                Custom Valuation (INR)
              </span>
              <div className="flex gap-2 items-center">
                <div className="relative w-1/2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-verdant-emerald/40 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => onChange({ minPrice: e.target.value })}
                    className="w-full text-xs text-verdant-emerald bg-white/80 border border-verdant-emerald/15 rounded-xl pl-6 pr-2.5 py-2.5 focus:outline-hidden focus:border-verdant-gold focus:bg-white transition-all font-bold placeholder:text-verdant-emerald/30 shadow-2xs"
                  />
                </div>
                <span className="text-verdant-emerald/30 text-xs font-bold">–</span>
                <div className="relative w-1/2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-verdant-emerald/40 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => onChange({ maxPrice: e.target.value })}
                    className="w-full text-xs text-verdant-emerald bg-white/80 border border-verdant-emerald/15 rounded-xl pl-6 pr-2.5 py-2.5 focus:outline-hidden focus:border-verdant-gold focus:bg-white transition-all font-bold placeholder:text-verdant-emerald/30 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. In-Stock Availability Facet (Custom Luxury Switch) */}
      <div className="pt-1">
        <label
          htmlFor="availability-switch"
          className="flex items-center justify-between cursor-pointer group p-1"
        >
          <div>
            <span className="text-[10px] tracking-widest font-bold uppercase text-verdant-emerald block">
              In Stock Pieces Only
            </span>
            <span className="text-[8px] text-verdant-emerald/50 font-mono block mt-0.5">
              Exclude made-to-order exhibits
            </span>
          </div>

          <button
            type="button"
            id="availability-switch"
            role="switch"
            aria-checked={filters.availability === "in-stock"}
            onClick={() =>
              onChange({
                availability: filters.availability === "in-stock" ? "" : "in-stock",
              })
            }
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 shrink-0 ${
              filters.availability === "in-stock"
                ? "bg-verdant-emerald"
                : "bg-verdant-emerald/20"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                filters.availability === "in-stock" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
