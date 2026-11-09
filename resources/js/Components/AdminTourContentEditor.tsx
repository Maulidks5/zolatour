import { FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import { Plus, Trash2 } from "lucide-react";

type ItineraryItem = { time: string; title: string; description: string };
type FaqItem = { question: string; answer: string };

type Props = {
  tourSlug: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  itinerary: Array<{ time: string | null; title: string; description: string | null }>;
  faqs: FaqItem[];
};

export function AdminTourContentEditor({ tourSlug, highlights, included, notIncluded, itinerary, faqs }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    highlights,
    included,
    not_included: notIncluded,
    itinerary: itinerary.map((item) => ({
      time: item.time ?? "",
      title: item.title,
      description: item.description ?? "",
    })),
    faqs,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    post(`/admin/tours/${tourSlug}/content`, { preserveScroll: true });
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <StringList
        title="Tour highlights"
        values={data.highlights}
        onChange={(values) => setData("highlights", values)}
        placeholder="Add a tour highlight"
        error={errors.highlights}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StringList
          title="Included"
          values={data.included}
          onChange={(values) => setData("included", values)}
          placeholder="Add an included item"
          error={errors.included}
        />
        <StringList
          title="Not included"
          values={data.not_included}
          onChange={(values) => setData("not_included", values)}
          placeholder="Add a non-included item"
          error={errors.not_included}
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold">Itinerary</h2>
            <p className="mt-1 text-sm text-slate-500">Steps are displayed in this order on the tour page.</p>
          </div>
          <button
            type="button"
            onClick={() => setData("itinerary", [...data.itinerary, { time: "", title: "", description: "" }])}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
          >
            <Plus className="h-4 w-4" /> Add step
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {data.itinerary.map((item, index) => (
            <ItineraryRow
              key={index}
              item={item}
              onChange={(updated) => {
                const next = [...data.itinerary];
                next[index] = updated;
                setData("itinerary", next);
              }}
              onRemove={() => setData("itinerary", data.itinerary.filter((_, position) => position !== index))}
            />
          ))}
        </div>
        {errors.itinerary && <p className="mt-3 text-xs text-red-600">{errors.itinerary}</p>}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
        <div className="flex items-center justify-between gap-4"><div><h2 className="font-display text-xl font-bold">Tour FAQs</h2><p className="mt-1 text-sm text-slate-500">Answer common questions for this specific experience.</p></div><button type="button" onClick={() => setData("faqs", [...data.faqs, { question: "", answer: "" }])} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"><Plus className="h-4 w-4" /> Add FAQ</button></div>
        <div className="mt-5 space-y-4">{data.faqs.map((faq, index) => <FaqRow key={index} item={faq} onChange={(updated) => { const next = [...data.faqs]; next[index] = updated; setData("faqs", next); }} onRemove={() => setData("faqs", data.faqs.filter((_, position) => position !== index))} />)}</div>
        {!data.faqs.length && <p className="py-5 text-center text-sm text-slate-400">No tour-specific FAQs yet.</p>}
        {errors.faqs && <p className="mt-3 text-xs text-red-600">{errors.faqs}</p>}
      </section>

      <button disabled={processing} className="justify-self-start rounded-full bg-[var(--ocean)] px-7 py-3 font-bold text-white disabled:opacity-60">
        {processing ? "Saving details…" : "Save tour details"}
      </button>
    </form>
  );
}

function StringList({
  title,
  values,
  onChange,
  placeholder,
  error,
}: {
  title: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <button type="button" onClick={() => onChange([...values, ""])} className="inline-flex items-center gap-1 text-sm font-bold text-[var(--ocean)]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={value}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--turquoise)]"
            />
            <button type="button" aria-label={`Remove ${title} item`} onClick={() => onChange(values.filter((_, position) => position !== index))} className="rounded-xl border p-2.5 text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {!values.length && <p className="py-4 text-center text-sm text-slate-400">No items yet.</p>}
      </div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </section>
  );
}

function FaqRow({ item, onChange, onRemove }: { item: FaqItem; onChange: (item: FaqItem) => void; onRemove: () => void }) {
  const field = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--turquoise)]";
  return <div className="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_auto]"><div className="grid gap-3"><input value={item.question} onChange={(event) => onChange({ ...item, question: event.target.value })} placeholder="Customer question" className={field} /><textarea value={item.answer} onChange={(event) => onChange({ ...item, answer: event.target.value })} placeholder="Clear, helpful answer" rows={3} className={field} /></div><button type="button" onClick={onRemove} aria-label="Remove FAQ" className="self-start rounded-xl border bg-white p-2.5 text-red-600"><Trash2 className="h-4 w-4" /></button></div>;
}

function ItineraryRow({ item, onChange, onRemove }: { item: ItineraryItem; onChange: (item: ItineraryItem) => void; onRemove: () => void }) {
  const field = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--turquoise)]";
  return (
    <div className="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-[8rem_minmax(0,1fr)_auto]">
      <input value={item.time} onChange={(event) => onChange({ ...item, time: event.target.value })} placeholder="Time" className={field} />
      <div className="grid gap-3">
        <input value={item.title} onChange={(event) => onChange({ ...item, title: event.target.value })} placeholder="Step title" className={field} />
        <textarea value={item.description} onChange={(event) => onChange({ ...item, description: event.target.value })} placeholder="Description" rows={2} className={field} />
      </div>
      <button type="button" onClick={onRemove} aria-label="Remove itinerary step" className="self-start rounded-xl border bg-white p-2.5 text-red-600">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
