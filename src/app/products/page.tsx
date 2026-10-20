"use client";

import { useState, useEffect, useRef } from "react";
import {
  List,
  Sparkles,
  Filter,
  X,
  Columns3,
  LayoutGrid,
  ShieldCheck,
  Truck,
  Award,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { useScroll, useTransform, motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/sections/Navbar";
import MouseFollower from "@/components/MouseFollower";
import Footer from "@/components/sections/Footer";
import Breadcrumb from "@/components/global/Breadcrumb";
import ProductSearch from "@/components/product-listing/ProductSearch";
import ProductSort from "@/components/product-listing/ProductSort";
import ProductFilters from "@/components/product-listing/ProductFilters";
import ProductGrid from "@/components/product-listing/ProductGrid";
import QuickViewModal from "@/components/product-listing/QuickViewModal";
import { ProductGridSkeleton } from "@/components/global/LoadingSkeleton";
import {
  fetchProducts,
  fetchCategories,
  ProductData,
  CategoryData,
} from "@/services/productListing";

function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  const out: (number | "gap")[] = [1];

  if (start > 2) out.push("gap");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total - 1) out.push("gap");
  out.push(total);

  return out;
}

export default function ProductListingPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: bannerScroll } = useScroll({
    target: bannerRef,
    offset: ["start start", "end start"],
  });
  const bannerY = useTransform(bannerScroll, [0, 1], ["0%", "25%"]);

  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isListView, setIsListView] = useState(false);
  const [gridColumns, setGridColumns] = useState<3 | 4>(3);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductData | null>(null);

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
    highlight: "",
  });

  // Fetch Categories for Palmonas-style carousel pills
  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        if (res.success && mounted) {
          setCategories(res.categories);
        }
      } catch {
        // Ignored
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Deep link from showroom finale or curated links (/products?gender=Men, /products?highlight=trending, /products?category=rings).
  // Applied on mount rather than as the initial state for prerendering parity.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gender = params.get("gender");
    const highlight = params.get("highlight");
    const category = params.get("category");
    if (gender || highlight || category) {
      setFilters((f) => ({
        ...f,
        ...(gender ? { gender } : {}),
        ...(highlight ? { highlight } : {}),
        ...(category ? { category } : {}),
      }));
    }
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts({
        page,
        limit: 12, // Increased from 6 to 12 for luxurious 3/4-column multi-row grid
        search,
        sort,
        ...filters,
      });

      if (res.success) {
        setProducts(res.products);
        setTotalPages(res.pages);
        setTotalCount(res.count);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, sort, filters, page]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const top = grid.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }, [page]);

  const handleFilterChange = (updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      material: "",
      gender: "",
      minPrice: "",
      maxPrice: "",
      availability: "",
      highlight: "",
    });
    setSearch("");
    setSort("latest");
    setPage(1);
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "High Jewelry Collections" },
  ];

  // Active filter facets count & list for Swarovski-style chips
  const activeFiltersList: { label: string; key: keyof typeof filters | "search"; onRemove: () => void }[] = [];

  if (filters.highlight) {
    const highlightLabels: Record<string, string> = {
      featured: "Exhibit: Featured",
      trending: "Exhibit: Trending",
      bestseller: "Exhibit: Best Sellers",
    };
    activeFiltersList.push({
      label: highlightLabels[filters.highlight] || `Exhibit: ${filters.highlight}`,
      key: "highlight",
      onRemove: () => handleFilterChange({ highlight: "" }),
    });
  }
  if (filters.category) {
    const catName = categories.find((c) => c.slug === filters.category)?.name || filters.category;
    activeFiltersList.push({
      label: `Category: ${catName}`,
      key: "category",
      onRemove: () => handleFilterChange({ category: "" }),
    });
  }
  if (filters.material) {
    activeFiltersList.push({
      label: `Metal: ${filters.material}`,
      key: "material",
      onRemove: () => handleFilterChange({ material: "" }),
    });
  }
  if (filters.gender) {
    activeFiltersList.push({
      label: `Styling: ${filters.gender}`,
      key: "gender",
      onRemove: () => handleFilterChange({ gender: "" }),
    });
  }
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `₹${Number(filters.minPrice).toLocaleString("en-IN")}` : "₹0";
    const max = filters.maxPrice ? `₹${Number(filters.maxPrice).toLocaleString("en-IN")}` : "Above";
    activeFiltersList.push({
      label: `Price: ${min} – ${max}`,
      key: "minPrice",
      onRemove: () => handleFilterChange({ minPrice: "", maxPrice: "" }),
    });
  }
  if (filters.availability) {
    activeFiltersList.push({
      label: "In Stock Only",
      key: "availability",
      onRemove: () => handleFilterChange({ availability: "" }),
    });
  }
  if (search) {
    activeFiltersList.push({
      label: `Search: "${search}"`,
      key: "search",
      onRemove: () => setSearch(""),
    });
  }

  const activeFilterCount = activeFiltersList.length;

  return (
    <div className="min-h-screen bg-verdant-cream text-verdant-emerald selection:bg-verdant-emerald/15 select-none relative">
      <MouseFollower />
      <Navbar />

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[8%] left-[-15%] w-[45vw] h-[45vw] bg-radial from-verdant-gold/5 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute top-[35%] right-[-15%] w-[45vw] h-[45vw] bg-radial from-verdant-emerald/4 to-transparent blur-[140px] pointer-events-none" />
      </div>

      {/* Hero Exhibition Header */}
      <div
        ref={bannerRef}
        className="relative pt-36 sm:pt-40 pb-16 overflow-hidden border-b border-verdant-emerald/10 text-center flex items-center justify-center min-h-[340px]"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            className="absolute top-[-25%] left-0 w-full h-[150%] bg-cover bg-center bg-no-repeat brightness-[0.32]"
            style={{
              backgroundImage: "url('/images/products/ksp_17.jpg')",
              y: bannerY,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-verdant-emerald/95 via-verdant-emerald/75 to-verdant-cream" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-verdant-gold/40 bg-verdant-gold/15 mb-5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-verdant-gold animate-pulse" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-verdant-gold font-bold">
              Signature Exhibition • High Jewelry
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wider text-white font-extralight leading-tight uppercase"
          >
            The <span className="text-verdant-gold font-serif italic font-normal">Bespoke</span> Collections
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-16 h-[1px] bg-verdant-gold/50 my-5"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white/80 text-xs sm:text-sm font-light leading-relaxed tracking-widest max-w-xl text-center"
          >
            Architectural geometry, rare solitaires, and BIS hallmarked precious metals. Masterpieces designed to be passed down through generations.
          </motion.p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6 pb-20">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbs} />

        {/* Palmonas-style Horizontal Category Pills / Carousel */}
        <div className="mt-6 pb-2 border-b border-verdant-emerald/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none select-none">
            {/* All Pieces Pill */}
            <button
              type="button"
              onClick={() => handleFilterChange({ category: "" })}
              className={`shrink-0 text-[10px] tracking-widest uppercase font-bold px-4 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-2 ${
                filters.category === ""
                  ? "bg-verdant-emerald text-white border-verdant-gold/60 shadow-md scale-102"
                  : "border-verdant-emerald/15 text-verdant-emerald/80 hover:bg-verdant-emerald/5 bg-white/50"
              }`}
            >
              <span>All Pieces</span>
              {filters.category === "" && (
                <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold" />
              )}
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => {
              const isActive = filters.category === cat.slug;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleFilterChange({ category: isActive ? "" : cat.slug })}
                  className={`shrink-0 text-[10px] tracking-widest uppercase font-bold px-4 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-verdant-emerald text-white border-verdant-gold/60 shadow-md scale-102"
                      : "border-verdant-emerald/15 text-verdant-emerald/80 hover:bg-verdant-emerald/5 bg-white/50"
                  }`}
                >
                  <span>{cat.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-verdant-gold" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Swarovski-style Sticky Curation Bar */}
        <div className="sticky top-16 md:top-20 z-30 bg-verdant-cream/95 backdrop-blur-md py-3.5 mt-4 mb-6 border-y border-verdant-emerald/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          {/* Left: Total Count & Filter Drawer Trigger */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => {
                // On mobile open mobile drawer, on desktop toggle sidebar panel
                if (window.innerWidth < 1024) {
                  setShowMobileFilters(true);
                } else {
                  setShowDesktopFilters((prev) => !prev);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-verdant-emerald/20 hover:border-verdant-gold text-verdant-emerald text-[9px] tracking-widest font-bold uppercase hover:bg-verdant-emerald/5 transition-all cursor-pointer bg-white/40 shadow-xs shrink-0"
              aria-label="Toggle Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-verdant-gold" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-verdant-gold text-black text-[9px] font-bold flex items-center justify-center ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Total Results Counter */}
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-verdant-emerald/70 font-mono">
              CURATING {totalCount} MASTERPIECE{totalCount !== 1 ? "S" : ""}
            </span>
          </div>

          {/* Right: Search, Sort & Layout Switcher */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3">
            <div className="w-full max-w-[200px] sm:max-w-xs">
              <ProductSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
            </div>

            <div className="shrink-0">
              <ProductSort value={sort} onChange={(val) => { setSort(val); setPage(1); }} />
            </div>

            {/* Swarovski-style Layout Switcher (Desktop 3-col / 4-col / List) */}
            <div className="hidden sm:flex items-center border border-verdant-emerald/15 rounded-full p-1 bg-white/60 shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setIsListView(false);
                  setGridColumns(3);
                }}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  !isListView && gridColumns === 3
                    ? "bg-verdant-emerald text-white shadow-xs"
                    : "text-verdant-emerald/60 hover:text-verdant-emerald"
                }`}
                title="3-Column Grid"
                aria-label="3-Column Grid"
              >
                <Columns3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsListView(false);
                  setGridColumns(4);
                  // Auto-collapse sidebar if wide 4-column selected for max immersion
                  if (showDesktopFilters) setShowDesktopFilters(false);
                }}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  !isListView && gridColumns === 4
                    ? "bg-verdant-emerald text-white shadow-xs"
                    : "text-verdant-emerald/60 hover:text-verdant-emerald"
                }`}
                title="4-Column Grid"
                aria-label="4-Column Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsListView(true)}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isListView
                    ? "bg-verdant-emerald text-white shadow-xs"
                    : "text-verdant-emerald/60 hover:text-verdant-emerald"
                }`}
                title="Editorial List View"
                aria-label="Editorial List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Swarovski-style Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 mb-6 p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-verdant-emerald/10 shadow-xs">
            <div className="flex items-center gap-1.5 mr-1 text-[9px] uppercase tracking-[0.2em] text-verdant-gold font-bold font-mono">
              <Sparkles className="w-3 h-3 text-verdant-gold animate-pulse" />
              <span>Active Curation ({activeFilterCount}):</span>
            </div>
            {activeFiltersList.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={filter.onRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-verdant-emerald text-[9px] tracking-wider uppercase font-bold border border-verdant-emerald/15 hover:border-verdant-gold shadow-2xs transition-all cursor-pointer group active:scale-95"
              >
                <span>{filter.label}</span>
                <span className="w-4 h-4 rounded-full bg-verdant-emerald/10 group-hover:bg-verdant-danger/10 flex items-center justify-center transition-colors">
                  <X className="w-2.5 h-2.5 text-verdant-emerald/60 group-hover:text-verdant-danger transition-colors" />
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-verdant-emerald/60 hover:text-verdant-gold flex items-center gap-1 text-[8px] tracking-widest uppercase font-bold ml-auto transition-colors cursor-pointer py-1.5 px-3 rounded-full hover:bg-verdant-emerald/5"
            >
              <RotateCcw className="w-3 h-3" /> Clear All
            </button>
          </div>
        )}

        {/* Content Section: Sidebar Filters + Products Grid */}
        <div
          className={`grid gap-8 items-start ${
            showDesktopFilters && !isListView
              ? "grid-cols-1 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {/* Desktop Filter Sidebar (Collapsible for wide screen view) */}
          {showDesktopFilters && (
            <div className="hidden lg:block lg:col-span-1 sticky top-36 self-start">
              <ProductFilters
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          )}

          {/* Mobile Slide-in Filters Drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                />

                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="w-[88vw] max-w-sm h-full bg-verdant-cream p-6 overflow-y-auto relative shadow-2xl flex flex-col justify-between z-10 custom-scrollbar"
                >
                  <div>
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-verdant-emerald/10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-verdant-emerald/10 border border-verdant-gold/30 flex items-center justify-center text-verdant-gold shrink-0">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-light tracking-wide uppercase text-verdant-emerald">
                            Curation Filters
                          </h3>
                          {activeFilterCount > 0 && (
                            <span className="text-[8px] text-verdant-gold font-mono font-bold tracking-widest uppercase">
                              {activeFilterCount} Active Filter{activeFilterCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-verdant-emerald/60 hover:text-verdant-gold text-[8px] tracking-widest font-bold uppercase transition-colors py-1 px-1.5"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowMobileFilters(false)}
                          className="text-verdant-emerald/60 hover:text-verdant-emerald bg-white/70 p-2 rounded-full border border-verdant-emerald/10 cursor-pointer shadow-xs active:scale-95"
                          aria-label="Close Filters"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <ProductFilters
                        filters={filters}
                        onChange={handleFilterChange}
                        onClear={handleClearFilters}
                        hideHeader={true}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-verdant-emerald/10 mt-6 sticky bottom-0 bg-verdant-cream pb-2">
                    <button
                      type="button"
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full gold-gradient-bg text-black font-bold text-[10px] tracking-[0.2em] uppercase py-3.5 rounded-full shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Show {totalCount} Masterpieces</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Products Feed display */}
          <div
            ref={gridRef}
            className={showDesktopFilters && !isListView ? "lg:col-span-3" : "w-full"}
          >
            {loading && page === 1 ? (
              <ProductGridSkeleton />
            ) : (
              <>
                <ProductGrid
                  products={products}
                  isListView={isListView}
                  columns={gridColumns}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  onClearFilters={handleClearFilters}
                />

                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="flex flex-wrap justify-center items-center gap-2 mt-14 font-mono text-xs select-none"
                  >
                    <button
                      onClick={() => page > 1 && setPage(page - 1)}
                      disabled={page === 1}
                      className="w-11 h-11 shrink-0 rounded-full border border-verdant-emerald/15 flex items-center justify-center text-verdant-emerald hover:border-verdant-gold hover:text-verdant-gold disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-bold bg-white/40 shadow-xs"
                      aria-label="Previous Page"
                    >
                      &larr;
                    </button>

                    <span className="sm:hidden px-3 text-[10px] tracking-widest uppercase font-bold text-verdant-emerald/60">
                      Page {page} / {totalPages}
                    </span>

                    <div className="hidden sm:flex items-center gap-2">
                      {pageWindow(page, totalPages).map((p, i) =>
                        p === "gap" ? (
                          <span
                            key={`gap-${i}`}
                            aria-hidden
                            className="w-6 text-center text-verdant-emerald/30 font-bold"
                          >
                            &hellip;
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            aria-current={page === p ? "page" : undefined}
                            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer ${
                              page === p
                                ? "bg-verdant-emerald text-verdant-cream shadow-md scale-105"
                                : "border border-verdant-emerald/15 text-verdant-emerald hover:border-verdant-gold hover:text-verdant-gold bg-white/40"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => page < totalPages && setPage(page + 1)}
                      disabled={page === totalPages}
                      className="w-11 h-11 shrink-0 rounded-full border border-verdant-emerald/15 flex items-center justify-center text-verdant-emerald hover:border-verdant-gold hover:text-verdant-gold disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-bold bg-white/40 shadow-xs"
                      aria-label="Next Page"
                    >
                      &rarr;
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Palmonas & Swarovski-style Luxury Trust & Quality Strip */}
      <section className="border-t border-verdant-emerald/10 bg-gradient-to-b from-white/60 to-verdant-cream py-16 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pillar 1 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-verdant-emerald/5 bg-white/50 shadow-xs hover:border-verdant-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-verdant-emerald/10 border border-verdant-gold/30 flex items-center justify-center shrink-0 text-verdant-gold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-verdant-emerald mb-1">
                  100% Certified Purity
                </h4>
                <p className="text-[11px] text-verdant-emerald/70 font-light leading-relaxed">
                  Every creation carries BIS laser hallmark verification and international gemological certifications.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-verdant-emerald/5 bg-white/50 shadow-xs hover:border-verdant-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-verdant-emerald/10 border border-verdant-gold/30 flex items-center justify-center shrink-0 text-verdant-gold">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-verdant-emerald mb-1">
                  Lifetime Exchange
                </h4>
                <p className="text-[11px] text-verdant-emerald/70 font-light leading-relaxed">
                  Transparent heirloom buyback and upgrade guarantees with prevailing bullion valuations.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-verdant-emerald/5 bg-white/50 shadow-xs hover:border-verdant-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-verdant-emerald/10 border border-verdant-gold/30 flex items-center justify-center shrink-0 text-verdant-gold">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-verdant-emerald mb-1">
                  Insured Delivery
                </h4>
                <p className="text-[11px] text-verdant-emerald/70 font-light leading-relaxed">
                  Tamper-evident armored packaging with complete end-to-end insurance straight to your door.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-verdant-emerald/5 bg-white/50 shadow-xs hover:border-verdant-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-verdant-emerald/10 border border-verdant-gold/30 flex items-center justify-center shrink-0 text-verdant-gold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-verdant-emerald mb-1">
                  Artisanal Heritage
                </h4>
                <p className="text-[11px] text-verdant-emerald/70 font-light leading-relaxed">
                  Crafted by master goldsmiths honoring generational traditions and architectural precision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  );
}
