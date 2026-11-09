import { Head } from "@inertiajs/react";
import { MessageCircle } from "lucide-react";
import { Footer } from "@/Components/Footer";
import { Navbar } from "@/Components/Navbar";
import { TourCard } from "@/Components/TourCard";
import { WhatsAppFloatingButton } from "@/Components/WhatsAppFloatingButton";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";
import type { TourCardData } from "@/types/tour";

type Props = {
    tours: {
        data: TourCardData[];
        total: number;
    };
    isSafari?: boolean;
    eyebrow?: string;
    pageTitle?: string;
    pageDescription?: string;
};

export default function ToursIndex({ tours, isSafari = false, eyebrow, pageTitle, pageDescription }: Props) {
    const site = useSiteConfig();
    const title = pageTitle || (isSafari ? "Tanzania safaris, planned simply" : "Choose your island experience");
    const description = pageDescription || (isSafari ? "Start from Zanzibar or mainland Tanzania and let us shape a safari around your time and travel style." : "A simple collection of tours across Zanzibar's beaches, culture, nature and ocean.");
    const fullDayTours = tours.data.filter(tour => /full\s*day/i.test(tour.duration));
    const halfDayTours = tours.data.filter(tour => !/full\s*day/i.test(tour.duration));
    return <div className="min-h-screen bg-white">
        <Head><title>{`${isSafari ? "Tanzania Safaris" : "Zanzibar Tours"} | Zola Tours & Safaris`}</title><meta name="description" content={description} /></Head>
        <Navbar />
        <main>
            <section className="relative isolate overflow-hidden py-24 text-white sm:py-32">
                <img src={isSafari ? "/images/experiences/hero-safari.webp" : "/images/experiences/hero-ocean.webp"} alt={isSafari ? "Tanzania safari landscape" : "Turquoise waters of Zanzibar"} className="absolute inset-0 -z-20 h-full w-full object-cover" />
                <div className="absolute inset-0 -z-10 bg-[#061d2d]/70" />
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--turquoise)]">{eyebrow || (isSafari ? "Mainland Tanzania" : "Explore Zanzibar")}</p><h1 className="mt-3 text-4xl font-extrabold sm:text-6xl">{title}</h1><p className="mx-auto mt-4 max-w-2xl text-white/75">{description}</p></div>
            </section>
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {tours.data.length > 0 ? isSafari
                    ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{tours.data.map((tour) => <TourCard key={tour.slug} tour={tour} />)}</div>
                    : <div className="space-y-16">
                        {halfDayTours.length > 0 && <TourGroup eyebrow="Short & easy" title="Half-Day Zanzibar Tours" description="Ideal for a relaxed morning or afternoon experience." tours={halfDayTours} />}
                        {fullDayTours.length > 0 && <TourGroup eyebrow="More time to explore" title="Full-Day Zanzibar Tours" description="Complete island and ocean experiences planned for the day." tours={fullDayTours} />}
                    </div>
                    : <div className="rounded-3xl bg-slate-50 px-6 py-16 text-center"><h2 className="text-2xl font-bold">{isSafari ? "Safari ideas are being prepared" : "Tours are being prepared"}</h2><p className="mt-2 text-slate-500">Contact us and we will recommend the right {isSafari ? "Tanzania safari" : "Zanzibar experience"}.</p></div>}
            </section>
            <section className="bg-slate-50"><div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6"><h2 className="text-3xl font-extrabold">Need help choosing?</h2><p className="mt-3 text-slate-500">Tell us your dates, group size and interests. Our local team will guide you.</p><a href={getWhatsAppLink(isSafari ? "Hello Zola Tours, please help me plan a Tanzania safari." : "Hello Zola Tours, please help me choose a Zanzibar tour.", site)} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-bold text-white"><MessageCircle className="h-4 w-4" /> Ask on WhatsApp</a></div></section>
        </main>
        <Footer /><WhatsAppFloatingButton />
    </div>;
}

function TourGroup({ eyebrow, title, description, tours }: { eyebrow: string; title: string; description: string; tours: TourCardData[] }) {
    return <section>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent)]">{eyebrow}</p><h2 className="mt-2 text-3xl font-extrabold">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p></div>
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{tours.map(tour => <TourCard key={tour.slug} tour={tour} />)}</div>
    </section>;
}
