import { FormEvent, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff, ImageIcon, Plus, Save, X } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminPageHeader } from "@/Components/AdminUi";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imagePath: string | null;
  sortOrder: number;
  isActive: boolean;
  toursCount: number;
};

export default function Categories({ categories }: { categories: Category[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <AdminLayout title="Categories">
      <AdminPageHeader eyebrow="Catalogue structure" title="Tour categories" description="Control category names, homepage cards, visibility and display order." actions={
        <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add category</button>
      } />
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {creating && <CategoryEditor nextOrder={categories.length} onCancel={() => setCreating(false)} />}
        {categories.map((category) => <CategoryEditor key={category.id} category={category} />)}
      </div>
    </AdminLayout>
  );
}

function CategoryEditor({ category, nextOrder = 0, onCancel }: { category?: Category; nextOrder?: number; onCancel?: () => void }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { data, setData, post, processing, errors } = useForm({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    sort_order: category?.sortOrder ?? nextOrder,
    is_active: category?.isActive ?? true,
    image: null as File | null,
  });

  function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    post(category ? `/admin/cms/categories/${category.id}` : "/admin/cms/categories", { forceFormData: true, preserveScroll: true, onSuccess: () => onCancel?.() });
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/7] bg-slate-100">
        {imagePreview || category?.imagePath ? <img src={imagePreview ?? category?.imagePath ?? ""} alt={`${data.name || "Category"} preview`} className="h-full w-full object-cover" /> : <ImageIcon className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-slate-300" />}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold shadow-sm">{category ? `${category.toursCount} tours` : "New category"}</span>
      </div>
      <div className="grid gap-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}><input required value={data.name} onChange={(event) => { const name = event.target.value; setData((current) => ({ ...current, name, slug: slugify(name) })); }} className={input} /></Field>
          <Field label="URL slug" error={errors.slug}><input required value={data.slug} onChange={(event) => setData("slug", slugify(event.target.value))} className={input} /></Field>
        </div>
        <Field label="Description" error={errors.description}><textarea rows={3} value={data.description} onChange={(event) => setData("description", event.target.value)} className={input} /></Field>
        <div className="grid items-end gap-4 sm:grid-cols-[7rem_1fr]">
          <Field label="Display order" error={errors.sort_order}><input type="number" min={0} value={data.sort_order} onChange={(event) => setData("sort_order", Number(event.target.value))} className={input} /></Field>
          <Field label={category ? "Replace category image" : "Category image"} error={errors.image}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0] ?? null; setData("image", file); if (imagePreview) URL.revokeObjectURL(imagePreview); setImagePreview(file ? URL.createObjectURL(file) : null); }} className={input} /></Field>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
        <button type="button" onClick={() => setData("is_active", !data.is_active)} className={`inline-flex items-center gap-2 text-xs font-bold ${data.is_active ? "text-emerald-700" : "text-slate-500"}`}>{data.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}{data.is_active ? "Visible" : "Hidden"}</button>
        <div className="flex gap-2">
          {onCancel && <button type="button" onClick={onCancel} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600"><X className="h-4 w-4" /> Cancel</button>}
          <button disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" />{processing ? "Saving…" : category ? "Save category" : "Create category"}</button>
        </div>
      </div>
    </form>
  );
}

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--turquoise)]";
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>{children}{error && <span className="text-xs text-rose-600">{error}</span>}</label>;
}
