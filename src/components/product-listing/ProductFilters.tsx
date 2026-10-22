"use client";

import type { CategoryData } from "@/services/productListing";
import styles from "./collection.module.css";

export interface FilterState {
  category: string;
  material: string;
  gender: string;
  minPrice: string;
  maxPrice: string;
  availability: string;
  highlight: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  categories: CategoryData[];
  onChange: (updates: Partial<FilterState>) => void;
}

const PRICE_PRESETS = [
  { label: "Under ₹25,000", min: "", max: "25000" },
  { label: "₹25,000 – ₹50,000", min: "25000", max: "50000" },
  { label: "₹50,000 – ₹1,00,000", min: "50000", max: "100000" },
  { label: "Above ₹1,00,000", min: "100000", max: "" },
];

export default function ProductFilters({ filters, categories, onChange }: ProductFiltersProps) {
  const groups = [
    { key: "category" as const, title: "Category", options: [{ value: "", label: "All jewellery" }, ...categories.map(category => ({ value: category.slug, label: category.name }))] },
    { key: "material" as const, title: "Metal", options: [{ value: "", label: "All metals" }, ...["Gold", "Silver", "Platinum", "Rose Gold", "White Gold"].map(value => ({ value, label: value }))] },
    { key: "gender" as const, title: "For whom", options: [{ value: "", label: "Everyone" }, ...["Women", "Men", "Unisex"].map(value => ({ value, label: value }))] },
    { key: "highlight" as const, title: "Discover", options: [{ value: "", label: "All pieces" }, { value: "featured", label: "Featured" }, { value: "trending", label: "Trending" }, { value: "bestseller", label: "Bestsellers" }] },
  ];
  return <div>
    {groups.map(group => <details key={group.key} className={styles.filterSection} open>
      <summary>{group.title}</summary>
      <div className={styles.options} role="radiogroup" aria-label={group.title}>
        {group.options.map(option => <label key={option.value} className={styles.option}>
          <input type="radio" name={`filter-${group.key}`} value={option.value} checked={filters[group.key] === option.value} onChange={() => onChange({ [group.key]: option.value })} />
          <span>{option.label}</span>
        </label>)}
      </div>
    </details>)}
    <details className={styles.filterSection} open>
      <summary>Price</summary>
      <div className={styles.priceOptions}>
        {PRICE_PRESETS.map(preset => {
          const selected = filters.minPrice === preset.min && filters.maxPrice === preset.max;
          return <button key={preset.label} type="button" aria-pressed={selected} onClick={() => onChange({ minPrice: selected ? "" : preset.min, maxPrice: selected ? "" : preset.max })}>{preset.label}</button>;
        })}
      </div>
      <div className={styles.priceInputs}>
        <label>Minimum (₹)<input type="number" min="0" inputMode="numeric" placeholder="0" value={filters.minPrice} onChange={event => onChange({ minPrice: event.target.value })} /></label>
        <label>Maximum (₹)<input type="number" min="0" inputMode="numeric" placeholder="Any" value={filters.maxPrice} onChange={event => onChange({ maxPrice: event.target.value })} /></label>
      </div>
    </details>
    <label className={`${styles.option} ${styles.availability}`}>
      <input type="checkbox" checked={filters.availability === "in-stock"} onChange={event => onChange({ availability: event.target.checked ? "in-stock" : "" })} />
      In-stock pieces only
    </label>
  </div>;
}
