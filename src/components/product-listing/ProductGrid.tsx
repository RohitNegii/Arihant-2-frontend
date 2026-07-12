"use client";

import { AnimatePresence } from "framer-motion";
import { ProductData } from "../../services/productListing";
import ProductCard from "./ProductCard";
import EmptyState from "../global/EmptyState";

interface ProductGridProps {
  products: ProductData[];
  isListView?: boolean;
  onClearFilters?: () => void;
}

export default function ProductGrid({ products, isListView = false, onClearFilters }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div
      className={
        isListView
          ? "flex flex-col gap-6"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      }
    >
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} isListView={isListView} />
        ))}
      </AnimatePresence>
    </div>
  );
}
