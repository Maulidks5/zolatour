import { Quote, Star } from "lucide-react";

interface Props {
  name: string;
  country: string;
  quote: string;
  initials: string;
}

export function TestimonialCard({ name, country, quote, initials }: Props) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
      <Quote className="h-8 w-8 text-[var(--turquoise)]" />
      <div className="mt-3 flex gap-0.5 text-[var(--gold)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-sm text-foreground/85 leading-relaxed">"{quote}"</p>
      <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border/60">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--gradient-ocean)] text-white font-bold">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{country}</p>
        </div>
      </div>
    </div>
  );
}
