"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Plus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/api";
import type { ProductData } from "@/services/productListing";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import styles from "./collection.module.css";

export const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)(?:[?#]|$)/i.test(url);
export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

export default function ProductCard({ product, onQuickView }: { product: ProductData; onQuickView?: (product: ProductData) => void }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);
  const setCartOpen = useCartStore(state => state.setCartOpen);
  const href = `/products/${product.slug}`;
  const outOfStock = product.hasVariants ? !product.variants?.some(variant => variant.stock > 0) : (product.stock ?? 0) <= 0;
  const price = product.hasVariants ? Math.min(...(product.variants?.map(variant => variant.price) || [0])) : product.price || 0;
  const primary = product.thumbnail || product.images?.[0] || "";
  const secondary = product.images?.find(image => image !== primary && !isVideoUrl(image));
  const badge = outOfStock ? "Sold out" : product.isBestSeller ? "Bestseller" : product.isTrending ? "Trending" : product.isFeatured ? "Selected by us" : "";
  const needsChoice = Boolean(product.hasVariants || product.sizes?.length || product.allowCustomSize);

  const quickAdd = async () => {
    if (needsChoice) {
      if (onQuickView) onQuickView(product);
      else router.push(href);
      return;
    }
    if (!useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().openAuthModal("login");
      return;
    }
    setAdding(true);
    try {
      if (await addToCart(product._id, 1)) {
        toast.success(`${product.name} added to your bag`);
        setCartOpen(true);
      } else toast.error("Couldn’t add this piece. Please try again.");
    } catch { toast.error("Couldn’t add this piece. Please try again."); }
    finally { setAdding(false); }
  };

  return <article className={styles.card}>
    <div className={styles.imageWrap}>
      <Link href={href} className={styles.imageLink} aria-label={`View ${product.name}`}>
        {isVideoUrl(primary) ? <video src={getImageUrl(primary)} className={styles.primary} muted playsInline preload="metadata" aria-label={product.name} /> : <>
          <img src={getImageUrl(primary)} alt={product.name} className={`${styles.primary} ${secondary ? styles.hasSecondary : ""}`} loading="lazy" decoding="async" />
          {secondary && <img src={getImageUrl(secondary)} alt="" className={styles.secondary} loading="lazy" decoding="async" />}
        </>}
      </Link>
      {badge && <span className={styles.badge}>{badge}</span>}
      {onQuickView && <button type="button" className={styles.quickView} aria-label={`Quick view ${product.name}`} onClick={() => onQuickView(product)}><Eye aria-hidden="true" /></button>}
    </div>
    <div className={styles.cardBody}>
      <h2 className={styles.cardTitle}><Link href={href}>{product.name}</Link></h2>
      <p className={styles.material}>{[product.purity, product.material].filter(Boolean).join(" · ") || product.category?.name || "Jewellery"}</p>
      <div className={styles.cardBottom}>
        <p className={styles.price}>{product.hasVariants && <small>From</small>}{formatPrice(Number.isFinite(price) ? price : 0)}</p>
        <button type="button" className={styles.add} disabled={outOfStock || adding} aria-label={outOfStock ? `${product.name} is sold out` : needsChoice ? `Choose options for ${product.name}` : `Add ${product.name} to bag`} onClick={quickAdd}>
          {adding ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
        </button>
      </div>
    </div>
  </article>;
}
