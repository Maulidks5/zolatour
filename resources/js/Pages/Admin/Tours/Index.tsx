import { Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminEmptyState, AdminPageHeader } from "@/Components/AdminUi";
import { Clock3, ExternalLink, MapPin, Pencil, Plus, Search, Sparkles } from "lucide-react";

type Props = {
  catalogue: "tour" | "safari";
  tours: Array<{
    slug: string;
    title: string;
    category: string;
    type: string;
    image: string;
    duration: string;
    location: string;
    price: number;
    currency: string;
    isPublished: boolean;
    isPopular: boolean;
  }>;
};

export default function AdminTours({ tours, catalogue }: Props) {
  const isSafari = catalogue === "safari";
  const [query, setQuery] = useState("");
  const filteredTours = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? tours.filter((tour) => `${tour.title} ${tour.category} ${tour.type}`.toLowerCase().includes(term))
      : tours;
  }, [query, tours]);
  const publishedCount = tours.filter((tour) => tour.isPublished).length;

  return (
    <AdminLayout title={isSafari ? "Safaris" : "Tours"}>
      <AdminPageHeader eyebrow="Website catalogue" title={isSafari ? "Safari management" : "Tour management"} description={isSafari ? "Manage safari packages, starting prices, images and visibility." : "Manage Zanzibar tours, activities, pricing and visibility."} actions={<>
          <a href={isSafari ? "/safaris" : "/tours"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-slate-300">View {isSafari ? "safaris" : "tours"} <ExternalLink className="h-4 w-4" /></a>
          <Link href={`/admin/tours/create?type=${catalogue}`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-4 py-2.5 text-sm font-bold text-white shadow-sm"><Plus className="h-4 w-4" /> Add {isSafari ? "safari" : "tour"}</Link>
      </>} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-white p-5 shadow-[var(--shadow-card)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[var(--turquoise)]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{isSafari ? "All safaris" : "All tours"}</p>
          <p className="mt-1 font-display text-3xl font-bold">{tours.length}</p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 shadow-[var(--shadow-card)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-emerald-500">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Published</p>
          <p className="mt-1 font-display text-3xl font-bold text-emerald-700">{publishedCount}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isSafari ? "Search safaris or parks…" : "Search tours or categories…"} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--turquoise)] focus:bg-white" />
          </label>
          <span className="text-xs font-semibold text-slate-500">{filteredTours.length} results</span>
        </div>
        {filteredTours.length ? <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredTours.map((tour) => (
          <article key={tour.slug} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100"><img src={tour.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3"><span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ocean)] shadow-sm">{tour.category}</span><span className={`rounded-full px-3 py-1 text-[10px] font-bold shadow-sm ${tour.isPublished ? "bg-emerald-500 text-white" : "bg-slate-900/80 text-white"}`}>{tour.isPublished ? "Published" : "Draft"}</span></div></div>
            <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--turquoise)]">{tour.type.replace("_", " ")}</p><h2 className="mt-1 font-display text-xl font-bold leading-tight text-[var(--ocean)]">{tour.title}</h2></div>{tour.isPopular&&<Sparkles className="h-5 w-5 shrink-0 text-amber-500"/>}</div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-[var(--turquoise)]"/>{tour.duration}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[var(--turquoise)]"/>{tour.location}</span></div><div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Starting price</p><p className="mt-0.5 font-display text-lg font-bold text-slate-900">{tour.price > 0 ? `${tour.currency} ${tour.price}` : "Custom quote"}</p></div><Link href={`/admin/tours/${tour.slug}/edit`} className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ocean)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0a516c]"><Pencil className="h-3.5 w-3.5"/>Edit</Link></div></div>
          </article>
        ))}</div> : <AdminEmptyState icon={Search} title={`No service matches “${query}”`} description={`Try a different ${isSafari ? "safari" : "tour"} name or category.`} />}
      </div>
    </AdminLayout>
  );
}
