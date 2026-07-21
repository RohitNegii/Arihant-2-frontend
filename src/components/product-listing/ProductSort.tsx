"use client";

interface ProductSortProps {
  value: string;
  onChange: (val: string) => void;
}

export default function ProductSort({ value, onChange }: ProductSortProps) {
  const options = [
    { label: "LATEST INCLUSIONS", value: "latest" },
    { label: "PRICE: LOW TO HIGH", value: "price-asc" },
    { label: "PRICE: HIGH TO LOW", value: "price-desc" },
    { label: "FEATURED EXHIBITS", value: "featured" },
    { label: "BESTSELLING SELECTION", value: "bestselling" },
  ];

  return (
    <div className="relative inline-block w-48">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white/40 border border-verdant-emerald/10 text-verdant-emerald text-[9px] tracking-widest font-bold uppercase rounded-full px-5 py-3 pr-10 focus:outline-hidden focus:border-verdant-gold focus:bg-white/80 transition-all duration-300 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#FAF7F2] text-verdant-emerald font-bold">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-verdant-gold">
        <svg
          className="w-3 h-3 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
