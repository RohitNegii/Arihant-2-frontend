"use client";

import { ChevronDown } from "lucide-react";
import styles from "./collection.module.css";

export default function ProductSort({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className={styles.sort}>
    <span className={styles.sortLabel}>Sort by:</span>
    <select aria-label="Sort jewellery" value={value} onChange={event => onChange(event.target.value)}>
      <option value="latest">Newest arrivals</option>
      <option value="price-asc">Price: low to high</option>
      <option value="price-desc">Price: high to low</option>
      <option value="featured">Featured</option>
      <option value="trending">Trending</option>
      <option value="bestselling">Bestsellers</option>
    </select>
    <ChevronDown aria-hidden="true" />
  </label>;
}
