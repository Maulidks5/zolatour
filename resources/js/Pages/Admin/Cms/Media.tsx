import { FormEvent, useState } from "react";
import { useForm } from "@inertiajs/react";
import { ImagePlus, Save, UploadCloud } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminPageHeader } from "@/Components/AdminUi";

type Props = { media: { logo_path: string; cta_image_path: string; about_image_path: string } };

export default function CmsMedia({ media }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    logo: null as File | null,
    cta_image: null as File | null,
    about_image: null as File | null,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    post("/admin/cms/media", { forceFormData: true, preserveScroll: true });
  }

  return (
    <AdminLayout title="Website media">
      <AdminPageHeader eyebrow="Website content" title="Website media" description="Replace key website images. Uploads are automatically resized and converted to lightweight WebP files." />
      <form onSubmit={submit} className="mt-6 grid gap-5 lg:grid-cols-2">
        <MediaField title="Website logo" hint="Square or transparent image recommended." current={media.logo_path} field="logo" file={data.logo} error={errors.logo} onChange={(file) => setData("logo", file)} />
        <MediaField title="CTA background" hint="Landscape photo with a clear central subject." current={media.cta_image_path} field="cta_image" file={data.cta_image} error={errors.cta_image} onChange={(file) => setData("cta_image", file)} />
        <MediaField title="About page image" hint="A real team, guide, driver or guest experience is recommended." current={media.about_image_path} field="about_image" file={data.about_image} error={errors.about_image} onChange={(file) => setData("about_image", file)} />
        <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur lg:col-span-2">
          <button disabled={processing || !Object.values(data).some(Boolean)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{processing ? "Uploading…" : "Save media"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}

function MediaField({ title, hint, current, field, file, error, onChange }: { title: string; hint: string; current: string; field: string; file: File | null; error?: string; onChange: (file: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <label className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-slate-100">
        <img src={preview ?? current} alt="" className="h-full w-full object-cover" />
        <span className="absolute inset-0 grid place-items-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/40 group-hover:opacity-100"><UploadCloud className="h-8 w-8" /></span>
      </div>
      <div className="p-5">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{hint}</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[var(--ocean)]"><ImagePlus className="h-4 w-4" />{file ? file.name : "Choose image"}</span>
        <input type="file" name={field} accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
          const next = event.target.files?.[0] ?? null;
          onChange(next);
          if (next) setPreview(URL.createObjectURL(next));
        }} />
        {error && <span className="mt-2 block text-xs text-rose-600">{error}</span>}
      </div>
    </label>
  );
}
