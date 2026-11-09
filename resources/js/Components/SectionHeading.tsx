interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center" }: Props) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignCls} mb-12`}>
      {eyebrow && (
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ocean)] mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground text-base md:text-lg">{subtitle}</p>}
    </div>
  );
}
