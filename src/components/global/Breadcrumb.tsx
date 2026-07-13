import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex flex-wrap items-center gap-1.5 md:gap-2.5 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-medium">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={idx} className="flex items-center gap-1.5 md:gap-2.5">
              {idx > 0 && (
                <ChevronRight className="w-3 h-3 text-verdant-gold/50" />
              )}
              {isLast ? (
                <span className="text-verdant-gold font-semibold select-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || "/"}
                  className="text-verdant-emerald/65 hover:text-verdant-emerald transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
