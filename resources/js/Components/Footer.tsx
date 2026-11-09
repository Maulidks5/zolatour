import { LockKeyhole, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "./AppLink";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";

export function Footer() {
    const site = useSiteConfig();
    return <footer className="bg-[#071d2b] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
            <div><img src={site.logoPath} alt={site.name} className="h-24 rounded-xl bg-white p-2 object-contain" /><p className="mt-4 max-w-md text-sm leading-7 text-white/65">Zanzibar tours and Tanzania safaris planned with clear, personal support.</p><div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold text-white/75"><Link to="/tours">Tours</Link><Link to="/safaris">Safaris</Link><Link to="/transfers">Transfers</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div></div>
            <div className="md:justify-self-end"><h3 className="text-lg font-bold">Talk to us</h3><div className="mt-4 grid gap-3 text-sm text-white/70"><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 transition hover:text-white"><Phone className="h-4 w-4 text-[var(--turquoise)]" />{site.phone}</a><a href={`mailto:${site.email}`} className="flex items-center gap-3 transition hover:text-white"><Mail className="h-4 w-4 text-[var(--turquoise)]" />{site.email}</a><span className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[var(--turquoise)]" />Zanzibar, Tanzania</span><a href={getWhatsAppLink(undefined, site)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-white"><MessageCircle className="h-4 w-4" /> WhatsApp us</a></div></div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-xs text-white/45">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 sm:justify-between">
                <span>© {new Date().getFullYear()} Zola Tours & Safaris. All rights reserved.</span>
                <Link to="/admin/login" target="_blank" rel="noopener noreferrer" aria-label="Open admin login in a new tab" title="Admin login" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-[var(--turquoise)] hover:text-[var(--turquoise)] focus:outline-none focus:ring-2 focus:ring-[var(--turquoise)]">
                    <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
            </div>
        </div>
    </footer>;
}
