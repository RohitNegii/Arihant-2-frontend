"use client";

import { AnimatePresence } from "framer-motion";
import { ProductData } from "../../services/productListing";
import ProductCard from "./ProductCard";
import EmptyState from "../global/EmptyState";

interface ProductGridProps {
  products: ProductData[];
  isListView?: boolean;
  columns?: 3 | 4;
  onQuickView?: (product: ProductData) => void;
  onClearFilters?: () => void;
}

export default function ProductGrid({
  products,
  isListView = false,
  columns = 3,
  onQuickView,
  onClearFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  const gridClass = isListView
    ? "flex flex-col gap-5 sm:gap-6"
    : columns === 4
    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
    : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6";

  return (
    <div className={gridClass}>
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            isListView={isListView}
            onQuickView={onQuickView}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
