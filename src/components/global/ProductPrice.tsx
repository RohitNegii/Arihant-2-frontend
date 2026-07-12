interface ProductPriceProps {
  price: number;
  discountPrice?: number;
  className?: string;
}

export default function ProductPrice({ price, discountPrice, className = "" }: ProductPriceProps) {
  const formatPrice = (val: number) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const hasDiscount = discountPrice !== undefined && discountPrice > 0 && discountPrice < price;

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {hasDiscount ? (
        <>
          <span className="text-verdant-gold font-bold text-sm md:text-base">
            {formatPrice(discountPrice)}
          </span>
          <span className="text-verdant-emerald/40 line-through text-xs">
            {formatPrice(price)}
          </span>
        </>
      ) : (
        <span className="text-verdant-emerald font-bold text-sm md:text-base">
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
