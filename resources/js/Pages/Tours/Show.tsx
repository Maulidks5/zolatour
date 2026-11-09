import { useEffect, useMemo, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { Check, ChevronLeft, ChevronRight, Clock, Images, MapPin, MessageCircle, ShieldCheck, Star, X } from "lucide-react";
import { Footer } from "@/Components/Footer";
import { Navbar } from "@/Components/Navbar";
import { SectionHeading } from "@/Components/SectionHeading";
import { TourCard } from "@/Components/TourCard";
import { WhatsAppFloatingButton } from "@/Components/WhatsAppFloatingButton";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";
import type { TourCardData, TourDetailData } from "@/types/tour";

type Props = {
  tour: TourDetailData;
  relatedTours: TourCardData[];
};

export default function TourShow({ tour, relatedTours }: Props) {
  const site = useSiteConfig();
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const gallery = useMemo(() => {
    const images = [{ path: tour.image, alt: tour.title }, ...tour.images];
    return images.filter((image, index) => images.findIndex((item) => item.path === image.path) === index);
  }, [tour.image, tour.images, tour.title]);
  const isSafari = tour.experienceType === "safari";
  const cataloguePath = isSafari ? "/safaris" : "/tours";
  const catalogueLabel = isSafari ? "All safaris" : "All tours";
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: tour.currency,
    maximumFractionDigits: 0,
  }).format(tour.price);
  const priceLabel = tour.price > 0 ? price : "Custom quote required";
  const bookingMessage = `Hello Zola Tours, I would like to book ${tour.title}${bookingDate ? ` on ${bookingDate}` : ""} for ${adults} adult(s) and ${children} child(ren).`;
  const regularAdultPrice = tour.pricing.sharedAdultPrice ?? tour.price;
  const adultPrice = adults + children >= 6 && tour.pricing.sharedGroupAdultPrice !== null ? tour.pricing.sharedGroupAdultPrice : regularAdultPrice;
  const childPrice = tour.pricing.sharedChildPrice ?? adultPrice * 0.6;
  const estimatedTotal = adultPrice > 0 ? adultPrice * adults + childPrice * children : null;
  const bookingQuery = new URLSearchParams({ ...(bookingDate ? { date: bookingDate } : {}), adults: String(adults), children: String(children) }).toString();
  const canonicalUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.metaDescription || tour.description,
    image: tour.image,
    touristType: tour.experienceType === "safari" ? "Safari travellers" : "Zanzibar travellers",
    itinerary: tour.location,
    provider: {
      "@type": "TravelAgency",
      name: site.name,
      telephone: site.phone,
      email: site.email,
      address: site.location,
    },
    ...(tour.price > 0 ? {
      offers: {
        "@type": "Offer",
        price: tour.price,
        priceCurrency: tour.currency,
        url: canonicalUrl,
        availability: "https://schema.org/InStock",
      },
    } : {}),
  };

  useEffect(() => {
    if (activeImage === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowLeft") setActiveImage((current) => current === null ? null : (current - 1 + gallery.length) % gallery.length);
      if (event.key === "ArrowRight") setActiveImage((current) => current === null ? null : (current + 1) % gallery.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImage, gallery.length]);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Head>
        <title>{tour.metaTitle || tour.title}</title>
        <meta name="description" content={tour.metaDescription || tour.description} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={tour.metaTitle || tour.title} />
        <meta property="og:description" content={tour.metaDescription || tour.description} />
        <meta property="og:image" content={tour.image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>

      <Navbar />
      <main>
        <section className="relative min-h-[26rem] overflow-hidden sm:min-h-[30rem]">
          <img src={tour.image} alt={tour.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10182d]/95 via-[#10182d]/45 to-[#10182d]/30" />
          <div className="relative mx-auto flex min-h-[26rem] max-w-7xl items-end px-4 pb-8 pt-16 sm:min-h-[30rem] sm:px-6 sm:pb-10 lg:px-8">
            <div className="max-w-4xl text-white">
              <Link href={cataloguePath} className="inline-flex items-center gap-1 text-sm font-medium text-white/75 hover:text-white">
                <ChevronLeft className="h-4 w-4" /> {catalogueLabel}
              </Link>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{tour.category}</p>
              <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{tour.title}</h1>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/85">
                <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> {tour.duration}</span>
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {tour.location}</span>
                {tour.reviewsCount > 0 && <span className="hidden items-center gap-2 sm:inline-flex"><Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />{tour.rating} ({tour.reviewsCount} reviews)</span>}
                {tour.minimumAge !== null && <span className="hidden sm:inline">Minimum age: {tour.minimumAge}</span>}
                {tour.difficulty && <span className="hidden sm:inline">Level: {tour.difficulty}</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
          <div className="space-y-10">
            <section>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--turquoise)]">Overview</p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{isSafari ? "About this safari" : "About this experience"}</h2>
              <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-muted-foreground">{tour.fullDescription}</p>
            </section>

            {gallery.length > 1 && (
              <section>
                <div className="flex items-end justify-between gap-4">
                  <h2 className="font-display text-3xl font-bold">Experience gallery</h2>
                  <button type="button" onClick={() => setActiveImage(0)} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--ocean)]">
                    <Images className="h-4 w-4" /> View all
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 overflow-hidden rounded-2xl sm:grid-cols-4 sm:grid-rows-2">
                  {gallery.slice(0, 5).map((image, index) => (
                    <button type="button" key={image.path} onClick={() => setActiveImage(index)} className={`group relative overflow-hidden bg-muted ${index === 0 ? "col-span-2 row-span-2 aspect-[4/3] sm:aspect-auto" : "aspect-[4/3]"}`}>
                      <img src={image.path} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      {index === 4 && gallery.length > 5 && <span className="absolute inset-0 grid place-items-center bg-[#10182d]/65 text-sm font-bold text-white">+{gallery.length - 5} photos</span>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {tour.highlights.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">{isSafari ? "Safari highlights" : "Tour highlights"}</h2>
                <div className="mt-5 grid gap-x-8 gap-y-4 border-y border-border py-5 sm:grid-cols-2">
                  {tour.highlights.map((highlight) => <div key={highlight} className="flex items-start gap-3"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--turquoise)]/10"><Check className="h-4 w-4 text-[var(--turquoise)]" /></span><span className="text-sm font-medium leading-6">{highlight}</span></div>)}
                </div>
              </section>
            )}

            {(tour.included.length > 0 || tour.notIncluded.length > 0) && (
              <section className="grid gap-6 md:grid-cols-2">
                {tour.included.length > 0 && <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-display text-2xl font-bold">What’s included</h2>
                  <ul className="mt-5 space-y-3">{tour.included.map((item) => <li key={item} className="flex gap-3 text-sm"><Check className="h-5 w-5 shrink-0 text-[var(--turquoise)]" /> {item}</li>)}</ul>
                </div>}
                {tour.notIncluded.length > 0 && <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-display text-2xl font-bold">Not included</h2>
                  <ul className="mt-5 space-y-3">{tour.notIncluded.map((item) => <li key={item} className="flex gap-3 text-sm"><X className="h-5 w-5 shrink-0 text-orange-600" /> {item}</li>)}</ul>
                </div>}
              </section>
            )}

            {tour.itinerary.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">Your itinerary</h2>
                <ol className="mt-6 space-y-6 border-l-2 border-[var(--turquoise)]/25 pl-7">
                  {tour.itinerary.map((item, index) => <li key={`${item.title}-${index}`} className="relative">
                    <span className="absolute -left-[2.15rem] top-1 grid h-4 w-4 place-items-center rounded-full bg-[var(--turquoise)] ring-4 ring-background" />
                    {item.time && <p className="text-xs font-bold uppercase tracking-wider text-[var(--turquoise)]">{item.time}</p>}
                    <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
                    {item.description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>}
                  </li>)}
                </ol>
              </section>
            )}

            {tour.pickupDetails && <section className="rounded-2xl bg-[var(--sand)] p-6 md:p-8">
              <div className="flex items-start gap-4"><ShieldCheck className="h-7 w-7 shrink-0 text-[var(--ocean)]" /><div><h2 className="font-display text-2xl font-bold">Pickup details</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{tour.pickupDetails}</p></div></div>
            </section>}

            {tour.faqs.length > 0 && <section>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--turquoise)]">Good to know</p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
              <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {tour.faqs.map((faq, index) => <details key={`${faq.question}-${index}`} className="group p-5 open:bg-[var(--sand)]/35">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold"><span>{faq.question}</span><span className="text-xl text-[var(--turquoise)] transition group-open:rotate-45">+</span></summary>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </details>)}
              </div>
            </section>}
          </div>

          <aside className="hidden h-fit lg:sticky lg:top-28 lg:block">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isSafari ? "Fixed adult price" : "Starting from"}</p>
              <p className="mt-1 font-display text-4xl font-bold text-[var(--ocean)]">{priceLabel}</p>
              {tour.price > 0 && <p className="mt-1 text-xs text-muted-foreground">per adult · child price calculated at booking</p>}
              <div className="my-6 h-px bg-border" />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-[var(--turquoise)]" /><span>{tour.duration}</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[var(--turquoise)]" /><span>{tour.location}</span></div>
                {tour.difficulty && <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-[var(--turquoise)]" /><span>{tour.difficulty} level</span></div>}
              </div>
              <div className="my-6 h-px bg-border" />
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-xs font-bold text-slate-600">Travel date<input type="date" min={new Date().toISOString().split("T")[0]} value={bookingDate} onChange={event=>setBookingDate(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[var(--turquoise)]" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5 text-xs font-bold text-slate-600">Adults<input type="number" min="1" max="30" value={adults} onChange={event=>setAdults(Math.max(1,Number(event.target.value)))} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[var(--turquoise)]" /></label>
                  <label className="grid gap-1.5 text-xs font-bold text-slate-600">Children<input type="number" min="0" max="20" value={children} onChange={event=>setChildren(Math.max(0,Number(event.target.value)))} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[var(--turquoise)]" /></label>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-5"><span className="text-sm text-muted-foreground">Estimated total</span><strong className="font-display text-2xl text-[var(--ocean)]">{estimatedTotal!==null?new Intl.NumberFormat("en-US",{style:"currency",currency:tour.currency,maximumFractionDigits:0}).format(estimatedTotal):"Confirm price"}</strong></div>
              {isSafari
                ? <a href={`/safaris/${tour.slug}/request?${bookingQuery}`} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[var(--ocean)] px-5 py-3.5 font-bold text-white transition hover:brightness-110">Book Now</a>
                : <a href={`/book/${tour.slug}?${bookingQuery}`} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[var(--ocean)] px-5 py-3.5 font-bold text-white transition hover:brightness-110">Book Now</a>}
              <a href={getWhatsAppLink(bookingMessage, site)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366] px-5 py-3 font-bold text-[#168a43] transition hover:bg-emerald-50"><MessageCircle className="h-5 w-5" /> Ask on WhatsApp</a>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-[var(--turquoise)]" /> No payment now · {isSafari ? "automatic voucher · pay on arrival" : "final price confirmed first"}</p>
            </div>
          </aside>
        </section>

        {relatedTours.length > 0 && <section className="bg-[var(--sand)]/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Keep exploring" title={isSafari ? "More safari ideas" : "You may also like"} />
            <div className="grid gap-6 md:grid-cols-3">{relatedTours.map((item) => <TourCard key={item.slug} tour={item} />)}</div>
          </div>
        </section>}
      </main>
      <Footer />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-8px_30px_rgba(16,24,45,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2.5">
          <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{tour.price > 0 ? "Starting from" : "Pricing"}</p><p className="truncate font-display text-lg font-bold text-[var(--ocean)]">{priceLabel}</p></div>
          <a href={getWhatsAppLink(bookingMessage, site)} target="_blank" rel="noopener noreferrer" aria-label="Ask about this tour on WhatsApp" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle className="h-5 w-5" /></a>
          {isSafari
            ? <a href={`/safaris/${tour.slug}/request?${bookingQuery}`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] px-4 text-center text-xs font-bold leading-4 text-foreground">Book now</a>
            : <a href={`/book/${tour.slug}?${bookingQuery}`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] px-4 text-center text-xs font-bold leading-4 text-foreground">{tour.price > 0 ? "Request to book" : "Request quote"}</a>}
        </div>
      </div>
      <div className="hidden lg:block"><WhatsAppFloatingButton /></div>

      {activeImage !== null && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#070d1c]/95 p-4" role="dialog" aria-modal="true" aria-label="Tour image gallery">
        <button type="button" onClick={() => setActiveImage(null)} aria-label="Close gallery" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-6 w-6" /></button>
        {gallery.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} aria-label="Previous image" className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"><ChevronLeft className="h-7 w-7" /></button>}
        <img src={gallery[activeImage].path} alt={gallery[activeImage].alt} className="max-h-[82vh] max-w-[88vw] rounded-xl object-contain" />
        {gallery.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label="Next image" className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"><ChevronRight className="h-7 w-7" /></button>}
        <p className="absolute bottom-5 text-sm font-medium text-white/75">{activeImage + 1} / {gallery.length}</p>
      </div>}
    </div>
  );
}


