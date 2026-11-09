import { FormEvent, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminStatusBadge } from "@/Components/AdminStatusBadge";
import { AdminEmptyState, AdminFilterTabs, AdminPageHeader, AdminPagination, AdminTableShell, adminTableCellClass, adminTableClass, adminTableHeadClass, adminTableHeaderCellClass, adminTableRowClass } from "@/Components/AdminUi";
import { Archive, CalendarCheck2, CheckCircle2, ChevronRight, Clock3, Inbox, RotateCcw, Search, Trash2 } from "lucide-react";

type BookingRow = { reference: string; fullName: string; whatsapp: string; email: string | null; tour: string; travelDate: string; guests: number; hotel: string | null; status: string; createdAt: string };
type Props = {
  bookings: { data: BookingRow[]; links: Array<{ url: string | null; label: string; active: boolean }> };
  stats: { pending: number; confirmed: number; upcoming: number; completed: number };
  activeStatus: string | null;
  filters: { search: string; archived: boolean };
  statuses: string[];
  canPermanentlyDelete: boolean;
};

export default function AdminBookings({ bookings, stats, activeStatus, filters, statuses, canPermanentlyDelete }: Props) {
  const [search, setSearch] = useState(filters.search);
  const query = (extra: Record<string, string | number> = {}) => {
    const params = new URLSearchParams();
    if (activeStatus) params.set("status", activeStatus);
    if (filters.search) params.set("search", filters.search);
    if (filters.archived) params.set("archived", "1");
    Object.entries(extra).forEach(([key, value]) => value ? params.set(key, String(value)) : params.delete(key));
    return `/admin/bookings${params.size ? `?${params}` : ""}`;
  };
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    router.get(query({ search }), {}, { preserveState: true, replace: true });
  };
  const filterTabs = [
    { label: "All", href: query({ status: "" }), active: !activeStatus },
    ...statuses.map((status) => ({ label: status[0].toUpperCase() + status.slice(1), href: query({ status }), active: activeStatus === status })),
  ];

  return (
    <AdminLayout title="Bookings">
      <AdminPageHeader eyebrow="Customer activity" title="Bookings" description="Track every booking from first request to completed trip." actions={<span className="rounded-xl bg-cyan-50 px-4 py-2.5 text-sm text-slate-500"><strong className="text-[var(--ocean)]">{bookings.data.length}</strong> on this page</span>} />
      <div className="mb-6 mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard label="Needs attention" value={stats.pending} icon={Clock3} tone="bg-amber-50 text-amber-700" />
        <SummaryCard label="Confirmed" value={stats.confirmed} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-700" />
        <SummaryCard label="Upcoming trips" value={stats.upcoming} icon={CalendarCheck2} tone="bg-sky-50 text-sky-700" />
        <SummaryCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="bg-violet-50 text-violet-700" />
      </div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <AdminFilterTabs items={filterTabs} />
        <div className="flex flex-wrap gap-2">
          <form onSubmit={submitSearch} className="flex min-w-64 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-card)] focus-within:border-[var(--turquoise)]">
            <Search className="ml-3 mt-3 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Reference, name or phone" className="min-w-0 flex-1 border-0 px-3 py-2.5 text-sm outline-none" />
            <button className="bg-[var(--ocean)] px-4 text-xs font-bold text-white">Search</button>
          </form>
          <Link href={query({ archived: filters.archived ? 0 : 1 })} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold ${filters.archived ? "border-[var(--ocean)] bg-[var(--ocean)] text-white" : "border-slate-200 bg-white text-slate-700"}`}><Archive className="h-4 w-4" /> {filters.archived ? "Archived" : "View archive"}</Link>
        </div>
      </div>
      {bookings.data.length ? <>
        <div className="grid gap-3 md:hidden">
          {bookings.data.map((booking) => <article key={booking.reference} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[var(--ocean)]">{booking.reference}</p><h2 className="mt-1 font-display text-lg font-bold text-slate-950">{booking.fullName}</h2></div><AdminStatusBadge status={booking.status} /></div>
            <div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="font-semibold text-slate-800">{booking.tour}</p><p className="mt-1 text-xs text-slate-500">{booking.travelDate} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}</p></div>
            <div className="mt-3 text-sm text-slate-600"><p>{booking.whatsapp}</p><p className="mt-0.5 text-xs text-slate-400">{booking.email || "No email provided"}</p></div>
            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
              {!filters.archived && <><Link href={`/admin/bookings/${booking.reference}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--ocean)] px-3 py-2.5 text-xs font-bold text-white">View details <ChevronRight className="h-3.5 w-3.5" /></Link><button aria-label={`Archive ${booking.reference}`} onClick={() => confirm("Archive this booking? You can restore it later.") && router.delete(`/admin/bookings/${booking.reference}`)} className="rounded-xl border border-slate-200 p-2.5 text-slate-500"><Archive className="h-4 w-4" /></button></>}
              {filters.archived && <><button onClick={() => router.patch(`/admin/bookings/${booking.reference}/restore`)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-200 px-3 py-2.5 text-xs font-bold text-emerald-700"><RotateCcw className="h-3.5 w-3.5" /> Restore</button>{canPermanentlyDelete && <button aria-label={`Delete ${booking.reference}`} onClick={() => confirm("Permanently delete this booking? This cannot be undone.") && router.delete(`/admin/bookings/${booking.reference}/force`)} className="rounded-xl border border-red-200 p-2.5 text-red-700"><Trash2 className="h-4 w-4" /></button>}</>}
            </div>
          </article>)}
        </div>
        <div className="hidden md:block"><AdminTableShell><table className={adminTableClass}>
          <thead className={adminTableHeadClass}><tr><th className={adminTableHeaderCellClass}>Booking</th><th className={adminTableHeaderCellClass}>Tour & travel</th><th className={adminTableHeaderCellClass}>Contact</th><th className={adminTableHeaderCellClass}>Status</th><th className={adminTableHeaderCellClass}><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{bookings.data.map((booking) => <tr key={booking.reference} className={adminTableRowClass}>
            <td className={adminTableCellClass}><Link href={`/admin/bookings/${booking.reference}`} className="font-bold text-[var(--ocean)] hover:underline">{booking.reference}</Link><p className="mt-1 font-semibold text-slate-900">{booking.fullName}</p><p className="mt-1 text-xs text-slate-400">Received {booking.createdAt}</p></td>
            <td className={adminTableCellClass}><p className="font-semibold text-slate-800">{booking.tour}</p><p className="mt-1 text-xs text-slate-500">{booking.travelDate} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}</p>{booking.hotel && <p className="mt-1 max-w-52 truncate text-xs text-slate-400">{booking.hotel}</p>}</td>
            <td className={adminTableCellClass}><p className="font-medium text-slate-700">{booking.whatsapp}</p><p className="mt-1 text-xs text-slate-500">{booking.email || "No email provided"}</p></td>
            <td className={adminTableCellClass}><AdminStatusBadge status={booking.status} /></td>
            <td className={`${adminTableCellClass} text-right`}><div className="inline-flex flex-wrap justify-end gap-2">
              {!filters.archived && <Link href={`/admin/bookings/${booking.reference}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[var(--ocean)]">View <ChevronRight className="h-3.5 w-3.5" /></Link>}
              {filters.archived ? <><button onClick={() => router.patch(`/admin/bookings/${booking.reference}/restore`)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700"><RotateCcw className="h-3.5 w-3.5" /> Restore</button>{canPermanentlyDelete && <button onClick={() => confirm("Permanently delete this booking? This cannot be undone.") && router.delete(`/admin/bookings/${booking.reference}/force`)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700"><Trash2 className="h-3.5 w-3.5" /> Delete</button>}</> : <button onClick={() => confirm("Archive this booking? You can restore it later.") && router.delete(`/admin/bookings/${booking.reference}`)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"><Archive className="h-3.5 w-3.5" /> Archive</button>}
            </div></td>
          </tr>)}</tbody>
        </table></AdminTableShell></div>
      </> : <AdminTableShell><AdminEmptyState icon={Inbox} title={filters.archived ? "No archived bookings" : "No bookings found"} description="Try another status or search term." /></AdminTableShell>}
      <AdminPagination links={bookings.links} />
    </AdminLayout>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Clock3; tone: string }) {
  return <div className="relative flex items-center gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] md:p-5"><span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--turquoise)] to-[var(--accent)]"/><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span><div><strong className="font-display text-2xl text-[var(--ocean)]">{value}</strong><p className="text-xs font-semibold text-slate-500 md:text-sm">{label}</p></div></div>;
}
