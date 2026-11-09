import { Link, router } from "@inertiajs/react";
import {
    Archive,
    Eye,
    MessageSquareText,
    RotateCcw,
    Trash2,
} from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import {
    AdminEmptyState,
    AdminPageHeader,
    AdminPagination,
    AdminTableShell,
    adminTableCellClass,
    adminTableClass,
    adminTableHeadClass,
    adminTableHeaderCellClass,
    adminTableRowClass,
} from "@/Components/AdminUi";

type Inquiry = {
    preferredContact: string;
    topic: string;
    reference: string;
    name: string;
    email: string | null;
    phone: string | null;
    source: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
};
type Props = {
    inquiries: {
        data: Inquiry[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { source: string | null; archived: boolean };
    canPermanentlyDelete: boolean;
};

export default function Inquiries({
    inquiries,
    filters,
    canPermanentlyDelete,
}: Props) {
    const query = (source: string | null, archived = filters.archived) =>
        router.get(
            "/admin/inquiries",
            {
                ...(source ? { source } : {}),
                ...(archived ? { archived: 1 } : {}),
            },
            { preserveState: true },
        );
    return (
        <AdminLayout title="Messages">
            <AdminPageHeader
                eyebrow="Customer activity"
                title="Customer messages"
                description="Manage safari planning requests and general enquiries from first contact to confirmation."
            />
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {[
                        [null, "All"],
                        ["safari", "Safari requests"],
                        ["contact", "Contact messages"],
                    ].map(([value, label]) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => query(value)}
                            className={`rounded-full px-4 py-2 text-xs font-bold ${filters.source === value ? "bg-[var(--ocean)] text-white" : "border border-slate-200 bg-white text-slate-600"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => query(filters.source, !filters.archived)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600"
                >
                    {filters.archived ? (
                        <MessageSquareText className="h-4 w-4" />
                    ) : (
                        <Archive className="h-4 w-4" />
                    )}
                    {filters.archived ? "Active messages" : "Archived"}
                </button>
            </div>
            <AdminTableShell>
                {inquiries.data.length ? (
                    <table className={adminTableClass}>
                        <thead className={adminTableHeadClass}>
                            <tr>
                                <th className={adminTableHeaderCellClass}>
                                    Request
                                </th>
                                <th className={adminTableHeaderCellClass}>
                                    Traveller
                                </th>
                                <th className={adminTableHeaderCellClass}>
                                    Received
                                </th>
                                <th className={adminTableHeaderCellClass}>
                                    Status
                                </th>
                                <th className={adminTableHeaderCellClass}>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.data.map((item) => (
                                <tr
                                    key={item.reference}
                                    className={adminTableRowClass}
                                >
                                    <td
                                        className={`${adminTableCellClass} max-w-md`}
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-bold text-slate-900">
                                                {item.subject}
                                            </p>
                                            <span
                                                className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${item.source === "safari" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}
                                            >
                                                {item.source}
                                            </span>
                                        </div>
                                        <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-5 text-slate-500">
                                            {item.message}
                                        </p>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--turquoise)]">
                                            {item.reference}
                                        </p>
                                    </td>
                                    <td className={adminTableCellClass}>
                                        <p className="font-semibold text-slate-800">
                                            {item.name}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.email || "No email"}
                                        </p>
                                        {item.phone && (
                                            <p className="mt-1 text-xs text-slate-500">
                                                {item.phone}
                                            </p>
                                        )}
                                    </td>
                                    <td
                                        className={`${adminTableCellClass} whitespace-nowrap text-slate-600`}
                                    >
                                        {item.createdAt}
                                    </td>
                                    <td className={adminTableCellClass}>
                                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-700">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td
                                        className={`${adminTableCellClass} text-right`}
                                    >
                                        <div className="flex justify-end gap-2">
                                            {!filters.archived && (
                                                <Link
                                                    href={`/admin/inquiries/${item.reference}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--ocean)] px-3 py-2 text-xs font-bold text-white"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Link>
                                            )}
                                            {filters.archived ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.patch(
                                                                `/admin/inquiries/${item.reference}/restore`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        Restore
                                                    </button>
                                                    {canPermanentlyDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                window.confirm(
                                                                    "Permanently delete this message? This cannot be undone.",
                                                                ) &&
                                                                router.delete(
                                                                    `/admin/inquiries/${item.reference}/force`,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        window.confirm(
                                                            "Archive this message?",
                                                        ) &&
                                                        router.delete(
                                                            `/admin/inquiries/${item.reference}`,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                                                >
                                                    <Archive className="h-3.5 w-3.5" />
                                                    Archive
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <AdminEmptyState
                        icon={MessageSquareText}
                        title={
                            filters.archived
                                ? "No archived messages"
                                : "No messages yet"
                        }
                        description={
                            filters.archived
                                ? "Archived messages will appear here."
                                : "New customer messages will appear here."
                        }
                    />
                )}
            </AdminTableShell>
            <AdminPagination links={inquiries.links} />
        </AdminLayout>
    );
}
