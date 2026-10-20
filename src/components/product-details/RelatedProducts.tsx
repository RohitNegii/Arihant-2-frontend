"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { ProductData } from "../../services/productListing";
import { fetchRelatedProducts } from "../../services/productDetails";
import ProductCard from "../product-listing/ProductCard";
import { CardSkeleton } from "../global/LoadingSkeleton";

interface RelatedProductsProps {
  productId: string;
}

export default function RelatedProducts({ productId }: RelatedProductsProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadRelated = async () => {
      setLoading(true);
      try {
        const res = await fetchRelatedProducts(productId);
        if (res.success && mounted) {
          setProducts(res.products);
        }
      } catch {
        // Ignored
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadRelated();
    return () => {
      mounted = false;
    };
  }, [productId]);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="text-left select-none max-w-7xl mx-auto w-full mt-20 mb-12">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-verdant-gold" />
        <span className="text-[9px] uppercase tracking-[0.25em] text-verdant-gold font-bold font-mono">
          Curated Recommendations
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
        <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-verdant-emerald font-light">
          Complementary Masterpieces
        </h3>
        <p className="text-xs text-verdant-emerald/60 font-light">
          Handpicked exhibits sharing architectural geometry and hallmark purity
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => <CardSkeleton key={idx} />)
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>
    </section>
  );
}
