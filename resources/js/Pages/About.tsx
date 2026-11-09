import { Head, Link } from "@inertiajs/react";
import { ArrowRight, Award, Car, Check, HeartHandshake, MapPin, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Footer } from "@/Components/Footer";
import { Navbar } from "@/Components/Navbar";
import { WhatsAppFloatingButton } from "@/Components/WhatsAppFloatingButton";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";

type Props = {
  content: {
    eyebrow: string;
    title: string;
    description: string;
    storyTitle: string;
    story: string;
    image: string;
  };
  values: Array<{ title: string; description: string | null; icon: string | null }>;
};

const icons = { users: Users, heart: HeartHandshake, shield: ShieldCheck, sparkles: Sparkles, award: Award, car: Car, message: MessageCircle };

export default function About({ content, values }: Props) {
  const site = useSiteConfig();

  return (
    <div className="min-h-screen bg-background">
      <Head title={`About ${site.name}`}>
        <meta name="description" content={content.description} />
      </Head>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-[var(--ocean)] text-white">
          <img src={content.image} alt="Local Zanzibar tour experience" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#052f53]/95 via-[#052f53]/78 to-[#052f53]/35" />
          <div className="relative mx-auto grid min-h-[32rem] max-w-7xl items-center gap-10 px-4 py-14 sm:min-h-[38rem] sm:px-6 md:py-20 lg:grid-cols-[1fr_25rem] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--gold)]">{content.eyebrow}</p>
              <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">{content.title}</h1>
              <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-white/80 sm:line-clamp-none md:text-lg md:leading-8">{content.description}</p>
            </div>
            <div className="hidden grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur sm:grid">
              {["Local planning", "Personal support", "Flexible experiences", "Clear communication"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/8 p-4 text-sm font-semibold"><Check className="mb-3 h-5 w-5 text-[var(--gold)]" />{item}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
            <img src={content.image} alt="A Zola Tours experience in Zanzibar" className="aspect-[4/3] h-full w-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--turquoise)]/15 text-[var(--ocean)]"><MapPin className="h-5 w-5" /></span>
              <div><p className="text-xs text-muted-foreground">Based in</p><p className="font-bold">{site.location}</p></div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--turquoise)]">Our story</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">{content.storyTitle}</h2>
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-muted-foreground">{content.story}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/tours" className="inline-flex items-center gap-2 rounded-full bg-[var(--ocean)] px-6 py-3 font-bold text-white">Explore tours <ArrowRight className="h-4 w-4" /></Link>
              <a href={getWhatsAppLink("Hello Zola Tours, I would like help planning a Zanzibar tour.", site)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-[var(--ocean)] px-6 py-3 font-bold text-[var(--ocean)]">Talk to our team</a>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--turquoise)]">How we work</p><h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Simple planning, local support</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[["1","Tell us your plans","Share your dates, group and the experiences you are considering."],["2","We recommend and confirm","We help shape the details, check availability and explain the price."],["3","Travel with support","Stay connected with our local team before and during your experience."]].map(([number,title,description])=><article key={number} className="rounded-2xl border border-border p-6"><span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ocean)] font-bold text-white">{number}</span><h3 className="mt-5 font-display text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></article>)}</div></div></section>

        {values.length > 0 && <section className="bg-[var(--sand)]/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--turquoise)]">Why travel with us</p>
              <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Local knowledge, thoughtful service</h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value) => {
                const Icon = icons[value.icon as keyof typeof icons] ?? Sparkles;
                return <article key={value.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--gold)]/25 text-[var(--ocean)]"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-5 font-display text-xl font-bold">{value.title}</h3>
                  {value.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{value.description}</p>}
                </article>;
              })}
            </div>
          </div>
        </section>}
        <section className="bg-[var(--ocean)] text-white"><div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-20"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Plan with a local team</p><h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">Ready to start planning?</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70">Explore our experiences or tell us what kind of trip you have in mind.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/tours" className="rounded-full bg-[var(--gold)] px-6 py-3 font-bold text-white">Explore tours</Link><a href={getWhatsAppLink("Hello Zola Tours, I would like help planning a Zanzibar tour.", site)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 font-bold"><MessageCircle className="h-4 w-4"/> Talk to our team</a></div></div></section>
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
