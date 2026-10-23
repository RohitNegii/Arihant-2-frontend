"use client";

import type { ProductData } from "@/services/productListing";
import ProductCard from "./ProductCard";
import styles from "./collection.module.css";

interface ProductGridProps {
  products: ProductData[];
  onQuickView?: (product: ProductData) => void;
  onClearFilters?: () => void;
}

export default function ProductGrid({ products, onQuickView, onClearFilters }: ProductGridProps) {
  if (!products.length) return <div className={styles.empty} role="status">
    <h2>Still looking for the one?</h2>
    <p>No pieces match this selection. Try another search or a little less filtering.</p>
    {onClearFilters && <button type="button" className={styles.primaryButton} onClick={onClearFilters}>Explore all jewellery</button>}
  </div>;
  return <div className={styles.grid}>
    {products.map(product => <ProductCard key={product._id} product={product} onQuickView={onQuickView} />)}
  </div>;
}
