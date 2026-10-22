"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { ProductData } from "@/services/productListing";
import { getImageUrl } from "@/utils/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, isVideoUrl } from "./ProductCard";
import styles from "./collection.module.css";

interface QuickViewModalProps {
  product: ProductData;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [variantName, setVariantName] = useState("");
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");
  const addToCart = useCartStore(state => state.addToCart);
  const setCartOpen = useCartStore(state => state.setCartOpen);
  const images = [...new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))];
  const source = images[imageIndex] || "";
  const variant = product.variants?.find(item => item.name === variantName);
  const prices = product.variants?.map(item => item.price) || [];
  const price = product.hasVariants ? variant?.price ?? (prices.length ? Math.min(...prices) : 0) : product.price || 0;
  const outOfStock = product.hasVariants ? (variant ? variant.stock <= 0 : !product.variants?.some(item => item.stock > 0)) : (product.stock ?? 0) <= 0;

  useEffect(() => {
    const element = dialog.current;
    if (isOpen && element && !element.open) element.showModal();
    else if (!isOpen && element?.open) element.close();
  }, [isOpen]);

  const handleAdd = async () => {
    if (product.hasVariants && !variant) { setFeedback("Choose an option first."); return; }
    if ((product.sizes?.length || product.allowCustomSize) && !size.trim()) { setFeedback("Choose your size first."); return; }
    if (!useAuthStore.getState().isAuthenticated) {
      onClose();
      useAuthStore.getState().openAuthModal("login");
      return;
    }
    setAdding(true);
    setFeedback("");
    try {
      if (await addToCart(product._id, 1, size || undefined, variantName || undefined)) {
        onClose(); setCartOpen(true);
        toast.success(`${product.name} added to your bag`);
      } else setFeedback("Couldn’t add this piece. Please try again.");
    } catch { setFeedback("Couldn’t add this piece. Please try again."); }
    finally { setAdding(false); }
  };

  return <dialog ref={dialog} className={`${styles.dialog} ${styles.quickDialog}`} aria-labelledby="quick-view-title" onCancel={onClose} onClose={onClose} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }} data-lenis-prevent>
    <button type="button" className={`${styles.close} ${styles.quickClose}`} aria-label="Close quick view" onClick={onClose}><X aria-hidden="true" /></button>
    <div className={styles.quickLayout}>
      <div>
        {isVideoUrl(source) ? <video src={getImageUrl(source)} className={styles.quickImage} controls muted playsInline preload="metadata" /> : <img src={getImageUrl(source)} alt={product.name} className={styles.quickImage} />}
        {images.length > 1 && <div className={styles.quickThumbs}>
          {images.map((image, index) => <button key={image} type="button" aria-label={`View image ${index + 1}`} aria-pressed={imageIndex === index} onClick={() => setImageIndex(index)}>
            {isVideoUrl(image) ? <span>Film</span> : <img src={getImageUrl(image)} alt="" />}
          </button>)}
        </div>}
      </div>
      <div className={styles.quickContent}>
        <p className={styles.eyebrow}>{product.category?.name || "The collection"}</p>
        <h2 id="quick-view-title" className={styles.quickTitle}>{product.name}</h2>
        <p className={styles.price}>{product.hasVariants && !variant && <small>From</small>}{formatPrice(price)}</p>
        <p className={styles.material}>{[product.purity, product.material].filter(Boolean).join(" · ")}</p>
        <p className={styles.quickDescription}>{product.shortDescription || product.description}</p>
        {product.hasVariants && <fieldset className={styles.quickChoices}>
          <legend>Choose an option</legend>
          <div>{product.variants?.map(item => <button key={item.name} type="button" disabled={item.stock <= 0} aria-pressed={variantName === item.name} onClick={() => setVariantName(item.name)}>{item.name}</button>)}</div>
        </fieldset>}
        {Boolean(product.sizes?.length) && <fieldset className={styles.quickChoices}>
          <legend>Select your size</legend>
          <div>{product.sizes?.map(item => <button key={item} type="button" aria-pressed={size === item} onClick={() => setSize(item)}>{item}</button>)}</div>
        </fieldset>}
        {product.allowCustomSize && <label className={styles.quickChoices}>Custom size
          <input className="mt-2 block w-full border border-verdant-emerald/20 bg-transparent p-3 text-base" value={size} placeholder="Enter your size" onChange={event => setSize(event.target.value)} />
        </label>}
        {feedback && <p role="alert" className="mb-3 text-xs text-verdant-danger">{feedback}</p>}
        <button type="button" className={styles.primaryButton} disabled={outOfStock || adding} onClick={handleAdd}><ShoppingBag aria-hidden="true" />{adding ? "Adding…" : outOfStock ? "Sold out" : "Add to bag"}</button>
        <Link href={`/products/${product.slug}`} className={styles.textButton} onClick={onClose}>Discover this piece</Link>
      </div>
    </div>
  </dialog>;
}
