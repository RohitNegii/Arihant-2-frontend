"use client";

import { use, useState, useEffect } from "react";
import { ArrowLeft, Sparkles, ShieldCheck, RefreshCw, Truck, BadgeAlert } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/sections/Navbar";
import MouseFollower from "@/components/MouseFollower";
import Footer from "@/components/sections/Footer";
import Breadcrumb from "@/components/global/Breadcrumb";
import ProductGallery from "@/components/product-details/ProductGallery";
import ProductInfo from "@/components/product-details/ProductInfo";
import ProductActions from "@/components/product-details/ProductActions";
import ProductReviews from "@/components/product-details/ProductReviews";
import FAQ from "@/components/global/FAQ";
import RelatedProducts from "@/components/product-details/RelatedProducts";
import ProductPrice from "@/components/global/ProductPrice";
import { ProductDetailsSkeleton } from "@/components/global/LoadingSkeleton";
import { ProductData } from "@/services/productListing";
import { fetchProductBySlug } from "@/services/productDetails";

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");

  // Default sizes for selection
  const ringSizes = ["US 5", "US 6", "US 7", "US 8", "US 9", "US 10"];

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProductBySlug(slug);
        if (res.success && res.product) {
          setProduct(res.product);
          // Set initial size selection if ring or size-appropriate category
          const isRing = res.product.category?.name?.toLowerCase().includes("ring");
          if (isRing) {
            setSelectedSize(ringSizes[2]); // default to US 7
          }
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4EA] pb-24 text-verdant-emerald selection:bg-verdant-emerald/15">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-36">
          <ProductDetailsSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F8F4EA] pb-24 text-verdant-emerald selection:bg-verdant-emerald/15 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-36 px-6 text-center max-w-md mx-auto">
          <BadgeAlert className="w-16 h-16 text-red-800 mb-6 animate-pulse" />
          <h2 className="font-serif text-2xl font-light mb-3">Masterpiece Unreachable</h2>
          <p className="text-verdant-emerald/65 text-xs font-light leading-relaxed tracking-wide mb-8">
            The jewelry archive returned an empty response. It is possible the product is deleted, set to draft, or the path is invalid.
          </p>
          <Link
            href="/products"
            className="gold-gradient-bg text-black hover:scale-105 active:scale-95 text-[10px] tracking-widest uppercase font-bold px-8 py-3.5 rounded-full flex items-center gap-1.5 shadow-md transition-all duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back To Gallery
          </Link>
        </div>
      </div>
    );
  }

  const isRingCategory = product.category?.name?.toLowerCase().includes("ring");

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/products" },
    { label: product.category?.name || "Jewelry", href: `/products?category=${product.category?.slug}` },
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EA] pb-24 text-verdant-emerald selection:bg-verdant-emerald/15 select-none relative">
      <MouseFollower />
      <Navbar />

      {/* Glow overlays */}
      <div className="absolute top-[15%] right-[-10%] w-[35vw] h-[35vw] bg-radial from-[#C8A96A]/4 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[50%] left-[-10%] w-[35vw] h-[35vw] bg-radial from-[#0F4C3A]/3 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32">
        {/* Navigation Breadcrumbs & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 border-b border-verdant-emerald/5 mb-6">
          <Breadcrumb items={breadcrumbs} />
          <Link
            href="/products"
            className="hover-target text-[9px] tracking-widest uppercase font-bold text-verdant-emerald hover:text-verdant-gold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Exhibition
          </Link>
        </div>

        {/* Main Details Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mt-8">
          {/* Left Gallery Block */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Right Product Summary Block */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            <div>
              {/* Category / SKU Tag line */}
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest text-verdant-gold font-bold font-mono">
                  {product.category?.name || "Jewelry"} Collection
                </span>
                <span className="text-[8px] uppercase tracking-widest text-verdant-emerald/40 font-bold font-mono">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Title name */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-wide text-verdant-emerald leading-tight font-light mt-2 mb-4">
                {product.name}
              </h1>

              {/* Dynamic Prices */}
              <div className="flex items-center gap-4">
                <ProductPrice price={product.price} className="text-xl md:text-2xl" />
                {product.isBestSeller && (
                  <span className="bg-verdant-gold/10 text-verdant-gold text-[7px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Best Seller
                  </span>
                )}
              </div>
            </div>

            <hr className="border-verdant-emerald/5" />

            {/* Brief Description */}
            <div>
              <p className="text-verdant-emerald/75 text-xs md:text-sm font-light leading-relaxed tracking-wide">
                {product.description}
              </p>
            </div>

            {/* Interactive Ring Size Selection */}
            {isRingCategory && (
              <div className="space-y-3">
                <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block">
                  ring size calibration
                </span>
                <div className="flex flex-wrap gap-2">
                  {ringSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border text-[10px] tracking-wider font-bold rounded-xl transition-all ${
                        selectedSize === size
                          ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs scale-102"
                          : "border-verdant-emerald/10 text-verdant-emerald/75 hover:bg-verdant-emerald/5 hover:border-verdant-gold bg-white/20"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-verdant-emerald/5" />

            {/* Shopping Quantities & Actions */}
            <ProductActions product={product} />

            <hr className="border-verdant-emerald/5" />

            {/* Core Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 text-verdant-emerald/70">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-verdant-gold shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-[9px] uppercase tracking-wider font-bold text-verdant-emerald">Lifetime Protection</h4>
                  <p className="text-[8px] font-light leading-relaxed tracking-wide text-verdant-emerald/50">Genuine warranty matrix</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <RefreshCw className="w-4.5 h-4.5 text-verdant-gold shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-[9px] uppercase tracking-wider font-bold text-verdant-emerald">Resizing Promises</h4>
                  <p className="text-[8px] font-light leading-relaxed tracking-wide text-verdant-emerald/50">Complimentary 12m resizing</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Truck className="w-5 h-5 text-verdant-gold shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-[9px] uppercase tracking-wider font-bold text-verdant-emerald">Secured Logistics</h4>
                  <p className="text-[8px] font-light leading-relaxed tracking-wide text-verdant-emerald/50">Armored fully insured shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outer Sections Split Layout */}
        <div className="mt-16 space-y-16">
          {/* Detailed Specifications Sheet */}
          <ProductInfo product={product} />

          {/* Customer Reviews Critiques Section */}
          <ProductReviews productId={product._id} productName={product.name} />

          {/* FAQ Sheet */}
          <FAQ />

          {/* Related products recommendation slider */}
          <RelatedProducts productId={product._id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
