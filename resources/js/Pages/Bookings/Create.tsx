import { FormEvent, useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { Clock, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Footer } from "@/Components/Footer";
import { Navbar } from "@/Components/Navbar";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";
import type { TourPricing } from "@/types/tour";

type TourSummary = { id:number; slug:string; title:string; description:string; duration:string; location:string; price:number; currency:string; pricing:TourPricing; image:string };
type Props = { tour: TourSummary };

export default function BookingCreate({ tour }: Props) {
    const site = useSiteConfig();
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const today = new Date().toISOString().split("T")[0];
    const { data, setData, post, processing, errors } = useForm({
        tour_id: tour.id,
        booking_type: (tour.pricing.sharedAvailable ? "shared" : "private") as "shared" | "private",
        full_name: "",
        email: "",
        whatsapp: "",
        preferred_contact: "whatsapp" as "whatsapp" | "phone" | "email",
        travel_date: params.get("date") || "",
        adults: Math.max(1, Number(params.get("adults")) || 2),
        children: Math.max(0, Number(params.get("children")) || 0),
        children_ages: Array.from({ length: Math.max(0, Number(params.get("children")) || 0) }, () => 6),
        pickup_zone: "not_sure",
        hotel: "",
        special_requests: "",
        consent: false,
        website: "",
    });
    const money = (value:number) => new Intl.NumberFormat("en-US", { style:"currency", currency:tour.currency, maximumFractionDigits:0 }).format(value);
    const estimate = useMemo(() => {
        const payingChildren = data.children_ages.filter(age=>age>=4).length;
        const infants = data.children_ages.length-payingChildren;
        const payingGuests = data.adults+payingChildren;
        const regularAdult = tour.pricing.sharedAdultPrice ?? tour.price;
        const adult = payingGuests>=6 && tour.pricing.sharedGroupAdultPrice!==null ? tour.pricing.sharedGroupAdultPrice : regularAdult;
        const child = tour.pricing.sharedChildPrice ?? regularAdult * .6;
        const infant = tour.pricing.sharedInfantPrice ?? 0;
        if (data.booking_type === "shared") return adult * data.adults + child * payingChildren + infant * infants;
        const guests = data.adults + data.children;
        const tier = tour.pricing.privateTiers.find(item => guests >= item.min && guests <= item.max);
        if (!tier?.price) return null;
        return tier.price + (tour.pricing.privateChildSupplement ?? 0) * data.children;
    }, [data.adults, data.children, data.children_ages, data.booking_type, tour]);

    function updateChildren(value:number) {
        const count = Math.max(0, Math.min(20, value));
        setData("children", count);
        setData("children_ages", Array.from({ length: count }, (_, i) => data.children_ages[i] ?? 6));
    }
    function submit(event:FormEvent) { event.preventDefault(); post("/bookings", { preserveScroll:true }); }

    return <div className="min-h-screen bg-slate-50">
        <Head title={`Book ${tour.title}`} />
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <Link href={`/tours/${tour.slug}`} className="text-sm font-bold text-[var(--ocean)]">← Back to tour</Link>
            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--turquoise)]">Simple booking request</p>
                    <h1 className="mt-2 text-3xl font-extrabold">Book {tour.title}</h1>
                    <p className="mt-2 text-sm text-slate-500">Complete the essentials below. No payment is required now.</p>

                    {Object.keys(errors).length > 0 && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Please check the highlighted fields and try again.</div>}

                    <form onSubmit={submit} className="mt-7 grid gap-5">
                        <input type="hidden" value={data.website} onChange={e=>setData("website",e.target.value)} />
                        {tour.pricing.sharedAvailable && tour.pricing.privateAvailable && <div className="grid grid-cols-2 gap-3">
                            {(["shared","private"] as const).map(type=><button key={type} type="button" onClick={()=>setData("booking_type",type)} className={`rounded-xl border p-3 text-left ${data.booking_type===type?"border-[var(--ocean)] bg-cyan-50":"border-slate-200"}`}><strong className="block text-sm">{type==="shared"?"Shared tour":"Private tour"}</strong><span className="text-xs text-slate-500">{type==="shared"?"Price per person":"Only your group"}</span></button>)}
                        </div>}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field label="Travel date" error={errors.travel_date}><input type="date" min={today} required value={data.travel_date} onChange={e=>setData("travel_date",e.target.value)} className={input} /></Field>
                            <Field label="Adults" error={errors.adults}><input type="number" min="1" max="30" required value={data.adults} onChange={e=>setData("adults",Math.max(1,Number(e.target.value)))} className={input} /></Field>
                            <Field label="Children" error={errors.children}><input type="number" min="0" max="20" value={data.children} onChange={e=>updateChildren(Number(e.target.value))} className={input} /></Field>
                        </div>
                        {data.children > 0 && <Field label="Children's ages" error={errors.children_ages}><div className="flex flex-wrap gap-2">{data.children_ages.map((age,i)=><select key={i} value={age} onChange={e=>{const ages=[...data.children_ages];ages[i]=Number(e.target.value);setData("children_ages",ages)}} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{Array.from({length:12},(_,n)=><option key={n} value={n}>Child {i+1}: {n}</option>)}</select>)}</div><p className="mt-2 text-xs text-slate-400">Ages 0–3 are free. Child price applies from 4–11 years; guests aged 12+ are counted as adults.</p></Field>}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Full name" error={errors.full_name}><input required autoComplete="name" value={data.full_name} onChange={e=>setData("full_name",e.target.value)} className={input} placeholder="Your full name" /></Field>
                            <Field label="WhatsApp number" error={errors.whatsapp}><input required autoComplete="tel" value={data.whatsapp} onChange={e=>setData("whatsapp",e.target.value)} className={input} placeholder="+255 ..." /></Field>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Pickup area" error={errors.pickup_zone}><select value={data.pickup_zone} onChange={e=>setData("pickup_zone",e.target.value)} className={input}><option value="not_sure">Not sure yet</option><option value="stone_town">Stone Town / Airport</option><option value="north">North Coast</option><option value="east">East Coast</option><option value="south_east">South / South East</option><option value="other">Other</option></select></Field>
                            <Field label="Hotel (optional)" error={errors.hotel}><input value={data.hotel} onChange={e=>setData("hotel",e.target.value)} className={input} placeholder="Hotel name" /></Field>
                        </div>
                        <details className="rounded-xl border border-slate-200"><summary className="cursor-pointer px-4 py-3 text-sm font-bold text-[var(--ocean)]">Add email or special request</summary><div className="grid gap-4 border-t border-slate-200 p-4"><Field label="Email (optional)" error={errors.email}><input type="email" value={data.email} onChange={e=>setData("email",e.target.value)} className={input} /></Field><Field label="Special request" error={errors.special_requests}><textarea rows={3} value={data.special_requests} onChange={e=>setData("special_requests",e.target.value)} className={input} /></Field></div></details>
                        <label className="flex items-start gap-3 text-xs leading-5 text-slate-500"><input type="checkbox" required checked={data.consent} onChange={e=>setData("consent",e.target.checked)} className="mt-1" /><span>I agree to be contacted about this request and accept the booking terms. No payment is required now.</span></label>
                        <button disabled={processing} className="min-h-12 rounded-xl bg-[var(--ocean)] px-6 font-bold text-white hover:brightness-110 disabled:opacity-60">{processing?"Sending…":"Send booking request"}</button>
                    </form>
                </section>

                <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
                    <img src={tour.image} alt={tour.title} className="aspect-[4/3] w-full object-cover" />
                    <div className="p-5"><h2 className="text-xl font-extrabold">{tour.title}</h2><div className="mt-4 space-y-2 text-sm text-slate-500"><p className="flex gap-2"><Clock className="h-4 w-4 text-[var(--turquoise)]" />{tour.duration}</p><p className="flex gap-2"><MapPin className="h-4 w-4 text-[var(--turquoise)]" />{tour.location}</p></div><div className="my-5 border-t border-slate-200" /><div className="flex items-end justify-between"><span className="text-sm text-slate-500">Estimated total</span><strong className="text-2xl text-[var(--ocean)]">{estimate!==null?money(estimate):"Confirm price"}</strong></div>{data.booking_type==="shared"&&<><p className="mt-2 text-xs text-slate-400">{money(tour.pricing.sharedAdultPrice ?? tour.price)} per adult{data.children>0?` · ${money(tour.pricing.sharedChildPrice ?? (tour.pricing.sharedAdultPrice ?? tour.price)*.6)} per child`:""}</p>{tour.pricing.sharedGroupAdultPrice!==null&&<p className="mt-1 text-xs font-semibold text-emerald-700">Group rate: {money(tour.pricing.sharedGroupAdultPrice)} per adult for 6+ paying guests</p>}</>}<p className="mt-2 text-xs text-slate-400">Hotel transfer is not included unless shown separately.</p><a href={getWhatsAppLink(`Hello Zola Tours, I am interested in ${tour.title}.`,site)} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#25D366] py-3 text-sm font-bold text-[#168a43]"><MessageCircle className="h-4 w-4" /> Ask on WhatsApp</a><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-[var(--turquoise)]" /> Payment due on arrival</div></div>
                </aside>
            </div>
        </main>
        <Footer />
    </div>;
}

function Field({ label,error,children }:{label:string;error?:string;children:React.ReactNode}) { return <label className="grid gap-1.5"><span className="text-xs font-bold text-slate-600">{label}</span>{children}{error&&<span className="text-xs text-red-600">{error}</span>}</label> }
const input="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[var(--turquoise)] focus:ring-2 focus:ring-cyan-100";
