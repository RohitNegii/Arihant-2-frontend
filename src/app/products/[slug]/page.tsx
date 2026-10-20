"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, ShieldCheck, RefreshCw, Truck, BadgeAlert, Crown, TrendingUp } from "lucide-react";
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
import { getSizeConfigByCategoryName } from "@/config/sizeConfig";

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [customSizeVal, setCustomSizeVal] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faq">("details");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProductBySlug(slug);
        if (res.success && res.product) {
          setProduct(res.product);
          setSelectedSize(""); // Forces explicit size selection
          if (res.product.hasVariants && res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0].name);
          } else {
            setSelectedVariant("");
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
      <div className="min-h-screen bg-verdant-cream pb-24 text-verdant-emerald selection:bg-verdant-emerald/15">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-36">
          <ProductDetailsSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-verdant-cream pb-24 text-verdant-emerald selection:bg-verdant-emerald/15 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-36 px-6 text-center max-w-md mx-auto">
          <BadgeAlert className="w-16 h-16 text-verdant-danger mb-6 animate-pulse" />
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

  const hasSizes = product && ((product.sizes && product.sizes.length > 0) || product.allowCustomSize);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/products" },
    { label: product.category?.name || "Jewelry", href: `/products?category=${product.category?.slug}` },
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-verdant-cream text-verdant-emerald selection:bg-verdant-emerald/15 select-none relative overflow-x-hidden">
      <MouseFollower />
      <Navbar />

      {/* Glow overlays */}
      <div className="absolute top-[15%] right-[-10%] w-[35vw] h-[35vw] bg-radial from-verdant-gold/4 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[50%] left-[-10%] w-[35vw] h-[35vw] bg-radial from-verdant-emerald/3 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-12">
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
        {(() => {
          const selectedVariantObj = product.hasVariants && selectedVariant
            ? product.variants?.find(v => v.name === selectedVariant)
            : null;

          let activeGalleryImages: string[] = [];
          if (selectedVariantObj) {
            const variantMedia: string[] = [];
            if (selectedVariantObj.video) {
              variantMedia.push(selectedVariantObj.video);
            }
            if (selectedVariantObj.images && selectedVariantObj.images.length > 0) {
              selectedVariantObj.images.forEach((img) => {
                if (!variantMedia.includes(img)) {
                  variantMedia.push(img);
                }
              });
            }
            if (variantMedia.length > 0) {
              activeGalleryImages = variantMedia;
            }
          }

          if (activeGalleryImages.length === 0) {
            activeGalleryImages = product.images || [];
          }

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mt-8">
              {/* Left Gallery Block */}
              <div className="lg:col-span-7">
                <ProductGallery images={activeGalleryImages} name={product.name} />
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
                <ProductPrice 
                  price={
                    product.hasVariants && selectedVariant 
                      ? (product.variants?.find(v => v.name === selectedVariant)?.price ?? product.price ?? 0)
                      : (product.price ?? 0)
                  }
                  className="text-xl md:text-2xl" 
                />
                {product.isFeatured && (
                  <span className="gold-gradient-bg text-black border border-verdant-gold/40 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 font-mono shadow-xs">
                    <Crown className="w-2.5 h-2.5 text-black" /> Featured Masterpiece
                  </span>
                )}
                {product.isTrending && (
                  <span className="bg-amber-600/15 text-amber-700 border border-amber-500/30 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 font-mono shadow-xs">
                    <TrendingUp className="w-2.5 h-2.5" /> Trending Design
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-verdant-emerald/15 text-verdant-emerald border border-verdant-emerald/30 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 font-mono shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-verdant-gold" /> Best Seller
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

            {/* Interactive Variety Selection */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold block">
                    select variety option
                  </span>
                  {selectedVariant && (
                    <span className="text-[8px] text-verdant-emerald/50 uppercase font-bold tracking-wider">
                      Selected: {selectedVariant}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant === v.name;
                    return (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(v.name)}
                        className={`px-4 py-2 border text-[10px] tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs scale-102"
                            : "border-verdant-emerald/10 text-verdant-emerald/75 hover:bg-verdant-emerald/5 hover:border-verdant-gold bg-white/20"
                        }`}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interactive Size Selection */}
            {hasSizes && (
              <div className="space-y-3">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold block">
                    select size / length calibration
                  </span>
                  {selectedSize && (
                    <span className="text-[8px] text-verdant-emerald/50 uppercase font-bold tracking-wider">
                      Selected: {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes && product.sizes.map((size) => {
                    const isSelected = selectedSize === size && !isCustomSelected;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setIsCustomSelected(false);
                          setSelectedSize(size);
                        }}
                        className={`px-4 py-2 border text-[10px] tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs scale-102"
                            : "border-verdant-emerald/10 text-verdant-emerald/75 hover:bg-verdant-emerald/5 hover:border-verdant-gold bg-white/20"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}

                  {product.allowCustomSize && (
                    <button
                      onClick={() => {
                        setIsCustomSelected(true);
                        setSelectedSize(customSizeVal ? "Custom: " + customSizeVal : "");
                      }}
                      className={`px-4 py-2 border text-[10px] tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                        isCustomSelected
                          ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs scale-102"
                          : "border-verdant-emerald/10 text-verdant-emerald/75 hover:bg-verdant-emerald/5 hover:border-verdant-gold bg-white/20"
                      }`}
                    >
                      Custom Size
                    </button>
                  )}
                </div>

                {isCustomSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 pt-1"
                  >
                    <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/60">
                      Enter Custom Details
                    </label>
                    <input
                      type="text"
                      value={customSizeVal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomSizeVal(val);
                        setSelectedSize(val ? "Custom: " + val : "");
                      }}
                      placeholder="E.g. 6.5, 17 inches, or custom request"
                      className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-white/60 border border-verdant-emerald/10 text-xs focus:border-verdant-gold focus:outline-hidden transition-colors"
                    />
                    <p className="text-[8px] text-verdant-emerald/40 font-mono uppercase leading-relaxed">
                      Our artisans will craft the piece to your exact specification.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            <hr className="border-verdant-emerald/5" />

            {/* Shopping Quantities & Actions */}
            <ProductActions product={product} selectedSize={selectedSize} selectedVariant={selectedVariant} />

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
        );
      })()}

        {/* Elegant Interactive Tabs Switcher (Saves immense vertical scrolling whitespace) */}
        <div className="mt-12">
          <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-none border-b border-verdant-emerald/10 mb-8 font-mono text-[9px] md:text-xs uppercase tracking-widest font-bold gap-4 md:gap-8 whitespace-nowrap">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "details"
                  ? "border-verdant-gold text-verdant-emerald"
                  : "border-transparent text-verdant-emerald/40 hover:text-verdant-emerald"
              }`}
            >
              Details & Craft
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "border-verdant-gold text-verdant-emerald"
                  : "border-transparent text-verdant-emerald/40 hover:text-verdant-emerald"
              }`}
            >
              Client Reviews ({product.reviews?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "faq"
                  ? "border-verdant-gold text-verdant-emerald"
                  : "border-transparent text-verdant-emerald/40 hover:text-verdant-emerald"
              }`}
            >
              Atelier FAQ
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "details" && <ProductInfo product={product} />}
              {activeTab === "reviews" && (
                <ProductReviews
                  productId={product._id}
                  productName={product.name}
                  initialReviews={product.reviews || []}
                />
              )}
              {activeTab === "faq" && <FAQ />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Related Products Recommendation Slider */}
        <div className="mt-12">
          <RelatedProducts productId={product._id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
