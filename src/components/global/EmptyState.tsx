import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  onClearFilters?: () => void;
}

export default function EmptyState({
  message = "No masterpieces matched your current curation.",
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center glass-effect rounded-3xl border border-verdant-emerald/5 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-verdant-gold/10 border border-verdant-gold/20 flex items-center justify-center text-verdant-gold mb-6 animate-pulse">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl md:text-2xl text-verdant-emerald font-light mb-3">
        Curation Empty
      </h3>
      <p className="text-verdant-emerald/65 text-xs md:text-sm font-light leading-relaxed tracking-wide mb-8 max-w-sm">
        {message}
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="gold-gradient-bg text-black hover:scale-105 active:scale-95 text-[10px] tracking-widest uppercase font-bold px-8 py-3.5 rounded-full shadow-md transition-all duration-300"
        >
          Reset Curation
        </button>
      )}
    </div>
  );
}
