"use client";

import { useState, useEffect } from "react";
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
    const loadRelated = async () => {
      setLoading(true);
      try {
        const res = await fetchRelatedProducts(productId);
        if (res.success) {
          setProducts(res.products);
        }
      } catch (err) {
        // Ignored
      } finally {
        setLoading(false);
      }
    };
    loadRelated();
  }, [productId]);

  if (!loading && products.length === 0) {
    return null; // hide section if no related items
  }

  return (
    <div className="text-left select-none max-w-7xl mx-auto w-full my-12">
      <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block mb-2">curated recommendations</span>
      <h3 className="font-serif text-2xl md:text-3xl text-verdant-emerald font-light mb-8">
        Related Masterpieces
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => <CardSkeleton key={idx} />)
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>
    </div>
  );
}
