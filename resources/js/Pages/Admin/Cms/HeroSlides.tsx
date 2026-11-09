import { FormEvent, useState } from "react";
import { useForm } from "@inertiajs/react";
import { ImagePlus, Save } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminPageHeader } from "@/Components/AdminUi";

type Hero = {
  id: number; eyebrow: string; title: string; description: string; imagePath: string;
  imageAlt: string; imagePosition: string; primaryLabel: string; primaryUrl: string;
  secondaryLabel: string; secondaryUrl: string; sortOrder: number; isActive: boolean;
};

export default function HeroEditor({ slides }: { slides: Hero[] }) {
  const hero = slides[0];
  return (
    <AdminLayout title="Homepage hero">
      <AdminPageHeader eyebrow="Homepage visual" title="Cinematic homepage hero" description="Edit the headline, description, background image and buttons. The final word of your headline automatically receives the orange brand accent." />
      {hero ? <div className="mt-6"><Editor hero={hero} /></div> : <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Run the hero content seeder to create the homepage hero.</p>}
    </AdminLayout>
  );
}

function Editor({ hero }: { hero: Hero }) {
  const { data, setData, post, processing, errors } = useForm({
    eyebrow: hero.eyebrow,
    title: hero.title,
    description: hero.description,
    image_alt: hero.imageAlt,
    image_position: hero.imagePosition || "center",
    primary_label: hero.primaryLabel,
    primary_url: hero.primaryUrl,
    secondary_label: hero.secondaryLabel || "Talk to a local expert",
    secondary_url: hero.secondaryUrl || "whatsapp",
    sort_order: 0,
    is_active: true,
    image: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    post(`/admin/cms/hero-slides/${hero.id}`, { forceFormData: true, preserveScroll: true });
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[24rem_minmax(0,1fr)]">
        <label className="group relative min-h-72 cursor-pointer bg-slate-900">
          <img src={preview ?? hero.imagePath} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <span className="absolute inset-0 grid place-items-center bg-slate-950/20 transition group-hover:bg-slate-950/40"><span className="inline-flex items-center gap-2 rounded-xl bg-black/55 px-4 py-2.5 text-xs font-bold text-white backdrop-blur"><ImagePlus className="h-4 w-4" />{data.image ? data.image.name : "Change hero image"}</span></span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setData("image", file);
            if (file) setPreview(URL.createObjectURL(file));
          }} />
        </label>

        <div className="grid gap-4 p-5 sm:p-7">
          <Field label="Location label" error={errors.eyebrow}><input value={data.eyebrow} onChange={(event) => setData("eyebrow", event.target.value)} className={input} placeholder="Zanzibar · Tanzania" /></Field>
          <Field label="Main headline" hint="The last word appears in orange." error={errors.title}><input required value={data.title} onChange={(event) => setData("title", event.target.value)} className={input} /></Field>
          <Field label="Introduction" error={errors.description}><textarea rows={3} value={data.description} onChange={(event) => setData("description", event.target.value)} className={input} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Main button text" error={errors.primary_label}><input required value={data.primary_label} onChange={(event) => setData("primary_label", event.target.value)} className={input} /></Field>
            <Field label="Main button link" error={errors.primary_url}><input required value={data.primary_url} onChange={(event) => setData("primary_url", event.target.value)} className={input} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Image description (SEO)" error={errors.image_alt}><input value={data.image_alt} onChange={(event) => setData("image_alt", event.target.value)} className={input} /></Field>
            <Field label="Image focus" error={errors.image_position}><select value={data.image_position} onChange={(event) => setData("image_position", event.target.value)} className={input}><option value="center">Center</option><option value="left">Left</option><option value="right">Right</option><option value="top">Top</option><option value="bottom">Bottom</option></select></Field>
          </div>
          {errors.image && <span className="text-xs text-rose-600">{errors.image}</span>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
        <p className="text-xs font-medium text-slate-500">Changes appear on the homepage after saving.</p>
        <button disabled={processing} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--ocean)] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" />{processing ? "Saving…" : "Save hero"}</button>
      </div>
    </form>
  );
}

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--turquoise)] focus:ring-2 focus:ring-[var(--turquoise)]/10";
function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>{children}{hint && <span className="text-[11px] text-slate-400">{hint}</span>}{error && <span className="text-xs text-rose-600">{error}</span>}</label>;
}
