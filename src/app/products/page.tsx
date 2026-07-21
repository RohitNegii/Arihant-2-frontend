"use client";

import { useState, useEffect, useRef } from "react";
import { Grid, List, Sparkles, Filter, X } from "lucide-react";
import { useScroll, useTransform, motion } from "framer-motion";
import Navbar from "@/components/sections/Navbar";
import MouseFollower from "@/components/MouseFollower";
import Footer from "@/components/sections/Footer";
import Breadcrumb from "@/components/global/Breadcrumb";
import ProductSearch from "@/components/product-listing/ProductSearch";
import ProductSort from "@/components/product-listing/ProductSort";
import ProductFilters from "@/components/product-listing/ProductFilters";
import ProductGrid from "@/components/product-listing/ProductGrid";
import { ProductGridSkeleton } from "@/components/global/LoadingSkeleton";
import { fetchProducts, ProductData } from "@/services/productListing";

export default function ProductListingPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: bannerScroll } = useScroll({
    target: bannerRef,
    offset: ["start start", "end start"],
  });
  const bannerY = useTransform(bannerScroll, [0, 1], ["0%", "30%"]);

  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isListView, setIsListView] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    category: "",
    material: "",
    gender: "",
    minPrice: "",
    maxPrice: "",
    availability: "",
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts({
        page,
        limit: 6,
        search,
        sort,
        ...filters,
      });

      if (res.success) {
        setProducts(res.products);
        setTotalPages(res.pages);
        setTotalCount(res.count);
      }
    } catch (err) {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, sort, filters, page]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  }, [page]);

  const handleFilterChange = (updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1); // reset to page 1
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      material: "",
      gender: "",
      minPrice: "",
      maxPrice: "",
      availability: "",
    });
    setSearch("");
    setSort("latest");
    setPage(1);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collections" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-verdant-emerald selection:bg-verdant-emerald/15 select-none relative overflow-x-hidden">
      <MouseFollower />
      <Navbar />

      {/* Decorative Glows */}
      <div className="absolute top-[10%] left-[-15%] w-[40vw] h-[40vw] bg-radial from-[#C8A96A]/4 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-15%] w-[40vw] h-[40vw] bg-radial from-[#0F4C3A]/3 to-transparent blur-[140px] pointer-events-none" />

      {/* Hero Exhibition Header */}
      <div
        ref={bannerRef}
        className="relative pt-36 pb-16 overflow-hidden border-b border-verdant-emerald/5 text-center flex items-center justify-center min-h-[300px]"
      >
        {/* Parallax Background Image Container */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            className="absolute top-[-25%] left-0 w-full h-[150%] bg-cover bg-center bg-no-repeat brightness-[0.35]"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=2000&q=80')",
              y: bannerY
            }}
          />
          {/* Rich luxury emerald gradient overlay fading to cream at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F4C3A]/90 via-[#0F4C3A]/65 to-[#FAF7F2]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-verdant-gold/30 bg-verdant-gold/10 mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-verdant-gold animate-pulse" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-verdant-gold font-bold">
              Signature Exhibition
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-4xl md:text-6xl tracking-wider text-white font-extralight leading-tight uppercase"
          >
            The <span className="text-verdant-gold font-serif italic font-normal">Bespoke</span> Collections
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-16 h-[1px] bg-verdant-gold/50 my-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white/80 text-xs md:text-sm font-light leading-relaxed tracking-widest max-w-xl text-center"
          >
            Step into the archives of architectural geometry and rare gemstone leveling. Cultivated under strict ethical sourcing promises.
          </motion.p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 pb-16">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbs} />

        {/* Curation toolbar controls */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mt-6 pb-6 border-b border-verdant-emerald/5">
          <ProductSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Mobile Filters Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border border-verdant-emerald/10 text-verdant-emerald text-[9px] tracking-widest font-bold uppercase hover:bg-verdant-emerald/5 hover:border-verdant-gold/50 transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>

            <div className="flex items-center gap-4">
              <ProductSort value={sort} onChange={(val) => { setSort(val); setPage(1); }} />

              {/* Grid/List View Toggles */}
              <div className="hidden sm:flex items-center border border-verdant-emerald/10 rounded-full p-1 bg-white/40 h-10">
                <button
                  onClick={() => setIsListView(false)}
                  className={`p-1.5 rounded-full transition-all ${
                    !isListView ? "bg-verdant-emerald text-white" : "text-verdant-emerald/60 hover:text-verdant-emerald"
                  }`}
                  aria-label="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsListView(true)}
                  className={`p-1.5 rounded-full transition-all ${
                    isListView ? "bg-verdant-emerald text-white" : "text-verdant-emerald/60 hover:text-verdant-emerald"
                  }`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8 items-start">
          {/* Desktop Filters Panel */}
          <div className="hidden lg:block lg:col-span-1 sticky top-28 self-start">
            <ProductFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>

          {/* Mobile Slide-in Filters Modal Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end lg:hidden">
              <div className="w-[80vw] max-w-sm h-full bg-[#FAF7F2] p-6 overflow-y-auto relative shadow-2xl flex flex-col gap-6">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="absolute top-6 right-6 text-verdant-emerald/50 hover:text-verdant-emerald bg-white/50 p-2 rounded-full border border-verdant-emerald/10 cursor-pointer"
                  aria-label="Close Filters"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-8">
                  <ProductFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Feed display */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald/55">
                CURATING {totalCount} MASTERPIECE{totalCount !== 1 ? "S" : ""}
              </span>
            </div>

            {loading && page === 1 ? (
              <ProductGridSkeleton />
            ) : (
              <>
                <ProductGrid
                  products={products}
                  isListView={isListView}
                  onClearFilters={handleClearFilters}
                />

                {/* Numeric Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 font-mono text-xs select-none">
                    <button
                      onClick={() => page > 1 && setPage(page - 1)}
                      disabled={page === 1}
                      className="w-10 h-10 rounded-full border border-verdant-emerald/10 flex items-center justify-center text-verdant-emerald hover:border-verdant-gold hover:text-verdant-gold disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-bold"
                      aria-label="Previous Page"
                    >
                      &larr;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer ${
                          page === p
                            ? "bg-verdant-emerald text-white shadow-md scale-105 animate-pulse"
                            : "border border-verdant-emerald/10 text-verdant-emerald hover:border-verdant-gold hover:text-verdant-gold"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => page < totalPages && setPage(page + 1)}
                      disabled={page === totalPages}
                      className="w-10 h-10 rounded-full border border-verdant-emerald/10 flex items-center justify-center text-verdant-emerald hover:border-verdant-gold hover:text-verdant-gold disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-bold"
                      aria-label="Next Page"
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
