"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, Columns2, Grid2X2, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CrestMark from "@/components/global/CrestMark";
import ProductSearch from "@/components/product-listing/ProductSearch";
import ProductSort from "@/components/product-listing/ProductSort";
import ProductFilters, { type FilterState } from "@/components/product-listing/ProductFilters";
import ProductGrid from "@/components/product-listing/ProductGrid";
import QuickViewModal from "@/components/product-listing/QuickViewModal";
import { useScrollLock } from "@/hooks/useScrollLock";
import { scrollToOffset } from "@/store/scroll-store";
import { fetchProducts, fetchCategories, type ProductData, type CategoryData } from "@/services/productListing";
import styles from "@/components/product-listing/collection.module.css";

const EMPTY_FILTERS: FilterState = {
  category: "", material: "", gender: "", minPrice: "", maxPrice: "", availability: "", highlight: "",
};

function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(2, current - 1), end = Math.min(total - 1, current + 1);
  return [1, ...(start > 2 ? ["gap" as const] : []),
    ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
    ...(end < total - 1 ? ["gap" as const] : []), total];
}

export default function ProductListingPage() {
  return <Suspense fallback={<div className={styles.page}><Navbar /><CollectionBanner /><main className={styles.main}><p role="status">Loading the collection…</p></main></div>}><CollectionRoute /></Suspense>;
}

function CollectionBanner() {
  return <header className={styles.banner} aria-labelledby="collection-title">
    <div className={styles.bannerImage} aria-hidden="true" />
    <div className={styles.bannerOverlay} aria-hidden="true" />
    <div className={styles.bannerContent}>
      <div className={styles.bannerCard}>
        <p className={styles.bannerEyebrow}><CrestMark size={18} /> Geetej Viraasat</p>
        <h1 id="collection-title" className={styles.bannerTitle}>The Jewellery Collection</h1>
        <p className={styles.bannerDescription}>Discover thoughtfully crafted pieces for everyday moments and lasting memories.</p>
      </div>
    </div>
  </header>;
}

function CollectionRoute() {
  const params = useSearchParams();
  return <Collection key={params.toString()} initialFilters={{ ...EMPTY_FILTERS,
    category: params.get("category") || "",
    gender: params.get("gender") || "",
    highlight: params.get("highlight") || "",
  }} />;
}

