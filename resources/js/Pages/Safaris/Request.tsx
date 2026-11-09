import { FormEvent, type ReactNode } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import { Navbar } from "@/Components/Navbar";
import { Footer } from "@/Components/Footer";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";

type Tour = { slug:string; title:string; duration:string; days:number; location:string; price:number; groupPrice:number|null; childPrice:number; currency:string; image:string; parks:string[] };
type Props = { tour:Tour; defaults:{date:string; adults:number; children:number} };

export default function SafariRequest({tour,defaults}:Props){
  const site=useSiteConfig();
  const form=useForm({tour_slug:tour.slug,name:"",preferred_contact:"whatsapp",email:"",whatsapp:"",start_date:defaults.date,days:tour.days,adults:defaults.adults,children:defaults.children,parks:tour.parks,accommodation:"Not sure",arrival_point:"Zanzibar",budget:"",notes:"",consent:false,website:""});
  const payingGuests=form.data.adults+form.data.children;
  const adultPrice=payingGuests>=6&&tour.groupPrice!==null?tour.groupPrice:tour.price;
  const total=adultPrice*form.data.adults+tour.childPrice*form.data.children;
  const money=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:tour.currency,maximumFractionDigits:0}).format(value);
  const submit=(event:FormEvent)=>{event.preventDefault();form.post("/safari-requests",{preserveScroll:true});};
  const input="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--turquoise)] focus:ring-2 focus:ring-[var(--turquoise)]/10";
  return <div className="min-h-screen bg-slate-50"><Head title={`Book ${tour.title}`} /><Navbar/><main>
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/safaris/${tour.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ocean)]"><ArrowLeft className="h-4 w-4"/>Back to safari</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28"><img src={tour.image} alt={tour.title} className="aspect-[16/10] w-full object-cover"/><div className="p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">Safari booking</p><h1 className="mt-2 text-2xl font-extrabold">{tour.title}</h1><p className="mt-2 text-sm text-slate-500">{tour.duration} · {tour.location}</p><div className="mt-5 border-t border-slate-100 pt-5"><p className="text-xs text-slate-500">Fixed price</p><p className="text-3xl font-extrabold text-[var(--ocean)]">{money(adultPrice)} <span className="text-sm font-medium text-slate-400">/ adult</span></p><p className="mt-1 text-xs text-slate-400">Child: {money(tour.childPrice)} per child</p>{tour.groupPrice!==null&&<p className="mt-2 text-xs font-semibold text-emerald-700">Group rate: {money(tour.groupPrice)} per adult for 6+ paying guests</p>}</div><div className="mt-5 flex items-end justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm text-slate-500">Total due on arrival</span><strong className="text-2xl text-[var(--ocean)]">{money(total)}</strong></div><p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0 text-[var(--turquoise)]"/>Automatic confirmation and payment voucher. Pay on arrival.</p></div></aside>
        <div>
          <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-2xl font-extrabold">Complete your booking</h2><p className="mt-2 text-sm text-slate-500">Enter your details to receive automatic confirmation and a payment voucher.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Start date" error={form.errors.start_date}><input type="date" min={new Date().toISOString().split("T")[0]} value={form.data.start_date} onChange={e=>form.setData("start_date",e.target.value)} className={input}/></Field>
              <Field label="Accommodation" error={form.errors.accommodation}><select value={form.data.accommodation} onChange={e=>form.setData("accommodation",e.target.value)} className={input}>{["Not sure","Budget","Mid-range","Luxury"].map(x=><option key={x}>{x}</option>)}</select></Field>
              <Field label="Adults" error={form.errors.adults}><input type="number" min="1" max="30" value={form.data.adults} onChange={e=>form.setData("adults",Math.max(1,Number(e.target.value)))} className={input}/></Field>
              <Field label="Children" error={form.errors.children}><input type="number" min="0" max="20" value={form.data.children} onChange={e=>form.setData("children",Math.max(0,Number(e.target.value)))} className={input}/></Field>
              <Field label="Full name" error={form.errors.name}><input value={form.data.name} onChange={e=>form.setData("name",e.target.value)} className={input}/></Field>
              <Field label="Preferred contact" error={form.errors.preferred_contact}><select value={form.data.preferred_contact} onChange={e=>form.setData("preferred_contact",e.target.value)} className={input}><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select></Field>
              <Field label="WhatsApp number" error={form.errors.whatsapp}><input value={form.data.whatsapp} onChange={e=>form.setData("whatsapp",e.target.value)} placeholder="+255..." className={input}/></Field>
              <Field label="Email address (required for email voucher)" error={form.errors.email}><input type="email" value={form.data.email} onChange={e=>form.setData("email",e.target.value)} className={input}/></Field>
              <Field label="Starting from" error={form.errors.arrival_point}><select value={form.data.arrival_point} onChange={e=>form.setData("arrival_point",e.target.value)} className={input}>{["Zanzibar","Dar es Salaam","Arusha","Other","Not sure"].map(x=><option key={x}>{x}</option>)}</select></Field>
              <div className="sm:col-span-2"><Field label="Special requests (optional)" error={form.errors.notes}><textarea rows={4} value={form.data.notes} onChange={e=>form.setData("notes",e.target.value)} className={input}/></Field></div>
            </div>
            <input className="hidden" tabIndex={-1} autoComplete="off" value={form.data.website} onChange={e=>form.setData("website",e.target.value)}/>
            <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-slate-500"><input type="checkbox" className="mt-1" checked={form.data.consent} onChange={e=>form.setData("consent",e.target.checked)}/><span>I agree to the booking details, fixed total and payment on arrival.</span></label>{form.errors.consent&&<p className="mt-2 text-xs font-semibold text-red-600">{form.errors.consent}</p>}
            <button disabled={form.processing} className="mt-6 w-full rounded-xl bg-[var(--ocean)] px-6 py-3.5 font-bold text-white disabled:opacity-60">{form.processing?"Confirming…":"Confirm safari booking"}</button>
            <a href={getWhatsAppLink(`Hello Zola Tours, I am interested in ${tour.title}.`,site)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366] px-5 py-3 font-bold text-[#168a43]"><MessageCircle className="h-5 w-5"/>Ask on WhatsApp</a>
          </form></div>
      </div>
    </section>
  </main><Footer/></div>;
}

function Field({label,error,children}:{label:string;error?:string;children:ReactNode}){return <label className="grid gap-1.5 text-xs font-bold text-slate-600"><span>{label}</span>{children}{error&&<span className="font-semibold text-red-600">{error}</span>}</label>}
