import { FormEvent } from "react";
import { Link, router, useForm } from "@inertiajs/react";
import { Archive, ArrowLeft, Mail, MessageCircle, Save } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminStatusBadge } from "@/Components/AdminStatusBadge";

type Inquiry = {
    reference: string;
    name: string;
    email: string | null;
    phone: string | null;
    preferredContact: string;
    source: string;
    topic: string;
    subject: string;
    message: string;
    details: Record<string, string>;
    status: string;
    adminNotes: string | null;
    createdAt: string;
    readAt: string | null;
};
export default function InquiryShow({
    inquiry,
    statuses,
}: {
    inquiry: Inquiry;
    statuses: string[];
}) {
    const form = useForm({
        status: inquiry.status,
        admin_notes: inquiry.adminNotes ?? "",
    });
    const phone = inquiry.phone?.replace(/[^\d]/g, "") ?? "";
    const message = encodeURIComponent(
        `Hello ${inquiry.name}, this is Zola Tours regarding your ${inquiry.source === "safari" ? "safari planning request" : "message"} ${inquiry.reference}.`,
    );
    function save(e: FormEvent) {
        e.preventDefault();
        form.patch(`/admin/inquiries/${inquiry.reference}`, {
            preserveScroll: true,
        });
    }
    return (
        <AdminLayout title={inquiry.reference}>
            <Link
                href="/admin/inquiries"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--ocean)]"
            >
                <ArrowLeft className="h-4 w-4" />
                All messages
            </Link>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${inquiry.source === "safari" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}
                        >
                            {inquiry.source} request
                        </span>
                        <AdminStatusBadge status={inquiry.status} />
                    </div>
                    <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
                        {inquiry.subject}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {inquiry.reference} · Received {inquiry.createdAt}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {inquiry.phone && (
                        <a
                            href={`https://wa.me/${phone}?text=${message}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp guest
                        </a>
                    )}
                    {inquiry.email && (
                        <a
                            href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: ${inquiry.subject} (${inquiry.reference})`)}`}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold"
                        >
                            <Mail className="h-4 w-4" />
                            Email guest
                        </a>
                    )}
                </div>
            </div>
            <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <div className="grid gap-6">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                        <h2 className="font-display text-xl font-bold">
                            Traveller details
                        </h2>
                        <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                            <Detail label="Full name">{inquiry.name}</Detail>
                            <Detail label="Preferred contact">
                                <span className="capitalize">
                                    {inquiry.preferredContact}
                                </span>
                            </Detail>
                            <Detail label="WhatsApp / phone">
                                {inquiry.phone || "Not provided"}
                            </Detail>
                            <Detail label="Email">
                                {inquiry.email || "Not provided"}
                            </Detail>
                            <Detail label="Topic">
                                <span className="capitalize">
                                    {inquiry.topic}
                                </span>
                            </Detail>
                            <Detail label="Request type">
                                <span className="capitalize">
                                    {inquiry.source}
                                </span>
                            </Detail>
                        </dl>
                    </section>
                    {Object.keys(inquiry.details).length > 0 && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                            <h2 className="font-display text-xl font-bold">
                                Safari plan
                            </h2>
                            <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                                {Object.entries(inquiry.details).map(
                                    ([label, value]) => (
                                        <Detail key={label} label={label}>
                                            {value}
                                        </Detail>
                                    ),
                                )}
                            </dl>
                        </section>
                    )}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                        <h2 className="font-display text-xl font-bold">
                            Original message
                        </h2>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {inquiry.message}
                        </p>
                    </section>
                </div>
                <aside>
                    <form
                        onSubmit={save}
                        className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <h2 className="font-display text-xl font-bold">
                            Manage request
                        </h2>
                        <label className="mt-5 grid gap-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Status
                            </span>
                            <select
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData("status", e.target.value)
                                }
                                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold capitalize"
                            >
                                {statuses.map((status) => (
                                    <option key={status}>{status}</option>
                                ))}
                            </select>
                            {form.errors.status && (
                                <span className="text-xs text-red-600">
                                    {form.errors.status}
                                </span>
                            )}
                        </label>
                        <label className="mt-5 grid gap-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Internal notes
                            </span>
                            <textarea
                                rows={8}
                                value={form.data.admin_notes}
                                onChange={(e) =>
                                    form.setData("admin_notes", e.target.value)
                                }
                                placeholder="Quote details, follow-up dates or private team notes"
                                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--turquoise)]"
                            />
                            {form.errors.admin_notes && (
                                <span className="text-xs text-red-600">
                                    {form.errors.admin_notes}
                                </span>
                            )}
                        </label>
                        <button
                            disabled={form.processing}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ocean)] px-5 py-3 font-bold text-white disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {form.processing ? "Saving…" : "Save changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                window.confirm("Archive this request?") &&
                                router.delete(
                                    `/admin/inquiries/${inquiry.reference}`,
                                )
                            }
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"
                        >
                            <Archive className="h-4 w-4" />
                            Archive request
                        </button>
                    </form>
                </aside>
            </div>
        </AdminLayout>
    );
}
function Detail({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {label}
            </dt>
            <dd className="mt-1 font-medium text-slate-800">{children}</dd>
        </div>
    );
}
