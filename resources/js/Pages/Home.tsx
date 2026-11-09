import { Head, Link } from "@inertiajs/react";
import { ArrowRight, Building2, BusFront, Compass, MapPinned, MessageCircle, TentTree } from "lucide-react";
import { Navbar } from "@/Components/Navbar";
import { Footer } from "@/Components/Footer";
import { TourCard } from "@/Components/TourCard";
import { WhatsAppFloatingButton } from "@/Components/WhatsAppFloatingButton";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";
import type { TourCardData } from "@/types/tour";
import { HeroSection, type HeroSlideData } from "@/Components/HeroSection";
import { TestimonialSlider, type PublicTestimonial } from "@/Components/TestimonialSlider";

type Partner={name:string;icon:string;url:string|null};
export default function HomePage({ tours, safaris, heroSlides, testimonials, partners }: { tours: TourCardData[]; safaris: TourCardData[]; heroSlides: HeroSlideData[]; testimonials: PublicTestimonial[]; partners:Partner[] }) {
    const site = useSiteConfig();
    const services = [
        { title: "Zanzibar Tours", text: "Ocean, culture and island moments.", image: "/images/experiences/zola-service-zanzibar-v2.webp", href: "/tours", action: "Explore tours" },
        { title: "Tanzania Safaris", text: "Wildlife journeys made simple.", image: "/images/experiences/zola-service-safari-v2.webp", href: "/safaris", action: "View safaris" },
        { title: "Private Transfers", text: "Easy airport and hotel transfers.", image: "/images/experiences/zola-service-transfer-v2.webp", href: "/transfers", action: "Book transfer" },
    ];
    const partnerIcons:{[key:string]:typeof Building2}={hotel:Building2,guide:MapPinned,camp:TentTree,transport:BusFront,company:Building2};

    return <div className="min-h-screen bg-white">
        <Head><title>Zola Tours & Safaris | Zanzibar & Tanzania</title><meta name="description" content="Discover memorable Zanzibar tours and carefully planned Tanzania safaris with a trusted local team." /></Head>
        <Navbar />
        <main>
            <HeroSection slides={heroSlides} />
            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent)]">Our services</p><h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Choose how you want to explore</h2></div>
                <div className="mt-8 grid gap-5 md:grid-cols-3">{services.map(service => <Link key={service.title} href={service.href} className="group relative isolate min-h-72 overflow-hidden rounded-2xl bg-[var(--ocean)] text-white shadow-sm"><img src={service.image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#061d2d]/95 via-[#061d2d]/35 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6"><h3 className="text-2xl font-extrabold">{service.title}</h3><p className="mt-2 text-sm leading-6 text-white/75">{service.text}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--turquoise)]">{service.action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></Link>)}</div>
            </section>
            <section className="bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent)]">Zanzibar experiences</p><h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Our most-loved tours</h2><p className="mt-3 max-w-xl text-slate-500">Choose a simple island experience and contact us when you are ready.</p></div><Link href="/tours" className="inline-flex items-center gap-2 font-bold text-[var(--ocean)]">View all tours <ArrowRight className="h-4 w-4" /></Link></div>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{tours.slice(0, 6).map((tour) => <TourCard key={tour.slug} tour={tour} />)}</div>
            </div></section>
            {safaris.length > 0 && <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent)]">Mainland Tanzania</p><h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Safari ideas from Zola</h2><p className="mt-3 max-w-xl text-slate-500">Choose a starting point, then we tailor the details around your dates and travel style.</p></div><Link href="/safaris" className="inline-flex items-center gap-2 font-bold text-[var(--ocean)]">View all safaris <ArrowRight className="h-4 w-4" /></Link></div>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{safaris.map((safari) => <TourCard key={safari.slug} tour={safari} />)}</div>
            </section>}
            {testimonials.length > 0 && <section className="bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto mb-5 max-w-xl text-center"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--accent)]">Guest stories</p><h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">What travellers say</h2></div><TestimonialSlider items={testimonials}/><div className="mt-4 text-center"><Link href="/feedback" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--ocean)]">Share your experience <ArrowRight className="h-3.5 w-3.5"/></Link></div></div></section>}
            <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
                <div className="relative overflow-hidden rounded-[2rem]"><img src="/images/experiences/cta-zanzibar.webp" alt="A memorable Zanzibar island experience" className="aspect-[4/3] h-full w-full object-cover" /><div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur"><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">Local to Zanzibar</p><p className="mt-1 font-bold text-[var(--ocean)]">Explore with people who know the island</p></div></div>
                <div><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[var(--accent)]"><Compass className="h-4 w-4" /> About Zola</span><h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Your trip, made easy.</h2><p className="mt-5 max-w-xl leading-8 text-slate-600">Zola Tours & Safaris connects you with memorable Zanzibar experiences and Tanzania safari journeys. We keep planning clear, personal and focused on how you want to travel.</p><Link href="/about" className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--ocean)] px-6 py-3 font-bold text-[var(--ocean)] transition hover:bg-[var(--ocean)] hover:text-white">Meet Zola Tours <ArrowRight className="h-4 w-4" /></Link></div>
            </section>
            {partners.length>0&&<section className="border-y border-slate-100 bg-slate-50/70"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="flex flex-col items-center gap-5 lg:flex-row lg:justify-between"><div className="text-center lg:text-left"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--accent)]">Our partners</p><h2 className="mt-1 text-lg font-extrabold text-[var(--ocean)]">A trusted local travel network</h2></div><div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-3xl">{partners.map((partner)=>{const Icon=partnerIcons[partner.icon]??Building2;const content=<><Icon className="h-4 w-4 text-[var(--turquoise)]"/><span>{partner.name}</span></>;return partner.url?<a key={partner.name} href={partner.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600 transition hover:border-[var(--turquoise)]">{content}</a>:<div key={partner.name} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600">{content}</div>})}</div></div></div></section>}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="relative overflow-hidden rounded-[2rem] bg-[var(--ocean)] px-6 py-12 text-center text-white sm:px-12"><h2 className="text-3xl font-extrabold sm:text-4xl">Ready to plan your trip?</h2><p className="mx-auto mt-3 max-w-xl text-white/75">Tell us your dates, destination and travel style. We will help with the rest.</p><a href={getWhatsAppLink("Hello Zola Tours, I would like to plan my trip.", site)} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-bold text-white"><MessageCircle className="h-4 w-4" /> Start on WhatsApp</a></div></section>
        </main>
        <Footer /><WhatsAppFloatingButton />
    </div>;
}
