import { FormEvent } from "react";
import { router, useForm } from "@inertiajs/react";
import { Trash2, Upload } from "lucide-react";

type GalleryImage = {
  id: number;
  path: string;
  alt_text: string | null;
  sort_order: number;
};

export function AdminTourGalleryEditor({ tourSlug, images }: { tourSlug: string; images: GalleryImage[] }) {
  const { data, setData, post, processing, errors, reset } = useForm<{ images: File[] }>({ images: [] });

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    post(`/admin/tours/${tourSlug}/images`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
      <div>
        <h2 className="font-display text-xl font-bold">Gallery</h2>
        <p className="mt-1 text-sm text-slate-500">Upload up to 10 images at a time. Images are resized and converted to WebP automatically.</p>
      </div>

      <form onSubmit={upload} className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setData("images", Array.from(event.target.files ?? []))}
          className="min-w-0 flex-1 text-sm"
        />
        <button disabled={processing || !data.images.length} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ocean)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          <Upload className="h-4 w-4" /> {processing ? "Uploading…" : "Upload images"}
        </button>
      </form>
      {errors.images && <p className="mt-2 text-xs text-red-600">{errors.images}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => <GalleryCard key={image.id} tourSlug={tourSlug} image={image} />)}
      </div>
      {!images.length && <p className="mt-6 rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">No gallery images yet.</p>}
    </section>
  );
}

function GalleryCard({ tourSlug, image }: { tourSlug: string; image: GalleryImage }) {
  const { data, setData, patch, processing } = useForm({
    alt_text: image.alt_text ?? "",
    sort_order: image.sort_order,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <img src={image.path} alt={image.alt_text ?? ""} className="aspect-[4/3] w-full object-cover" />
      <div className="grid gap-3 p-3">
        <input value={data.alt_text} onChange={(event) => setData("alt_text", event.target.value)} placeholder="Image alt text" className="rounded-lg border px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input type="number" min="1" value={data.sort_order} onChange={(event) => setData("sort_order", Number(event.target.value))} className="w-20 rounded-lg border px-3 py-2 text-sm" aria-label="Sort order" />
          <button
            type="button"
            disabled={processing}
            onClick={() => patch(`/admin/tours/${tourSlug}/images/${image.id}`, { preserveScroll: true })}
            className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Remove this gallery image?")) {
                router.delete(`/admin/tours/${tourSlug}/images/${image.id}`, { preserveScroll: true });
              }
            }}
            aria-label="Delete gallery image"
            className="rounded-lg border p-2 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
