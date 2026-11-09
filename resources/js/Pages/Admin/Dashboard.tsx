import { AdminLayout } from "@/Components/AdminLayout";
import { AdminStatusBadge } from "@/Components/AdminStatusBadge";
import { Link } from "@inertiajs/react";
import { ArrowRight, Binoculars, BookOpen, CalendarCheck2, CarFront, ClipboardCheck } from "lucide-react";

type Activity = { type:string; title:string; customer:string; reference:string; status:string; date:string; href:string; createdAt:string };
type Props = { stats:{ publishedTours:number; pendingBookings:number; newSafaris:number; newTransfers:number; needsAttention:number }; recentActivity:Activity[] };

export default function AdminDashboard({stats,recentActivity}:Props){
  const cards=[
    {label:"Tour bookings",value:stats.pendingBookings,description:"Waiting for review",href:"/admin/bookings?status=pending",icon:CalendarCheck2,color:"bg-sky-50 text-sky-700"},
    {label:"Safari requests",value:stats.newSafaris,description:"New planning requests",href:"/admin/inquiries?source=safari",icon:Binoculars,color:"bg-emerald-50 text-emerald-700"},
    {label:"Transfer requests",value:stats.newTransfers,description:"Waiting for a response",href:"/admin/transport-requests?status=new",icon:CarFront,color:"bg-amber-50 text-amber-700"},
  ];
  return <AdminLayout title="Dashboard">
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ocean)] via-[#07506a] to-[#087f9d] px-6 py-7 text-white shadow-[var(--shadow-soft)] sm:px-8 sm:py-9">
      <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full border-[36px] border-[var(--turquoise)]/10"/><div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-[var(--accent)]/10 blur-2xl"/>
      <div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--turquoise)]">Zola admin workspace</p><h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Welcome back</h1><p className="mt-2 max-w-xl text-sm text-white/65">Review new customer requests and keep tours, safaris and transfers up to date.</p></div>
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur ${stats.needsAttention?"border-amber-300/30 bg-amber-400/10":"border-emerald-300/30 bg-emerald-400/10"}`}><ClipboardCheck className={`h-5 w-5 ${stats.needsAttention?"text-amber-300":"text-emerald-300"}`}/><div><strong className="block text-sm text-white">{stats.needsAttention} need attention</strong><span className="text-xs text-white/55">Across all customer requests</span></div></div></div>
    </div>

    <div className="mt-7 grid gap-4 md:grid-cols-3">{cards.map(({label,value,description,href,icon:Icon,color})=><Link key={label} href={href} className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--turquoise)] hover:shadow-[var(--shadow-soft)]"><span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--turquoise)] to-[var(--accent)] opacity-0 transition group-hover:opacity-100"/><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5"/></span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--ocean)]"/></div><p className="mt-5 font-display text-4xl font-bold text-[var(--ocean)]">{value}</p><h2 className="mt-1 font-bold text-slate-800">{label}</h2><p className="mt-1 text-xs text-slate-500">{description}</p></Link>)}</div>

    <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[var(--shadow-card)]"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-display text-xl font-bold text-[var(--ocean)]">Recent activity</h2><p className="text-xs text-slate-500">Latest tours, safaris and transfer requests</p></div>
        {recentActivity.length?<div className="divide-y divide-slate-100">{recentActivity.map(item=><Link key={`${item.type}-${item.reference}`} href={item.href} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"><span className={`hidden w-24 shrink-0 rounded-full px-3 py-1 text-center text-[10px] font-extrabold uppercase tracking-wide sm:block ${item.type==="Safari"?"bg-emerald-50 text-emerald-700":item.type==="Transfer"?"bg-amber-50 text-amber-700":"bg-sky-50 text-sky-700"}`}>{item.type}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{item.title}</p><p className="mt-1 truncate text-xs text-slate-500">{item.customer} · {item.reference} · {item.date}</p></div><AdminStatusBadge status={item.status}/><ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block"/></Link>)}</div>:<div className="px-6 py-14 text-center"><CalendarCheck2 className="mx-auto h-9 w-9 text-slate-300"/><p className="mt-3 text-sm font-bold text-slate-600">No customer requests yet</p></div>}
      </section>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]"><h2 className="font-display text-xl font-bold text-[var(--ocean)]">Quick actions</h2><p className="mt-1 text-xs text-slate-500">Common website tasks</p><div className="mt-5 grid gap-2"><Link href="/admin/tours" className="flex items-center gap-3 rounded-xl bg-cyan-50/60 p-3 text-sm font-bold text-slate-700 hover:bg-cyan-100/70"><BookOpen className="h-4 w-4 text-[var(--ocean)]"/>Manage tours</Link><Link href="/admin/tours?type=safari" className="flex items-center gap-3 rounded-xl bg-cyan-50/60 p-3 text-sm font-bold text-slate-700 hover:bg-cyan-100/70"><Binoculars className="h-4 w-4 text-[var(--ocean)]"/>Manage safaris</Link><Link href="/admin/cms/settings?section=general" className="flex items-center gap-3 rounded-xl bg-cyan-50/60 p-3 text-sm font-bold text-slate-700 hover:bg-cyan-100/70"><ClipboardCheck className="h-4 w-4 text-[var(--ocean)]"/>Site settings</Link></div><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500"><strong className="text-slate-800">{stats.publishedTours}</strong> published tours and safaris</p></div></aside>
    </div>
  </AdminLayout>;
}
