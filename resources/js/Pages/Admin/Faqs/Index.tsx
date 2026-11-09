import { FormEvent, useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { ChevronDown, ChevronUp, HelpCircle, Plus, Save, Trash2 } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminEmptyState, AdminPageHeader } from "@/Components/AdminUi";

type Faq = { id: number; category: string; question: string; answer: string; sortOrder: number; isActive: boolean };
type FormData = { category: string; question: string; answer: string; sort_order: number; is_active: boolean };

export default function AdminFaqs({ faqs }: { faqs: Faq[] }) {
  const create = useForm<FormData>({ category: "Booking", question: "", answer: "", sort_order: faqs.length + 1, is_active: true });
  const [showCreate, setShowCreate] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.post("/admin/faqs", { preserveScroll: true, onSuccess: () => { create.reset(); setShowCreate(false); } });
  };

  return <AdminLayout title="FAQs">
    <AdminPageHeader eyebrow="Website content" title="Frequently asked questions" description="Manage answers shown on the public FAQ page." actions={
      <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-4 py-3 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add FAQ</button>
    } />
    {showCreate && <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      <Input label="Category"><input value={create.data.category} onChange={(e) => create.setData("category", e.target.value)} required className={fieldClass} /></Input>
      <Input label="Question"><input value={create.data.question} onChange={(e) => create.setData("question", e.target.value)} required className={fieldClass} /></Input>
      <div className="md:col-span-2"><Input label="Answer"><textarea rows={4} value={create.data.answer} onChange={(e) => create.setData("answer", e.target.value)} required className={fieldClass} /></Input></div>
      <Input label="Order"><input type="number" min={0} value={create.data.sort_order} onChange={(e) => create.setData("sort_order", Number(e.target.value))} className={fieldClass} /></Input>
      <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold"><input type="checkbox" checked={create.data.is_active} onChange={(e) => create.setData("is_active", e.target.checked)} /> Visible publicly</label>
      {Object.keys(create.errors).length > 0 && <p className="text-sm font-semibold text-rose-600 md:col-span-2">Please complete all fields correctly.</p>}
      <button disabled={create.processing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ocean)] px-5 py-3 text-sm font-bold text-white md:col-span-2"><Save className="h-4 w-4" /> Save FAQ</button>
    </form>}
    <div className="mt-6 grid gap-3">
      {faqs.map((faq) => <FaqEditor key={faq.id} faq={faq} />)}
      {!faqs.length && <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><AdminEmptyState icon={HelpCircle} title="No FAQs yet" description="Add your first common customer question." /></div>}
    </div>
  </AdminLayout>;
}

function FaqEditor({ faq }: { faq: Faq }) {
  const [expanded, setExpanded] = useState(false);
  const form = useForm<FormData>({ category: faq.category, question: faq.question, answer: faq.answer, sort_order: faq.sortOrder, is_active: faq.isActive });
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${form.data.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
      <span className="min-w-0 flex-1"><strong className="block truncate">{form.data.question}</strong><span className="text-xs text-slate-400">{form.data.category} · Order {form.data.sort_order}</span></span>
      {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
    </button>
    {expanded && <form onSubmit={(e) => { e.preventDefault(); form.patch(`/admin/faqs/${faq.id}`, { preserveScroll: true }); }} className="grid gap-4 border-t border-slate-200 bg-slate-50/50 p-5 md:grid-cols-2">
      <Input label="Category"><input value={form.data.category} onChange={(e) => form.setData("category", e.target.value)} className={fieldClass} /></Input>
      <Input label="Question"><input value={form.data.question} onChange={(e) => form.setData("question", e.target.value)} className={fieldClass} /></Input>
      <div className="md:col-span-2"><Input label="Answer"><textarea rows={4} value={form.data.answer} onChange={(e) => form.setData("answer", e.target.value)} className={fieldClass} /></Input></div>
      <Input label="Order"><input type="number" min={0} value={form.data.sort_order} onChange={(e) => form.setData("sort_order", Number(e.target.value))} className={fieldClass} /></Input>
      <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold"><input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData("is_active", e.target.checked)} /> Visible publicly</label>
      <div className="flex flex-wrap justify-between gap-3 md:col-span-2">
        <button type="button" onClick={() => window.confirm("Remove this FAQ?") && router.delete(`/admin/faqs/${faq.id}`, { preserveScroll: true })} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600"><Trash2 className="h-4 w-4" /> Delete</button>
        <button disabled={form.processing} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-5 py-2.5 text-sm font-bold text-white"><Save className="h-4 w-4" /> Save changes</button>
      </div>
    </form>}
  </article>;
}

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--turquoise)]";
function Input({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>; }
