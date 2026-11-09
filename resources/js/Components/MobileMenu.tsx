import { useEffect, useState } from "react";
import { ChevronDown, Compass, MessageCircle, Phone, X } from "lucide-react";
import { Link } from "./AppLink";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";
import type { NavigationCategory } from "./Navbar";

interface NavItem { label: string; to: string }
interface Props {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  categories: NavigationCategory[];
  currentPath: string;
}

export function MobileMenu({ open, onClose, items, categories, currentPath }: Props) {
  const site = useSiteConfig();
  const [toursOpen, setToursOpen] = useState(currentPath.startsWith("/tours"));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button type="button" aria-label="Close menu" onClick={onClose} className={`absolute inset-0 bg-[#10182d]/55 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute inset-y-0 right-0 flex w-[min(92vw,24rem)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-[4.75rem] items-center justify-between border-b border-slate-100 px-5">
          <Link to="/" onClick={onClose} className="flex min-w-0 items-center gap-3">
            <img src={site.logoPath} alt={site.name} className="h-14 w-auto shrink-0 object-contain" />
            <span className="min-w-0"><strong className="block truncate text-sm text-[var(--ocean)]">{site.name}</strong><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Explore Zanzibar</span></span>
          </Link>
          <button type="button" aria-label="Close menu" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><X className="h-5 w-5" /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Navigation</p>
          <nav className="mt-2 grid gap-1">
            <MobileLink label="Home" to="/" active={currentPath === "/"} onClick={onClose} />
            <button type="button" onClick={() => setToursOpen((value) => !value)} className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-bold ${currentPath.startsWith("/tours") ? "bg-[var(--ocean)] text-white" : "text-slate-700 hover:bg-slate-50"}`}>
              <span className="flex items-center gap-3"><Compass className="h-5 w-5" /> Tours</span><ChevronDown className={`h-4 w-4 transition-transform ${toursOpen ? "rotate-180" : ""}`} />
            </button>
            {toursOpen && (
              <div className="ml-5 grid gap-1 border-l-2 border-[var(--gold)]/40 py-2 pl-4">
                <Link to="/tours" onClick={onClose} className="rounded-lg px-3 py-2.5 text-sm font-bold text-[var(--ocean)]">All tours</Link>
                {categories.map((category) => <Link key={category.slug} to={`/tours?category=${category.slug}`} onClick={onClose} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><span>{category.name}</span><span className="text-xs text-slate-400">{category.count}</span></Link>)}
              </div>
            )}
            {items.slice(1).map((item) => <MobileLink key={item.label} {...item} active={!item.to.includes("#") && currentPath.startsWith(item.to)} onClick={onClose} />)}
          </nav>

          <div className="mt-6 rounded-2xl bg-[var(--sand)]/60 p-4">
            <p className="font-display text-lg font-bold text-[var(--ocean)]">Need help choosing?</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Talk directly with our local team for a quick recommendation.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={getWhatsAppLink(undefined, site)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-xs font-bold text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-[var(--ocean)]"><Phone className="h-4 w-4" /> Call us</a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white p-4">
          <a href={getWhatsAppLink("Hello Zola Tours, I would like help planning my trip.", site)} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3.5 text-sm font-bold text-foreground shadow-sm"><MessageCircle className="h-4 w-4" /> Plan Your Trip</a>
        </div>
      </aside>
    </div>
  );
}

function MobileLink({ label, to, active, onClick }: NavItem & { active: boolean; onClick: () => void }) {
  return <Link to={to} onClick={onClick} className={`rounded-xl px-4 py-3.5 text-base font-bold transition ${active ? "bg-[var(--ocean)] text-white" : "text-slate-700 hover:bg-slate-50"}`}>{label}</Link>;
}
