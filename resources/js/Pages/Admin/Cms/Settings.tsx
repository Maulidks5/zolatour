import { FormEvent, useMemo, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Check, Contact, FileText, Globe2, Home, Save, Share2 } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminPageHeader } from "@/Components/AdminUi";

type Setting = {
  group: string;
  key: string;
  label: string;
  type: string;
  value: string | null;
};

type Props = {
  groups: Record<string, Setting[]>;
};

const groupMeta = {
  general: { label: "General", description: "Brand, footer and default search metadata.", icon: Globe2 },
  contact: { label: "Contact", description: "Phone, WhatsApp, email and business location.", icon: Contact },
  social: { label: "Social media", description: "Links displayed in the website footer.", icon: Share2 },
  homepage: { label: "Homepage", description: "Headings and marketing copy shown on the homepage.", icon: Home },
  pages: { label: "Page content", description: "Headings and introductions for Tours, Safaris, About and Contact pages.", icon: FileText },
};

export default function CmsSettings({ groups }: Props) {
  const groupNames = Object.keys(groups);
  const page = usePage();
  const requestedGroup = new URLSearchParams(page.url.split("?")[1] ?? "").get("section");
  const initialGroup = requestedGroup && groupNames.includes(requestedGroup) ? requestedGroup : (groupNames[0] ?? "general");
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  const initial = useMemo(
    () => Object.values(groups).flat().reduce<Record<string, string>>((values, setting) => {
      values[setting.key] = setting.value ?? "";
      return values;
    }, {}),
    [groups],
  );
  const { data, setData, patch, processing, recentlySuccessful, errors } = useForm({ settings: initial });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    patch("/admin/cms/settings", { preserveScroll: true });
  }

  const currentMeta = groupMeta[activeGroup as keyof typeof groupMeta];

  return (
    <AdminLayout title={currentMeta?.label ?? "Website settings"}>
      <AdminPageHeader eyebrow={activeGroup === "homepage" || activeGroup === "pages" ? "Website content" : "Site settings"} title={currentMeta?.label ?? "Website settings"} description={`${currentMeta?.description ?? "Update website content without touching code."} Changes appear immediately after saving.`} />

      <form onSubmit={submit} className="mt-6 grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav className="grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-24">
          {groupNames.map((group) => {
            const meta = groupMeta[group as keyof typeof groupMeta];
            const Icon = meta?.icon ?? FileText;
            return (
              <Link key={group} href={`/admin/cms/settings?section=${group}`} replace preserveScroll onClick={() => setActiveGroup(group)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${activeGroup === group ? "bg-[var(--ocean)] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                <Icon className="h-4 w-4 shrink-0" /> {meta?.label ?? group}
              </Link>
            );
          })}
        </nav>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <h2 className="font-display text-2xl font-bold">{currentMeta?.label ?? activeGroup}</h2>
            <p className="mt-1 text-sm text-slate-500">{currentMeta?.description}</p>
          </div>
          <div className="grid gap-5 p-5 sm:p-7">
            {(groups[activeGroup] ?? []).map((setting) => (
              <label key={setting.key} className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{setting.label}</span>
                {setting.type === "textarea" ? (
                  <textarea rows={3} value={data.settings[setting.key] ?? ""} onChange={(event) => setData("settings", { ...data.settings, [setting.key]: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-[var(--turquoise)]" />
                ) : (
                  <input type={["email", "url", "tel"].includes(setting.type) ? setting.type : "text"} value={data.settings[setting.key] ?? ""} onChange={(event) => setData("settings", { ...data.settings, [setting.key]: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--turquoise)]" />
                )}
                {errors[`settings.${setting.key}` as keyof typeof errors] && <span className="text-xs text-rose-600">{String(errors[`settings.${setting.key}` as keyof typeof errors])}</span>}
              </label>
            ))}
          </div>
          <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/95 px-5 py-4 backdrop-blur sm:px-7">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition ${recentlySuccessful ? "opacity-100" : "opacity-0"}`}><Check className="h-4 w-4" /> Saved</span>
            <button disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
              <Save className="h-4 w-4" /> {processing ? "Saving…" : "Save changes"}
            </button>
          </div>
        </section>
      </form>
    </AdminLayout>
  );
}
