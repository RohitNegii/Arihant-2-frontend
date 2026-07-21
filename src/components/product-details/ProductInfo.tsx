import { ProductData } from "../../services/productListing";

interface ProductInfoProps {
  product: ProductData;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const specs = [
    { label: "Product SKU", value: product.sku },
    { label: "Category", value: product.category?.name || "Jewelry" },
    { label: "Metal Composition", value: product.material },
    { label: "Metal Purity", value: product.purity },
    { label: "Net Weight", value: `${product.weight} grams` },
    { label: "Dimensions", value: product.dimensions || "N/A" },
    { label: "Intended Gender", value: product.gender },
    { label: "Suitable Occasion", value: product.occasion || "Anniversaries & Celebrations" },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 border border-verdant-emerald/5 text-left select-none">
      <span className="text-[8px] uppercase tracking-widest text-verdant-gold font-bold font-mono block mb-2">specifications</span>
      <h3 className="font-serif text-lg text-verdant-emerald font-light mb-4">
        Technical Details & Craft
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
        {specs.map((spec, idx) => (
          <div key={idx} className="flex justify-between items-center py-2.5 border-b border-verdant-emerald/5">
            <span className="text-[9px] tracking-wider uppercase text-verdant-emerald/50 font-bold">
              {spec.label}
            </span>
            <span className="text-xs text-verdant-emerald font-semibold uppercase">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
