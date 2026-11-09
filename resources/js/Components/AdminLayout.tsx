import { ReactNode, useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Binoculars, BookOpen, CalendarCheck, CarFront, ChevronDown, ChevronRight, ExternalLink, FileText, FolderKanban, GalleryHorizontalEnd, Handshake, HelpCircle, Home, Images, LayoutDashboard, LogOut, MailQuestion, Menu, MessageSquareQuote, Settings2, UserRound, UsersRound, X } from "lucide-react";

type SharedProps = {
  auth: { user: { name: string; email: string; isAdmin: boolean; role: string; canManageUsers: boolean } | null };
  flash: { success: string | null };
  adminCounts: { newTransportRequests: number; newMessages: number };
};

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const page = usePage<SharedProps>();
  const { auth, flash, adminCounts } = page.props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["Overview", "Bookings & requests"]);
  const currentPath = page.url.split("?")[0];
  const navigation = [
    {
      label: "Overview",
      links: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
      label: "Tours & content",
      links: [
        { label: "Tours", href: "/admin/tours?type=tour", icon: BookOpen },
        { label: "Safaris", href: "/admin/tours?type=safari", icon: Binoculars },
        { label: "Tour categories", href: "/admin/cms/categories", icon: FolderKanban },
        { label: "Travel guides", href: "/admin/guides", icon: BookOpen },
      ],
    },
    {
      label: "Website appearance",
      links: [
        { label: "Homepage text", href: "/admin/cms/settings?section=homepage", icon: Home },
        { label: "Homepage hero", href: "/admin/cms/hero-slides", icon: GalleryHorizontalEnd },
        { label: "Homepage sections", href: "/admin/cms/home", icon: FileText },
        { label: "Page content", href: "/admin/cms/settings?section=pages", icon: FileText },
        { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
        { label: "Website media", href: "/admin/cms/media", icon: Images },
        { label: "Partners", href: "/admin/cms/partners", icon: Handshake },
      ],
    },
    {
      label: "Bookings & requests",
      links: [
        { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
        { label: "Transport requests", href: "/admin/transport-requests", icon: CarFront, count: adminCounts.newTransportRequests },
        { label: "Transport prices", href: "/admin/transport-routes", icon: CarFront },
        { label: "Messages", href: "/admin/inquiries", icon: MailQuestion, count: adminCounts.newMessages },
        { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
      ],
    },
    {
      label: "System",
      links: [
        { label: "Site settings", href: "/admin/cms/settings?section=general", icon: Settings2 },
        ...(auth.user?.canManageUsers ? [{ label: "Admin users", href: "/admin/users", icon: UsersRound }] : []),
      ],
    },
  ];

  function isActive(href: string) {
    const [hrefPath, hrefQuery] = href.split("?");
    if (hrefQuery) return currentPath === hrefPath && page.url.split("?")[1] === hrefQuery;
    return currentPath === hrefPath || (hrefPath !== "/admin" && currentPath.startsWith(`${hrefPath}/`));
  }

  function toggleGroup(label: string) {
    setOpenGroups((groups) => groups.includes(label) ? groups.filter((group) => group !== label) : [...groups, label]);
  }

  useEffect(() => {
    const activeGroup = navigation.find((group) => group.links.some((link) => isActive(link.href)))?.label;
    if (activeGroup) setOpenGroups((groups) => groups.includes(activeGroup) ? groups : [...groups, activeGroup]);
  }, [page.url]);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => router.reload({ only: ["adminCounts"], preserveScroll: true, preserveState: true }), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const inactivityTimeout = 30 * 60 * 1000;
    let logoutTimer = window.setTimeout(logout, inactivityTimeout);

    function logout() {
      router.post("/admin/logout", {}, { replace: true });
    }

    function resetTimer() {
      window.clearTimeout(logoutTimer);
      logoutTimer = window.setTimeout(logout, inactivityTimeout);
    }

    const activityEvents: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      window.clearTimeout(logoutTimer);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  const sidebar = (
    <>
      <div className="relative flex h-[5rem] items-center justify-between border-b border-white/10 px-5 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gradient-to-r after:from-[var(--turquoise)] after:via-[var(--turquoise)] after:to-[var(--accent)]">
        <Link href="/admin" className="flex min-w-0 items-center gap-3">
          <img src="/brand/zola-tours-logo.jpeg" alt="Zola Tours & Safaris" className="h-12 w-[5.5rem] shrink-0 rounded-xl bg-white object-contain p-1.5 shadow-lg shadow-black/15 ring-1 ring-white/25" />
          <span className="min-w-0">
            <strong className="block truncate text-sm text-white">Zola Tours & Safaris</strong>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Admin workspace</span>
          </span>
        </Link>
        <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close admin menu" className="grid h-10 w-10 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5">
        <nav className="grid gap-2">
          {navigation.map((group) => {
            const open = openGroups.includes(group.label);
            const groupCount = group.links.reduce((total, link) => total + (link.count || 0), 0);
            const containsActive = group.links.some((link) => isActive(link.href));
            return (
              <div key={group.label} className="overflow-hidden rounded-xl">
                <button type="button" onClick={() => toggleGroup(group.label)} aria-expanded={open} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.16em] transition ${containsActive ? "bg-[var(--turquoise)]/10 text-[var(--turquoise)]" : "text-white/45 hover:bg-white/5 hover:text-white/80"}`}>
                  <span className="min-w-0 flex-1 truncate">{group.label}</span>
                  {!!groupCount && <span className="grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] leading-4 text-white">{groupCount > 99 ? "99+" : groupCount}</span>}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-200 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="min-h-0 overflow-hidden"><div className="mt-1 grid gap-1 pb-2">
                    {group.links.map(({ label, href, icon: Icon, count }) => {
                      const active = isActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`group inline-flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                            active
                              ? "bg-[var(--turquoise)] text-[var(--ocean)] shadow-lg shadow-cyan-950/20"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
                          <span>{label}</span>
                          {!!count && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold leading-4 text-white shadow-sm">{count > 99 ? "99+" : count}</span>}
                          {!count && <ChevronRight className={`ml-auto h-4 w-4 ${active ? "opacity-50" : "opacity-0 transition group-hover:opacity-50"}`} />}
                        </Link>
                      );
                    })}
                  </div></div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-white/10 pt-5">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-5 w-5" /> View website
          </a>
        </div>

        <div className="mt-auto pt-6">
          {auth.user && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white"><UserRound className="h-4 w-4" /></span>
                <p className="min-w-0 text-xs leading-5 text-white/50">
                  <strong className="block truncate text-white">{auth.user.name}</strong>
                  <span className="block truncate">{auth.user.email}</span>
                </p>
              </div>
              <button type="button" onClick={() => router.post("/admin/logout", {}, { replace: true })} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-white/70 transition hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-200">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--sand)] text-slate-900">
      <Head title={`${title} · Admin`} />
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[17rem] flex-col bg-gradient-to-b from-[#052f42] via-[var(--ocean)] to-[#041f2c] lg:flex">
        {sidebar}
      </aside>

      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
        <button type="button" aria-label="Close admin menu" onClick={() => setMobileOpen(false)} className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute inset-y-0 left-0 flex w-[min(86vw,19rem)] flex-col bg-gradient-to-b from-[#052f42] via-[var(--ocean)] to-[#041f2c] shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {sidebar}
        </aside>
      </div>

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_8px_30px_-24px_rgba(6,59,82,.55)] backdrop-blur">
          <div className="flex h-[4.5rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open admin menu" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{title}</p>
                <p className="hidden text-xs text-slate-400 sm:block">Tours · Safaris · Transfers</p>
              </div>
            </div>
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0a516c]">
              <span className="hidden sm:inline">Open website</span><ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </header>

        <main className="mx-auto min-w-0 max-w-[96rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10">
          {flash.success && (
            <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm">
              {flash.success}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
