import { useState, type ReactNode } from "react";
import { Clock3, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { Link } from "./AppLink";
import { useSiteConfig } from "@/config/site";

const links = [
    { label: "Home", to: "/" },
    { label: "Zanzibar Tours", to: "/tours" },
    { label: "Tanzania Safaris", to: "/safaris" },
    { label: "Transfers", to: "/transfers" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
];

export function Navbar() {
    const [open, setOpen] = useState(false);
    const site = useSiteConfig();
    const social = [
        { label: "Instagram", url: site.social.instagram, icon: <InstagramIcon />, color: "text-[#D62976] hover:border-[#D62976]/35 hover:bg-[#D62976]/5" },
        { label: "Facebook", url: site.social.facebook, icon: <FacebookIcon />, color: "text-[#1877F2] hover:border-[#1877F2]/35 hover:bg-[#1877F2]/5" },
        { label: "TikTok", url: site.social.tiktok, icon: <TikTokIcon />, color: "text-slate-900 hover:border-slate-400 hover:bg-slate-50" },
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
            <div className="bg-[var(--ocean)] text-white">
                <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] font-semibold sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                        <span className="hidden items-center gap-1.5 sm:inline-flex"><MapPin className="h-3.5 w-3.5 text-[var(--turquoise)]" />{site.location}</span>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Clock3 className="h-3.5 w-3.5 text-[var(--turquoise)]" />{site.workingHours}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 sm:gap-6">
                        <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 transition hover:text-[var(--turquoise)] lg:inline-flex"><Mail className="h-3.5 w-3.5 text-[var(--turquoise)]" />{site.email}</a>
                        <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 whitespace-nowrap transition hover:text-[var(--turquoise)]"><Phone className="h-3.5 w-3.5 text-[var(--turquoise)]" /><span className="hidden sm:inline">{site.phone}</span><span className="sm:hidden">Call us</span></a>
                    </div>
                </div>
            </div>
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center">
                    <img src={site.logoPath} alt={site.name} className="h-16 w-auto object-contain" />
                </Link>
                <nav className="hidden items-center gap-8 md:flex">
                    {links.map((link) => <Link key={link.to} to={link.to} className="text-sm font-bold text-slate-700 transition hover:text-[var(--ocean)]">{link.label}</Link>)}
                </nav>
                <div className="hidden items-center gap-2 md:flex" aria-label="Social media">
                    {social.map((item) => <SocialIcon key={item.label} {...item} />)}
                </div>
                <button type="button" aria-label="Open menu" onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-800 md:hidden">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
            </div>
            {open && (
                <div className="border-t border-slate-100 bg-white px-4 py-5 md:hidden">
                    <nav className="mx-auto grid max-w-7xl gap-1">
                        {links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50">{link.label}</Link>)}
                    </nav>
                    <div className="mx-auto mt-4 flex max-w-7xl items-center gap-2 border-t border-slate-100 px-2 pt-4" aria-label="Social media">
                        {social.map((item) => <SocialIcon key={item.label} {...item} />)}
                    </div>
                </div>
            )}
        </header>
    );
}

function SocialIcon({ label, url, icon, color }: { label: string; url: string; icon: ReactNode; color: string }) {
    const active = Boolean(url && url !== "#");
    return (
        <a
            href={active ? url : undefined}
            target={active ? "_blank" : undefined}
            rel={active ? "noopener noreferrer" : undefined}
            aria-label={active ? `Visit Zola Tours on ${label}` : `${label} link coming soon`}
            aria-disabled={!active}
            className={`grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white shadow-sm transition duration-200 ${color} ${active ? "hover:-translate-y-0.5 hover:shadow-md" : "cursor-default opacity-70"}`}
        >
            {icon}
        </a>
    );
}

function InstagramIcon() {
    return <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}

function FacebookIcon() {
    return <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true"><path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.4Z" /></svg>;
}

function TikTokIcon() {
    return <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true"><path d="M15.7 3c.3 1.8 1.3 2.9 3.3 3.1v3a7.4 7.4 0 0 1-3.3-.8v6.1a6.4 6.4 0 1 1-5.5-6.3v3.1a3.3 3.3 0 1 0 2.4 3.2V3h3.1Z" /></svg>;
}
