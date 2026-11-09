import { DEFAULT_TOUR_IMAGE } from "@/config/image";
import { ArrowUpRight } from "lucide-react";

interface Props {
  name: string;
  slug: string;
  description: string | null;
  image: string;
  toursCount: number;
}

export function CategoryCard({ name, slug, description, image, toursCount }: Props) {
  const href = slug === "tanzania-safaris" ? "/safaris" : `/tours?category=${slug}`;

  return (
    <a
      href={href}
      className="group relative block aspect-[16/10] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] outline-none transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] focus-visible:ring-2 focus-visible:ring-[var(--turquoise)] focus-visible:ring-offset-2"
    >
      <img
        src={image || DEFAULT_TOUR_IMAGE}
        alt={name}
        loading="lazy" decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5 transition-colors group-hover:from-black/95" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 text-white sm:p-6">
        <h3 className="font-display text-xl font-bold md:text-2xl">{name}</h3>
        <p className="mt-1.5 text-sm leading-5 text-white/85">{description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--gold)]">
          Explore {toursCount} {toursCount === 1 ? "tour" : "tours"} <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}
