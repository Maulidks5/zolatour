import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TourCard } from "@/Components/TourCard";
import type { TourCardData } from "@/types/tour";

export function PopularToursCarousel({ tours }: { tours: TourCardData[] }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const pausedRef = useRef(false);
    const [active, setActive] = useState(0);

    const goTo = useCallback(
        (index: number, smooth = true) => {
            if (!tours.length) return;
            const next = (index + tours.length) % tours.length;
            const item = trackRef.current?.children[next] as
                HTMLElement | undefined;
            if (!item) return;
            trackRef.current?.scrollTo({
                left: item.offsetLeft,
                behavior: smooth ? "smooth" : "auto",
            });
            setActive(next);
        },
        [tours.length],
    );

    useEffect(() => {
        if (
            tours.length < 2 ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return;
        const timer = window.setInterval(() => {
            if (!pausedRef.current) goTo(active + 1);
        }, 5500);
        return () => window.clearInterval(timer);
    }, [active, goTo, tours.length]);

    function updateActive() {
        const track = trackRef.current;
        if (!track) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll <= 0) return setActive(0);
        setActive(
            Math.round((track.scrollLeft / maxScroll) * (tours.length - 1)),
        );
    }

    if (!tours.length) return null;

    return (
        <div
            className="relative"
            onMouseEnter={() => {
                pausedRef.current = true;
            }}
            onMouseLeave={() => {
                pausedRef.current = false;
            }}
            onFocusCapture={() => {
                pausedRef.current = true;
            }}
            onBlurCapture={() => {
                pausedRef.current = false;
            }}
            onTouchStart={() => {
                pausedRef.current = true;
            }}
            onTouchEnd={() => {
                window.setTimeout(() => {
                    pausedRef.current = false;
                }, 2500);
            }}
        >
            <div className="mb-5 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    aria-label="Previous popular tour"
                    className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-[var(--ocean)] shadow-sm transition hover:border-[var(--ocean)] hover:bg-[var(--ocean)] hover:text-white"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    aria-label="Next popular tour"
                    className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-[var(--ocean)] shadow-sm transition hover:border-[var(--ocean)] hover:bg-[var(--ocean)] hover:text-white"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
            <div
                ref={trackRef}
                onScroll={updateActive}
                className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-1 sm:px-1 [&::-webkit-scrollbar]:hidden"
            >
                {tours.map((tour) => (
                    <div
                        key={tour.slug}
                        className="min-w-0 shrink-0 basis-[88%] snap-start sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]"
                    >
                        <TourCard tour={tour} />
                    </div>
                ))}
            </div>
            {tours.length > 1 && (
                <div
                    className="mt-4 flex justify-center gap-2"
                    aria-label="Popular tours navigation"
                >
                    {tours.map((tour, index) => (
                        <button
                            key={tour.slug}
                            type="button"
                            onClick={() => goTo(index)}
                            aria-label={`Show ${tour.title}`}
                            aria-current={active === index ? "true" : undefined}
                            className={`h-2 rounded-full transition-all ${active === index ? "w-7 bg-[var(--ocean)]" : "w-2 bg-border hover:bg-[var(--turquoise)]"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
