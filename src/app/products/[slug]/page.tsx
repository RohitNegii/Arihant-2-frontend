"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, ShieldCheck, RefreshCw, Truck, BadgeAlert, Award, Crown, TrendingUp } from "lucide-react";
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
  const [customSizeVal, setCustomSizeVal] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faq">("details");

  useEffect(() => {
    let mounted = true;
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProductBySlug(slug);
        if (res.success && res.product && mounted) {
          setProduct(res.product);
          setSelectedSize("");
          if (res.product.hasVariants && res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0].name);
          } else {
            setSelectedVariant("");
          }
        } else if (mounted) {
          setError("Product not found");
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load product details");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (slug) {
      loadProduct();
    }
    return () => {
      mounted = false;
    };
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

  const hasSizes = Boolean(product && ((product.sizes && product.sizes.length > 0) || product.allowCustomSize));

  const activePrice = product.hasVariants && selectedVariant
    ? (product.variants?.find((v) => v.name === selectedVariant)?.price ?? product.price ?? 0)
    : (product.price ?? 0);

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

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-[12%] right-[-10%] w-[40vw] h-[40vw] bg-radial from-verdant-gold/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[45%] left-[-10%] w-[40vw] h-[40vw] bg-radial from-verdant-emerald/4 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-28 pb-16">
        {/* Navigation Breadcrumbs & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3 border-b border-verdant-emerald/10 mb-8">
          <Breadcrumb items={breadcrumbs} />
          <Link
            href="/products"
            className="text-[9px] tracking-widest uppercase font-bold text-verdant-emerald hover:text-verdant-gold flex items-center gap-1.5 self-start sm:self-auto transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Exhibition</span>
          </Link>
        </div>

        {/* Main Details Workspace Grid */}
        {(() => {
          const selectedVariantObj = product.hasVariants && selectedVariant
            ? product.variants?.find((v) => v.name === selectedVariant)
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-14 items-start">
              {/* Left Gallery Block (Sticky on Desktop) */}
              <div className="lg:col-span-7 lg:sticky lg:top-28">
                <ProductGallery images={activeGalleryImages} name={product.name} />
              </div>

              {/* Right Product Summary Block */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                <div>
                  {/* Category / Collection Tag & SKU */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-verdant-gold font-bold font-mono">
                      {product.category?.name || "Bespoke Jewelry"} Exhibition
                    </span>
                    <span className="text-[8px] uppercase tracking-widest text-verdant-emerald/45 font-mono font-bold">
                      SKU: {product.sku}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-wide text-verdant-emerald leading-tight font-light mt-1 mb-3">
                    {product.name}
                  </h1>

                  {/* Pricing Row & Incoming Priority Badges */}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <ProductPrice price={activePrice} className="text-2xl sm:text-3xl font-medium" />

                    {product.isFeatured && (
                      <span className="gold-gradient-bg text-black border border-verdant-gold/40 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 font-mono shadow-xs">
                        <Crown className="w-2.5 h-2.5 text-black" /> Featured Masterpiece
                      </span>
                    )}

                    {product.isTrending && (
                      <span className="bg-amber-600/15 text-amber-700 border border-amber-500/30 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 font-mono shadow-xs">
                        <TrendingUp className="w-2.5 h-2.5 text-amber-700" /> Trending Design
                      </span>
                    )}

                    {product.isBestSeller && (
                      <span className="bg-verdant-emerald/15 text-verdant-emerald border border-verdant-emerald/30 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 font-mono shadow-xs">
                        <Sparkles className="w-2.5 h-2.5 text-verdant-gold" /> Best Seller
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] tracking-wider text-verdant-emerald/50 block mt-1">
                    Inclusive of all luxury taxes & duties • Hallmarked assurance
                  </span>
                </div>

                {/* Material & Certification Pills */}
                <div className="flex flex-wrap gap-2 text-[9px] tracking-widest uppercase font-bold">
                  {product.material && (
                    <span className="bg-white/60 border border-verdant-emerald/10 text-verdant-emerald px-3 py-1.5 rounded-xl shadow-xs">
                      {product.material} ({product.purity || "Certified"})
                    </span>
                  )}
                  {product.weight && (
                    <span className="bg-white/60 border border-verdant-emerald/10 text-verdant-emerald px-3 py-1.5 rounded-xl shadow-xs">
                      Weight: {product.weight}g
                    </span>
                  )}
                  {product.gender && (
                    <span className="bg-white/60 border border-verdant-emerald/10 text-verdant-emerald px-3 py-1.5 rounded-xl shadow-xs">
                      Styling: {product.gender}
                    </span>
                  )}
                </div>

                <hr className="border-verdant-emerald/10" />

                {/* Description */}
                <div>
                  <p className="text-verdant-emerald/75 text-xs sm:text-sm font-light leading-relaxed tracking-wide">
                    {product.description}
                  </p>
                </div>

                {/* Variety / Variant Selection */}
                {product.hasVariants && product.variants && product.variants.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-[8px] uppercase tracking-[0.2em] text-verdant-gold font-bold block">
                        Select Variety Option
                      </span>
                      {selectedVariant && (
                        <span className="text-[8px] text-verdant-emerald/60 uppercase font-bold tracking-wider">
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
                            type="button"
                            onClick={() => setSelectedVariant(v.name)}
                            className={`px-4 py-2.5 border text-[10px] tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs scale-102 ring-1 ring-verdant-gold/40"
                                : "border-verdant-emerald/15 text-verdant-emerald/80 hover:bg-verdant-emerald/5 hover:border-verdant-gold bg-white/40"
                            }`}
                          >
                            {v.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {hasSizes && (
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-[8px] uppercase tracking-[0.2em] text-verdant-gold font-bold block">
                        Select Size / Calibration
                      </span>
                      {selectedSize && (
                        <span className="text-[8px] text-verdant-emerald/60 uppercase font-bold tracking-wider">
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
                            type="button"
                            onClick={() => {
                              setIsCustomSelected(false);
                              setSelectedSize(size);
                            }}
                            className={`px-4 py-2.5 border text-[10px] tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs scale-102 ring-1 ring-verdant-gold/40"
                                : "border-verdant-emerald/15 text-verdant-emerald/80 hover:bg-verdant-emerald/5 hover:border-verdant-gold bg-white/40"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}

                      {product.allowCustomSize && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSelected(true);
                            setSelectedSize(customSizeVal ? "Custom: " + customSizeVal : "");
                          }}
                          className={`px-4 py-2.5 border text-[10px] tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                            isCustomSelected
                              ? "bg-verdant-emerald border-verdant-emerald text-white shadow-xs scale-102 ring-1 ring-verdant-gold/40"
                              : "border-verdant-emerald/15 text-verdant-emerald/80 hover:bg-verdant-emerald/5 hover:border-verdant-gold bg-white/40"
                          }`}
                        >
                          Custom Size
                        </button>
                      )}
                    </div>

                    {isCustomSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 pt-2"
                      >
                        <label className="block text-[8px] tracking-widest uppercase font-bold text-verdant-emerald/70 font-mono">
                          Enter Custom Calibration Details
                        </label>
                        <input
                          type="text"
                          value={customSizeVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomSizeVal(val);
                            setSelectedSize(val ? "Custom: " + val : "");
                          }}
                          placeholder="E.g. Ring size 6.5, 17-inch chain, wrist circumference"
                          className="w-full max-w-sm px-4 py-2.5 rounded-xl bg-white/80 border border-verdant-emerald/15 text-xs text-verdant-emerald focus:border-verdant-gold focus:outline-hidden transition-colors font-medium shadow-xs"
                        />
                        <p className="text-[8px] text-verdant-emerald/50 font-mono uppercase leading-relaxed">
                          Our master goldsmiths will shape this creation to your bespoke dimensions.
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                <hr className="border-verdant-emerald/10" />

                {/* Shopping Actions (Quantity, Add to Bag, Instant Checkout) */}
                <ProductActions
                  product={product}
                  selectedSize={selectedSize}
                  selectedVariant={selectedVariant}
                />

                <hr className="border-verdant-emerald/10" />

                {/* Core Trust Badges Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/40 border border-verdant-emerald/5">
                    <ShieldCheck className="w-4 h-4 text-verdant-gold shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h4 className="text-[9px] uppercase tracking-wider font-bold text-verdant-emerald">
                        Lifetime Protection
                      </h4>
                      <p className="text-[8px] font-light leading-relaxed text-verdant-emerald/60">
                        Official certificate & warranty
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/40 border border-verdant-emerald/5">
                    <RefreshCw className="w-4 h-4 text-verdant-gold shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h4 className="text-[9px] uppercase tracking-wider font-bold text-verdant-emerald">
                        Resizing Promise
                      </h4>
                      <p className="text-[8px] font-light leading-relaxed text-verdant-emerald/60">
                        Complimentary 12-month sizing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/40 border border-verdant-emerald/5">
                    <Truck className="w-4 h-4 text-verdant-gold shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h4 className="text-[9px] uppercase tracking-wider font-bold text-verdant-emerald">
                        Secured Logistics
                      </h4>
                      <p className="text-[8px] font-light leading-relaxed text-verdant-emerald/60">
                        100% insured armored transit
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Elegant Interactive Tabs Section */}
        <div className="mt-16 sm:mt-20">
          <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-none border-b border-verdant-emerald/10 mb-8 font-mono text-[9px] md:text-xs uppercase tracking-widest font-bold gap-4 md:gap-8 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`pb-3.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "details"
                  ? "border-verdant-gold text-verdant-emerald font-bold"
                  : "border-transparent text-verdant-emerald/40 hover:text-verdant-emerald"
              }`}
            >
              Details & Craft
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`pb-3.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "border-verdant-gold text-verdant-emerald font-bold"
                  : "border-transparent text-verdant-emerald/40 hover:text-verdant-emerald"
              }`}
            >
              Client Reviews ({product.reviews?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={`pb-3.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "faq"
                  ? "border-verdant-gold text-verdant-emerald font-bold"
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

        {/* Related Products Section */}
        <RelatedProducts productId={product._id} />
      </div>

      <Footer />
    </div>
  );
}
