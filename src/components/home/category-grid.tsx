import Link from "next/link";
import {
  AirVent,
  Bug,
  Flower2,
  Hammer,
  Heart,
  Paintbrush,
  Shirt,
  Sparkles,
  Thermometer,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Heart,
  Wrench,
  Zap,
  AirVent,
  Paintbrush,
  Hammer,
  Bug,
  Truck,
  Shirt,
  Flower2,
  Thermometer,
};

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-black">Pick a service</h2>
          <p className="mt-1 text-sm text-black/55">
            Tap a category to see packages and book.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] || Sparkles;
          return (
            <Link
              key={cat.id}
              href={`/services?category=${cat.id}`}
              className="category-card group flex flex-col items-center rounded-2xl border border-black/10 bg-white px-2 py-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            >
              <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-pink-soft text-pink transition group-hover:bg-pink group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-xs font-semibold text-black sm:text-sm">
                {cat.name}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
