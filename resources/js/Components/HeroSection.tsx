import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";

export type HeroSlideData = {
  id: number;
  eyebrow: string | null;
  title: string;
  description: string | null;
  image: string;
  imageAlt: string;
  imagePosition: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string | null;
  secondaryUrl: string | null;
};

export function HeroSection({ slides }: { slides: HeroSlideData[] }) {
  const site = useSiteConfig();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (!slides.length) return null;
  const slide = slides[active] ?? slides[0];
  const goTo = (index: number) => {
    setActive((index + slides.length) % slides.length);
    setPaused(true);
    window.setTimeout(() => setPaused(false), 9000);
  };

  return (
    <section
      className="relative isolate min-h-[78vh] overflow-hidden bg-[var(--ocean)] text-white md:min-h-[76vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured Zola experiences"
    >
      {slides.map((item, index) => (
        <img
          key={item.id}
          src={item.image}
          alt={index === active ? item.imageAlt : ""}
          aria-hidden={index !== active}
          fetchPriority={index === 0 ? "high" : "auto"}
          className={`absolute inset-0 -z-20 h-full w-full object-cover transition duration-1000 ${positionClass(item.imagePosition)} ${index === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061d2d]/90 via-[#061d2d]/60 to-[#061d2d]/15 max-md:bg-gradient-to-t max-md:from-[#061d2d]/95 max-md:via-[#061d2d]/50 max-md:to-[#061d2d]/15" />

      <div className="mx-auto flex min-h-[78vh] max-w-7xl items-center px-4 pb-24 pt-24 sm:px-6 md:min-h-[76vh] lg:px-8">
        <div key={slide.id} className="max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/15 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-[var(--turquoise)]" /> {slide.eyebrow || "Zanzibar · Tanzania"}
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{slide.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">{slide.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={slide.primaryUrl || "/tours"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110">
              {slide.primaryLabel || "Explore"} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={getWhatsAppLink(`Hello Zola Tours, I would like to know more about ${slide.title}.`, site)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-[var(--ocean)]">
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </div>

      {slides.length > 1 && <div className="absolute inset-x-0 bottom-6 z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2" role="tablist" aria-label="Choose featured experience">
          {slides.map((item, index) => <button key={item.id} type="button" onClick={() => goTo(index)} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-current={index === active} className={`h-2 rounded-full transition-all ${index === active ? "w-8 bg-[var(--turquoise)]" : "w-2 bg-white/55 hover:bg-white"}`} />)}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous slide" className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/15 backdrop-blur-sm transition hover:bg-white hover:text-[var(--ocean)]"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Next slide" className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/15 backdrop-blur-sm transition hover:bg-white hover:text-[var(--ocean)]"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>}
    </section>
  );
}

function positionClass(position: string) {
  return ({ left: "object-left", right: "object-right", top: "object-top", bottom: "object-bottom", center: "object-center" } as Record<string, string>)[position] ?? "object-center";
}
