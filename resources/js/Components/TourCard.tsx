import { Link } from "./AppLink";
import { Clock, MapPin, Star, Users } from "lucide-react";
import type { TourCardData } from "@/types/tour";

export function TourCard({ tour }: { tour: TourCardData }) {
    const isSafari = tour.experienceType === "safari";
    const price = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: tour.currency,
        maximumFractionDigits: 0,
    }).format(tour.price);
    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={tour.image}
                    alt={tour.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {tour.category && <span className="absolute left-3 top-3 rounded-full bg-[var(--ocean)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">{tour.category}</span>}
                {tour.reviewsCount > 0 && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[var(--gold)] px-2.5 py-1 text-xs font-bold text-foreground">
                        <Star className="h-3 w-3 fill-current" /> {tour.rating}
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-lg font-bold leading-snug text-foreground">
                    {tour.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {tour.description}
                </p>
                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {tour.duration}
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />{" "}
                        <span className="truncate">{tour.location}</span>
                    </span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {isSafari ? "Private planning" : "Small groups"}</span>
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div><p className="text-[10px] text-muted-foreground">{tour.price > 0 ? "From" : "Tailored pricing"}</p><p className="font-display text-xl font-extrabold text-[var(--ocean)]">{tour.price > 0 ? price : "Request quote"}</p></div>
                    <Link to={`${isSafari ? "/safaris" : "/tours"}/${tour.slug}`} className="inline-flex items-center justify-center rounded-lg bg-[var(--ocean)] px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-110">View {isSafari ? "safari" : "tour"}</Link>
                </div>
            </div>
        </article>
    );
}
