interface ProductPriceProps {
  price: number;
  discountPrice?: number;
  className?: string;
}

export default function ProductPrice({ price, className = "" }: ProductPriceProps) {
  const formatPrice = (val: number) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <span className="text-verdant-emerald font-bold text-sm md:text-base font-mono">
        {formatPrice(price)}
      </span>
    </div>
  );
}
