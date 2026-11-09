import { FormEvent, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Archive, CheckCircle2, ChevronRight, Clock3, Inbox, ReceiptText, RotateCcw, Search, Trash2 } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminStatusBadge } from "@/Components/AdminStatusBadge";
import { AdminEmptyState, AdminFilterTabs, AdminPageHeader, AdminPagination, AdminTableShell, adminTableCellClass, adminTableClass, adminTableHeadClass, adminTableHeaderCellClass, adminTableRowClass } from "@/Components/AdminUi";

type Row = { reference:string; fullName:string; phone:string; email:string|null; serviceType:string; tripType:string; pickup:string; destination:string; travelDate:string; pickupTime:string|null; passengers:number; requestedVehicle:string|null; estimatedPrice:number|null; estimatedCurrency:string|null; status:string; createdAt:string };
type Props = { requests:{data:Row[];links:Array<{url:string|null;label:string;active:boolean}>}; stats:{new:number;quoted:number;confirmed:number;completed:number}; activeStatus:string|null; filters:{search:string;archived:boolean}; statuses:string[]; canPermanentlyDelete:boolean };

export default function TransportRequests({ requests, stats, activeStatus, filters, statuses, canPermanentlyDelete }: Props) {
  const [search, setSearch] = useState(filters.search);
  const query = (extra: Record<string,string|number> = {}) => {
    const params = new URLSearchParams();
    if (activeStatus) params.set("status", activeStatus);
    if (filters.search) params.set("search", filters.search);
    if (filters.archived) params.set("archived", "1");
    Object.entries(extra).forEach(([key,value]) => value ? params.set(key,String(value)) : params.delete(key));
    return `/admin/transport-requests${params.size ? `?${params}` : ""}`;
  };
  const submitSearch = (event: FormEvent) => { event.preventDefault(); router.get(query({search}), {}, {preserveState:true,replace:true}); };
  const tabs = [{label:"All",href:query({status:""}),active:!activeStatus}, ...statuses.map(status => ({label:status[0].toUpperCase()+status.slice(1),href:query({status}),active:activeStatus===status}))];

  return <AdminLayout title="Transport requests">
    <AdminPageHeader eyebrow="Customer activity" title="Transport requests" description="Review routes, prepare quotes and follow every transfer through to completion." actions={<span className="rounded-xl bg-cyan-50 px-4 py-2.5 text-sm text-slate-500"><strong className="text-[var(--ocean)]">{requests.data.length}</strong> on this page</span>} />
    <div className="mb-6 mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Summary label="Needs attention" value={stats.new} icon={Clock3} tone="bg-amber-50 text-amber-700" />
      <Summary label="Quoted" value={stats.quoted} icon={ReceiptText} tone="bg-sky-50 text-sky-700" />
      <Summary label="Confirmed" value={stats.confirmed} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-700" />
      <Summary label="Completed" value={stats.completed} icon={CheckCircle2} tone="bg-violet-50 text-violet-700" />
    </div>
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <AdminFilterTabs items={tabs} />
      <div className="flex flex-wrap gap-2">
        <form onSubmit={submitSearch} className="flex min-w-64 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-card)] focus-within:border-[var(--turquoise)]"><Search className="ml-3 mt-3 h-4 w-4 text-slate-400" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Reference, guest, phone or route" className="min-w-0 flex-1 border-0 px-3 py-2.5 text-sm outline-none" /><button className="bg-[var(--ocean)] px-4 text-xs font-bold text-white">Search</button></form>
        <Link href={query({archived:filters.archived?0:1})} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold ${filters.archived?"border-[var(--ocean)] bg-[var(--ocean)] text-white":"border-slate-200 bg-white text-slate-700"}`}><Archive className="h-4 w-4" />{filters.archived?"Archived":"View archive"}</Link>
      </div>
    </div>
    {requests.data.length ? <>
      <div className="grid gap-3 md:hidden">{requests.data.map(item=><article key={item.reference} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[var(--ocean)]">{item.reference}</p><h2 className="mt-1 font-display text-lg font-bold">{item.fullName}</h2></div><AdminStatusBadge status={item.status}/></div><div className="mt-4 rounded-xl bg-cyan-50/50 p-3"><p className="font-semibold">{item.pickup} → {item.destination}</p><p className="mt-1 text-xs text-slate-500">{item.travelDate} · {item.passengers} passenger{item.passengers===1?"":"s"}</p></div><p className="mt-3 text-sm text-slate-600">{item.phone}</p><Actions item={item} archived={filters.archived} canDelete={canPermanentlyDelete}/></article>)}</div>
      <div className="hidden md:block"><AdminTableShell><table className={adminTableClass}><thead className={adminTableHeadClass}><tr><th className={adminTableHeaderCellClass}>Request</th><th className={adminTableHeaderCellClass}>Route & travel</th><th className={adminTableHeaderCellClass}>Contact</th><th className={adminTableHeaderCellClass}>Price / status</th><th className={adminTableHeaderCellClass}><span className="sr-only">Actions</span></th></tr></thead><tbody>{requests.data.map(item=><tr key={item.reference} className={adminTableRowClass}><td className={adminTableCellClass}><Link href={`/admin/transport-requests/${item.reference}`} className="font-bold text-[var(--ocean)] hover:underline">{item.reference}</Link><p className="mt-1 font-semibold text-slate-900">{item.fullName}</p><p className="mt-1 text-xs text-slate-400">{item.serviceType} · {item.tripType}</p></td><td className={adminTableCellClass}><p className="max-w-80 font-semibold text-slate-800">{item.pickup} → {item.destination}</p><p className="mt-1 text-xs text-slate-500">{item.travelDate}{item.pickupTime?` at ${item.pickupTime}`:""} · {item.passengers} passenger{item.passengers===1?"":"s"}</p></td><td className={adminTableCellClass}><p className="font-medium">{item.phone}</p><p className="mt-1 text-xs text-slate-500">{item.email||"No email provided"}</p></td><td className={adminTableCellClass}>{item.estimatedPrice!=null?<p className="mb-2 font-bold text-emerald-700">{item.estimatedCurrency} {item.estimatedPrice.toFixed(2)}</p>:<p className="mb-2 text-xs font-semibold text-amber-700">Custom quote</p>}<AdminStatusBadge status={item.status}/></td><td className={`${adminTableCellClass} text-right`}><Actions item={item} archived={filters.archived} canDelete={canPermanentlyDelete} compact/></td></tr>)}</tbody></table></AdminTableShell></div>
    </>:<AdminTableShell><AdminEmptyState icon={Inbox} title={filters.archived?"No archived transport requests":"No transport requests found"} description="Try another status or search term."/></AdminTableShell>}
    <AdminPagination links={requests.links}/>
  </AdminLayout>;
}

function Actions({item,archived,canDelete,compact=false}:{item:Row;archived:boolean;canDelete:boolean;compact?:boolean}) { return <div className={`${compact?"inline-flex":"mt-4 flex border-t border-slate-100 pt-4"} flex-wrap justify-end gap-2`}>{!archived?<><Link href={`/admin/transport-requests/${item.reference}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--ocean)] px-3 py-2.5 text-xs font-bold text-white md:flex-none">View <ChevronRight className="h-3.5 w-3.5"/></Link><button aria-label="Archive" onClick={()=>confirm("Archive this transport request? You can restore it later.")&&router.delete(`/admin/transport-requests/${item.reference}`)} className="rounded-xl border border-slate-200 p-2.5 text-slate-500"><Archive className="h-4 w-4"/></button></>:<><button onClick={()=>router.patch(`/admin/transport-requests/${item.reference}/restore`)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-200 px-3 py-2.5 text-xs font-bold text-emerald-700"><RotateCcw className="h-3.5 w-3.5"/>Restore</button>{canDelete&&<button onClick={()=>confirm("Permanently delete this request? This cannot be undone.")&&router.delete(`/admin/transport-requests/${item.reference}/force`)} className="rounded-xl border border-red-200 p-2.5 text-red-700"><Trash2 className="h-4 w-4"/></button>}</>}</div>; }
function Summary({label,value,icon:Icon,tone}:{label:string;value:number;icon:typeof Clock3;tone:string}) { return <div className="relative flex items-center gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] md:p-5"><span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--turquoise)] to-[var(--accent)]"/><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5"/></span><div><strong className="font-display text-2xl text-[var(--ocean)]">{value}</strong><p className="text-xs font-semibold text-slate-500 md:text-sm">{label}</p></div></div>; }
