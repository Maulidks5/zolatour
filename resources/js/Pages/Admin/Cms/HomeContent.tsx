import { FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminPageHeader } from "@/Components/AdminUi";

type Item = { title: string; description: string; meta: string; icon: string; is_active: boolean };
type Sections = { trust: Item[]; why: Item[] };
type Props = { sections: Partial<Sections> };

const emptyItem = (): Item => ({ title: "", description: "", meta: "", icon: "sparkles", is_active: true });
const iconOptions = ["users", "car", "calendar", "message", "award", "sparkles", "heart", "shield"];

export default function HomeContent({ sections }: Props) {
  const { data, setData, put, processing, errors } = useForm<{ sections: Sections }>({
    sections: {
      trust: sections.trust ?? [],
      why: sections.why ?? [],
    },
  });

  function update(section: keyof Sections, index: number, field: keyof Item, value: string | boolean) {
    const items = [...data.sections[section]];
    items[index] = { ...items[index], [field]: value };
    setData("sections", { ...data.sections, [section]: items });
  }

  function add(section: keyof Sections) {
    setData("sections", { ...data.sections, [section]: [...data.sections[section], emptyItem()] });
  }

  function remove(section: keyof Sections, index: number) {
    setData("sections", { ...data.sections, [section]: data.sections[section].filter((_, itemIndex) => itemIndex !== index) });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    put("/admin/cms/home", { preserveScroll: true });
  }

  return (
    <AdminLayout title="Homepage blocks">
      <AdminPageHeader eyebrow="Homepage content" title="Homepage sections" description="Manage the trust and Why Choose Us cards. Their order here is the order visitors see." />

      <form onSubmit={submit} className="mt-6 grid gap-6">
        <Editor title="Trust bar" description="Short reassurance points directly below the hero." section="trust" items={data.sections.trust} update={update} add={add} remove={remove} compact />
        <Editor title="Why choose us" description="Reasons travellers should choose the company." section="why" items={data.sections.why} update={update} add={add} remove={remove} />
        {Object.keys(errors).length > 0 && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">Please check that every visible item has a title and valid content.</p>}
        <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <button disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" />{processing ? "Saving…" : "Save homepage blocks"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}

type EditorProps = {
  title: string;
  description: string;
  section: keyof Sections;
  items: Item[];
  compact?: boolean;
  update: (section: keyof Sections, index: number, field: keyof Item, value: string | boolean) => void;
  add: (section: keyof Sections) => void;
  remove: (section: keyof Sections, index: number) => void;
};

function Editor({ title, description, section, items, compact, update, add, remove }: EditorProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-7">
        <div><h2 className="font-display text-xl font-bold">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{description}</p></div>
        <button type="button" onClick={() => add(section)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[var(--ocean)]"><Plus className="h-4 w-4" /> Add item</button>
      </div>
      <div className="grid gap-3 p-4 sm:p-6">
        {items.map((item, index) => (
          <div key={index} className={`grid items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 ${compact ? "md:grid-cols-[auto_1fr_10rem_auto]" : "md:grid-cols-[auto_1fr_1fr_10rem_auto]"}`}>
            <GripVertical className="mt-3 hidden h-4 w-4 text-slate-300 md:block" />
            <input value={item.title} onChange={(event) => update(section, index, "title", event.target.value)} placeholder="Title" className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--turquoise)]" />
            {!compact && <textarea rows={2} value={item.description} onChange={(event) => update(section, index, "description", event.target.value)} placeholder="Short description" className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--turquoise)]" />}
            <select value={item.icon} onChange={(event) => update(section, index, "icon", event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm capitalize">{iconOptions.map((icon) => <option key={icon}>{icon}</option>)}</select>
            <div className="flex items-center justify-end gap-1">
              <button type="button" onClick={() => update(section, index, "is_active", !item.is_active)} title={item.is_active ? "Visible" : "Hidden"} className={`grid h-10 w-10 place-items-center rounded-lg ${item.is_active ? "text-emerald-600" : "text-slate-400"}`}>{item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
              <button type="button" onClick={() => remove(section, index)} title="Remove" className="grid h-10 w-10 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {!items.length && <p className="py-8 text-center text-sm text-slate-400">No items. Use “Add item” to create one.</p>}
      </div>
    </section>
  );
}
