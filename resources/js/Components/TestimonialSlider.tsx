import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

export type PublicTestimonial = { name: string; country: string | null; tourName: string | null; rating: number; content: string };

export function TestimonialSlider({ items }: { items: PublicTestimonial[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % items.length), 6000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[active];
  const initials = item.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl">
      <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:px-6">
        <Quote className="absolute -right-2 -top-4 h-20 w-20 text-[var(--turquoise)]/10" />
        <div className="flex gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-4 w-4 ${index < item.rating ? "fill-current" : "text-slate-200"}`} />)}</div>
        <blockquote className="relative mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-700 sm:text-base">“{item.content}”</blockquote>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ocean)] text-[10px] font-bold text-white">{initials}</span>
          <div><p className="text-sm font-bold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{[item.country, item.tourName].filter(Boolean).join(" · ")}</p></div>
        </div>
      </article>
      {items.length > 1 && <div className="mt-3 flex items-center justify-center gap-3">
        <button type="button" onClick={() => setActive((active - 1 + items.length) % items.length)} aria-label="Previous testimonial" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-[var(--ocean)] transition hover:border-[var(--turquoise)]"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex gap-2">{items.map((_, index) => <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Show testimonial ${index + 1}`} className={`h-2 rounded-full transition-all ${active === index ? "w-7 bg-[var(--ocean)]" : "w-2 bg-border"}`} />)}</div>
        <button type="button" onClick={() => setActive((active + 1) % items.length)} aria-label="Next testimonial" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-[var(--ocean)] transition hover:border-[var(--turquoise)]"><ChevronRight className="h-4 w-4" /></button>
      </div>}
    </div>
  );
}
