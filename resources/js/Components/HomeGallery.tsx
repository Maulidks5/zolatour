import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, ChevronLeft, ChevronRight, Images, X } from "lucide-react";

type GalleryImage = { path: string; alt: string };

export function HomeGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const visible = images.slice(0, 5);

  useEffect(() => {
    if (active === null) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") setActive((current) => current === null ? null : (current - 1 + visible.length) % visible.length);
      if (event.key === "ArrowRight") setActive((current) => current === null ? null : (current + 1) % visible.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", keydown);
    };
  }, [active, visible.length]);

  if (!visible.length) return null;

  return <>
    <div className={`grid gap-3 ${visible.length === 1 ? "grid-cols-1" : "grid-cols-2"} sm:grid-cols-4 sm:grid-rows-2`}>
      {visible.map((image, index) => {
        const featured = index === 0 && visible.length >= 3;
        const fillsThreeImageLayout = visible.length === 3 && index > 0;
        const fillsFourImageLayout = visible.length === 4 && index === 3;
        return <button
          key={`${image.path}-${index}`}
          type="button"
          onClick={() => setActive(index)}
          aria-label={`Open photo ${index + 1}: ${image.alt}`}
          className={`group relative overflow-hidden rounded-2xl bg-muted shadow-[var(--shadow-card)] ${
            featured
              ? "col-span-2 aspect-[16/10] sm:row-span-2 sm:aspect-auto"
              : `${visible.length === 2 ? "aspect-[4/3] sm:col-span-2" : fillsFourImageLayout ? "col-span-2 aspect-[2/1] sm:col-span-2" : "aspect-square"} ${fillsThreeImageLayout ? "sm:col-span-2 sm:aspect-[2/1]" : ""}`
          }`}
        >
          <img src={image.path} alt={image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-[#10182d]/35 via-transparent to-transparent opacity-60 transition group-hover:opacity-100" />
          <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[var(--ocean)] opacity-0 shadow-sm transition group-hover:opacity-100"><Images className="h-4 w-4" /></span>
        </button>;
      })}
    </div>
    <div className="mt-8 text-center">
      <Link href="/tours" className="inline-flex items-center gap-2 rounded-full border border-[var(--ocean)] px-6 py-3 text-sm font-bold text-[var(--ocean)] transition hover:bg-[var(--ocean)] hover:text-white">
        Explore our tours <ArrowRight className="h-4 w-4" />
      </Link>
    </div>

    {active !== null && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#070d1c]/95 p-4" role="dialog" aria-modal="true" aria-label="Experience photo gallery">
      <button type="button" onClick={() => setActive(null)} aria-label="Close gallery" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-6 w-6" /></button>
      {visible.length > 1 && <button type="button" onClick={() => setActive((active - 1 + visible.length) % visible.length)} aria-label="Previous photo" className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"><ChevronLeft className="h-7 w-7" /></button>}
      <img src={visible[active].path} alt={visible[active].alt} className="max-h-[82vh] max-w-[88vw] rounded-xl object-contain" />
      {visible.length > 1 && <button type="button" onClick={() => setActive((active + 1) % visible.length)} aria-label="Next photo" className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"><ChevronRight className="h-7 w-7" /></button>}
      <p className="absolute bottom-5 text-sm font-medium text-white/75">{active + 1} / {visible.length}</p>
    </div>}
  </>;
}