function Collection({ initialFilters }: { initialFilters: FilterState }) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [result, setResult] = useState<{ key: string; products: ProductData[]; pages: number; count: number; error: boolean } | null>(null);
  const [retry, setRetry] = useState(0);
  const [columns, setColumns] = useState<2 | 4>(4);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductData | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const requestKey = JSON.stringify({ page, search, sort, filters, retry });
  const loading = result?.key !== requestKey;
  const error = !loading && result?.error;
  const products = result?.products || [];
  const totalPages = result?.pages || 1;
  const totalCount = result?.count || 0;
  const drawer = useRef<HTMLDialogElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  useScrollLock(filtersOpen || quickViewProduct !== null);

  useEffect(() => {
    let live = true;
    void fetchCategories().then(res => {
      if (live && res.success) setCategories(res.categories);
    }).catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let live = true;
    void fetchProducts({ page, limit: 12, search, sort, ...filters }).then(res => {
      if (!live) return;
      if (!res.success) throw new Error("Collection unavailable");
      setResult({ key: requestKey, products: res.products, pages: res.pages, count: res.count, error: false });
    }).catch(() => {
      if (live) setResult({ key: requestKey, products: [], pages: 1, count: 0, error: true });
    });
    return () => { live = false; };
  }, [page, search, sort, filters, requestKey]);

  useEffect(() => {
    const dialog = drawer.current;
    if (filtersOpen && dialog && !dialog.open) dialog.showModal();
    else if (!filtersOpen && dialog?.open) dialog.close();
  }, [filtersOpen]);

  const changeFilters = (updates: Partial<FilterState>) => {
    setFilters(current => ({ ...current, ...updates }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS); setSearch(""); setPage(1);
  };
  const changeSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);
  const changePage = (value: number) => {
    setPage(value);
    if (grid.current) scrollToOffset(Math.max(0, grid.current.getBoundingClientRect().top + window.scrollY - 100));
  };
  const openFilters = () => { setDraftFilters({ ...filters }); setFiltersOpen(true); };
  const categoryName = categories.find(category => category.slug === filters.category)?.name;
  const activeFilters: { label: string; remove: () => void }[] = [];
  if (filters.category) activeFilters.push({ label: categoryName || filters.category, remove: () => changeFilters({ category: "" }) });
  if (filters.material) activeFilters.push({ label: filters.material, remove: () => changeFilters({ material: "" }) });
  if (filters.gender) activeFilters.push({ label: filters.gender, remove: () => changeFilters({ gender: "" }) });
  if (filters.highlight) activeFilters.push({ label: ({ featured: "Featured", trending: "Trending", bestseller: "Bestsellers" } as Record<string, string>)[filters.highlight] || filters.highlight, remove: () => changeFilters({ highlight: "" }) });
  if (filters.minPrice || filters.maxPrice) activeFilters.push({
    label: `₹${Number(filters.minPrice || 0).toLocaleString("en-IN")} – ${filters.maxPrice ? `₹${Number(filters.maxPrice).toLocaleString("en-IN")}` : "and above"}`,
    remove: () => changeFilters({ minPrice: "", maxPrice: "" }),
  });
  if (filters.availability) activeFilters.push({ label: "In stock", remove: () => changeFilters({ availability: "" }) });
  if (search) activeFilters.push({ label: `“${search}”`, remove: () => changeSearch("") });

  return (
    <div className={styles.page}>
      <Navbar />
      <CollectionBanner />
      <main className={styles.main}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link><ChevronRight aria-hidden="true" /><span aria-current="page">Jewellery</span>
        </nav>
        <div className={styles.categories} role="group" aria-label="Shop by category">
          <button className={styles.category} type="button" aria-pressed={!filters.category} onClick={() => changeFilters({ category: "" })}>All jewellery</button>
          {categories.map(category => (
            <button key={category._id} className={styles.category} type="button" aria-pressed={filters.category === category.slug} onClick={() => changeFilters({ category: category.slug })}>{category.name}</button>
          ))}
        </div>

        <div className={styles.toolbar}>
          <p className={styles.count} aria-live="polite">{loading ? "Finding your next favourite…" : error ? "The collection" : `${totalCount} piece${totalCount === 1 ? "" : "s"}`}</p>
          <div className={styles.controls}>
            <ProductSearch value={search} onChange={changeSearch} />
            <button type="button" className={styles.filterButton} onClick={openFilters} aria-haspopup="dialog" aria-controls="collection-filters" aria-expanded={filtersOpen}>
              <SlidersHorizontal aria-hidden="true" /> Filters {activeFilters.length > 0 && <span className={styles.filterCount}>{activeFilters.length}</span>}
            </button>
            <ProductSort value={sort} onChange={value => { setSort(value); setPage(1); }} />
            <div className={styles.views} role="group" aria-label="Product layout">
              <button type="button" aria-label="Two columns" aria-pressed={columns === 2} onClick={() => setColumns(2)}><Columns2 aria-hidden="true" /></button>
              <button type="button" aria-label="Four columns" aria-pressed={columns === 4} onClick={() => setColumns(4)}><Grid2X2 aria-hidden="true" /></button>
            </div>
          </div>
        </div>

        {activeFilters.length > 0 && <div className={styles.chips} aria-label="Active filters">
          {activeFilters.map(filter => <button key={filter.label} type="button" className={styles.chip} onClick={filter.remove} aria-label={`Remove ${filter.label} filter`}>{filter.label}<X aria-hidden="true" /></button>)}
          <button type="button" className={styles.textButton} onClick={clearFilters}>Clear all</button>
        </div>}

        <div ref={grid} aria-busy={loading}>
          {error ? <div className={styles.empty} role="status">
            <h2>A little pause in browsing.</h2>
            <p>We couldn’t load the collection. Please try again in a moment.</p>
            <button type="button" className={styles.primaryButton} onClick={() => setRetry(value => value + 1)}>Try again</button>
          </div> : loading ? <div className={`${styles.grid} ${columns === 2 ? styles.gridWide : ""}`} role="status" aria-label="Loading jewellery">
            {Array.from({ length: 8 }, (_, index) => <div key={index} aria-hidden="true"><div className={styles.skeletonImage} /><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></div>)}
          </div> : <ProductGrid products={products} columns={columns} onQuickView={setQuickViewProduct} onClearFilters={clearFilters} />}
        </div>

        {!loading && !error && totalCount > 0 && <>
          {totalPages > 1 && <nav className={styles.pagination} aria-label="Collection pages">
            <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => changePage(page - 1)}><ArrowLeft aria-hidden="true" /></button>
            {pageWindow(page, totalPages).map((number, index) => number === "gap" ? <span key={`gap-${index}`}>…</span> :
              <button key={number} type="button" aria-label={`Page ${number}`} aria-current={page === number ? "page" : undefined} onClick={() => changePage(number)}>{number}</button>)}
            <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => changePage(page + 1)}><ArrowRight aria-hidden="true" /></button>
          </nav>}
          <p className={styles.pageNote}>Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, totalCount)} of {totalCount} pieces</p>
        </>}
      </main>

      <dialog ref={drawer} id="collection-filters" aria-labelledby="filter-title" className={`${styles.dialog} ${styles.drawer}`} onCancel={() => setFiltersOpen(false)} onClose={() => setFiltersOpen(false)} onClick={event => {
        if (event.target === event.currentTarget && event.clientX < event.currentTarget.getBoundingClientRect().left) setFiltersOpen(false);
      }}>
        <div className={styles.dialogHeader}>
          <div><p className={styles.eyebrow}>Make it personal</p><h2 id="filter-title">Refine your selection</h2></div>
          <button type="button" className={styles.close} aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X aria-hidden="true" /></button>
        </div>
        <div className={styles.drawerBody} data-lenis-prevent>
          <ProductFilters filters={draftFilters} categories={categories} onChange={updates => setDraftFilters(current => ({ ...current, ...updates }))} />
        </div>
        <div className={styles.drawerFooter}>
          <button type="button" className={styles.textButton} onClick={() => setDraftFilters(EMPTY_FILTERS)}>Clear filters</button>
          <button type="button" className={styles.primaryButton} onClick={() => { setFilters(draftFilters); setPage(1); setFiltersOpen(false); }}>Show results <ArrowRight aria-hidden="true" /></button>
        </div>
      </dialog>
      {quickViewProduct && <QuickViewModal key={quickViewProduct._id} product={quickViewProduct} isOpen onClose={() => setQuickViewProduct(null)} />}
      <Footer />
    </div>
  );
}
