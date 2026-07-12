export function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-verdant-emerald/5 flex flex-col h-full animate-pulse select-none">
      <div className="w-full aspect-square bg-verdant-emerald/5 relative flex items-center justify-center" />
      <div className="p-6 flex flex-col flex-1 gap-3">
        <div className="h-2 w-16 bg-verdant-emerald/10 rounded-full" />
        <div className="h-4 w-3/4 bg-verdant-emerald/10 rounded-full" />
        <div className="h-2 w-full bg-verdant-emerald/10 rounded-full" />
        <div className="h-2 w-5/6 bg-verdant-emerald/10 rounded-full" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-4 w-20 bg-verdant-gold/15 rounded-full" />
          <div className="h-8 w-24 bg-verdant-emerald/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 animate-pulse py-6 select-none">
      {/* Left Gallery Skeleton */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="w-full aspect-square rounded-3xl bg-verdant-emerald/5 border border-verdant-emerald/5" />
        <div className="flex gap-3 justify-center">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="w-16 h-16 rounded-xl bg-verdant-emerald/5 border border-verdant-emerald/5" />
          ))}
        </div>
      </div>

      {/* Right Details Skeleton */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="h-2 w-24 bg-verdant-emerald/10 rounded-full" />
        <div className="h-8 w-3/4 bg-verdant-emerald/10 rounded-full" />
        <div className="h-4 w-40 bg-verdant-emerald/10 rounded-full" />
        <div className="h-6 w-32 bg-verdant-gold/15 rounded-full mt-4" />
        <hr className="border-verdant-emerald/5" />
        <div className="space-y-2">
          <div className="h-2 w-full bg-verdant-emerald/10 rounded-full" />
          <div className="h-2 w-full bg-verdant-emerald/10 rounded-full" />
          <div className="h-2 w-4/5 bg-verdant-emerald/10 rounded-full" />
        </div>
        <hr className="border-verdant-emerald/5" />
        <div className="flex gap-4 mt-6">
          <div className="h-12 flex-1 bg-verdant-emerald/10 rounded-full" />
          <div className="h-12 flex-1 bg-verdant-emerald/15 rounded-full" />
        </div>
      </div>
    </div>
  );
}
