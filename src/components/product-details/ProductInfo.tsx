import { ShieldCheck, Award } from "lucide-react";
import { ProductData } from "../../services/productListing";

interface ProductInfoProps {
  product: ProductData;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const specs = [
    { label: "Archive SKU", value: product.sku },
    { label: "Category", value: product.category?.name || "Bespoke Jewelry" },
    { label: "Precious Metal", value: product.material },
    { label: "Metal Purity", value: product.purity },
    { label: "Gross Weight", value: `${product.weight} grams` },
    { label: "Dimensions", value: product.dimensions || "Standard Sizing" },
    { label: "Curated Styling", value: product.gender },
    { label: "Suitable Occasion", value: product.occasion || "Celebrations & Generational Heirlooms" },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-verdant-emerald/10 text-left select-none max-w-4xl mx-auto w-full shadow-[0_4px_25px_rgba(var(--color-primary-rgb),0.02)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-verdant-emerald/10 gap-2 mb-6">
        <div>
          <span className="text-[8px] uppercase tracking-[0.25em] text-verdant-gold font-bold font-mono block mb-1">
            Archival Specifications
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-verdant-emerald font-light">
            Technical Details & Craftsmanship
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] tracking-wider uppercase font-mono font-bold text-verdant-emerald/60 bg-white/60 border border-verdant-emerald/10 px-3 py-1.5 rounded-full self-start sm:self-auto">
          <Award className="w-3.5 h-3.5 text-verdant-gold" />
          <span>Artisan Certified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
        {specs.map((spec, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center py-3 border-b border-verdant-emerald/5 hover:border-verdant-emerald/15 transition-colors"
          >
            <span className="text-[9px] tracking-widest uppercase text-verdant-emerald/60 font-mono font-bold">
              {spec.label}
            </span>
            <span className="text-xs text-verdant-emerald font-semibold uppercase font-sans">
              {spec.value}
            </span>
          </div>
        ))}
      </div>

      {/* Assurance Note */}
      <div className="mt-8 pt-6 border-t border-verdant-emerald/10 flex items-start gap-3 bg-white/40 p-4 rounded-2xl border border-verdant-emerald/5">
        <ShieldCheck className="w-5 h-5 text-verdant-gold shrink-0 mt-0.5" />
        <p className="text-[11px] text-verdant-emerald/75 font-light leading-relaxed">
          Every piece in the Geetej Viraasat collection is laser-inscribed with BIS hallmark certification and accompanied by an official physical Certificate of Authenticity specifying gold karatage, gross weight, and gemstone purity.
        </p>
      </div>
    </div>
  );
}
