import { FormEvent } from "react";
import { Link, router, useForm } from "@inertiajs/react";
import { Archive, ArrowLeft, CalendarDays, Download, Mail, MessageCircle, Star, Users } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminStatusBadge } from "@/Components/AdminStatusBadge";

type Props = {
  booking: {
    reference: string;
    fullName: string;
    email: string | null;
    whatsapp: string;
    travelDate: string;
    adults: number;
    children: number;
    childrenAges: number[];
    bookingType: string;
    pickupZone: string | null;
    preferredContact: string;
    estimatedPrice: number | null;
    estimatedCurrency: string | null;
    hotel: string | null;
    specialRequests: string | null;
    adminNotes: string | null;
    status: string;
    quotedPrice: number | null;
    quotedCurrency: string | null;
    source: string;
    createdAt: string;
    contactedAt: string | null;
    confirmedAt: string | null;
    cancelledAt: string | null;
    feedbackUrl: string | null;
    voucherUrl: string | null;
    tour: {
      title: string;
      slug: string;
      image: string | null;
    };
  };
  statuses: string[];
};

export default function AdminBookingShow({ booking, statuses }: Props) {
  const { data, setData, patch, processing, errors, isDirty, recentlySuccessful } = useForm({
    status: booking.status,
    admin_notes: booking.adminNotes ?? "",
    quoted_price: booking.quotedPrice?.toString() ?? "",
    quoted_currency: booking.quotedCurrency ?? "USD",
  });
  const whatsappNumber = booking.whatsapp.replace(/[^\d]/g, "");
  const formatMoney = (value:number|null,currency:string|null) => value !== null && currency
    ? new Intl.NumberFormat("en-US", { style:"currency", currency, maximumFractionDigits:0 }).format(value)
    : null;
  const estimatedPrice = formatMoney(booking.estimatedPrice, booking.estimatedCurrency);
  const finalQuote = formatMoney(booking.quotedPrice, booking.quotedCurrency);
  const whatsappMessage = encodeURIComponent([
    `Hello ${booking.fullName}, this is Zola Tours regarding booking ${booking.reference}.`,
    `Tour: ${booking.tour.title}`,
    `Date: ${booking.travelDate}`,
    `Guests: ${booking.adults} adult(s), ${booking.children} child(ren)`,
    `Pickup: ${booking.hotel || booking.pickupZone?.replaceAll("_", " ") || "to be confirmed"}`,
    finalQuote ? `Final quote: ${finalQuote}` : estimatedPrice ? `Estimated total: ${estimatedPrice}` : "Price: to be confirmed",
    booking.voucherUrl ? `Payment voucher: ${booking.voucherUrl}` : "",
  ].filter(Boolean).join("\n"));
  const feedbackMessage = booking.feedbackUrl ? encodeURIComponent(`Hello ${booking.fullName}, thank you for travelling with Zola Tours on ${booking.tour.title}. We would love to hear about your experience. Please share your feedback here: ${booking.feedbackUrl}`) : "";
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (data.status !== booking.status && ["confirmed", "cancelled"].includes(data.status)) {
      const action = data.status === "confirmed" ? "confirm" : "cancel";
      if (!confirm(`Are you sure you want to ${action} this booking?`)) return;
    }
    patch(`/admin/bookings/${booking.reference}`, { preserveScroll: true });
  }

  return (
    <AdminLayout title={booking.reference}>
      <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ocean)]"><ArrowLeft className="h-4 w-4" /> All bookings</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--turquoise)]">{booking.reference}</p><AdminStatusBadge status={booking.status} /></div>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{booking.fullName}</h1>
          <p className="mt-1 text-sm text-slate-500">Received {booking.createdAt} via {booking.source}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {booking.voucherUrl && (
            <a href={booking.voucherUrl} className="inline-flex items-center gap-2 rounded-full bg-[var(--ocean)] px-5 py-2.5 text-sm font-bold text-white">
              <Download className="h-4 w-4" /> Voucher
            </a>
          )}
          <button onClick={() => confirm("Archive this booking? You can restore it later.") && router.delete(`/admin/bookings/${booking.reference}`)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600">
            <Archive className="h-4 w-4" /> Archive
          </button>
          {booking.feedbackUrl && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${feedbackMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white"
            >
              <Star className="h-4 w-4" /> Request feedback
            </a>
          )}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp guest
          </a>
          {booking.email && (
            <a href={`mailto:${booking.email}?subject=${encodeURIComponent(`Booking ${booking.reference}`)}`} className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-bold">
              <Mail className="h-4 w-4" /> Email
            </a>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="grid gap-6">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[var(--shadow-card)]">
            <div className="grid sm:grid-cols-[11rem_minmax(0,1fr)]">
              {booking.tour.image
                ? <img src={booking.tour.image} alt={booking.tour.title} className="h-40 w-full object-cover sm:h-full" />
                : <div className="hidden bg-slate-100 sm:block" />}
              <div className="p-5 md:p-7">
            <h2 className="font-display text-xl font-bold text-[var(--ocean)]">Trip details</h2>
            <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
              <Detail label="Tour"><Link href={`/tours/${booking.tour.slug}`} className="font-semibold text-[var(--ocean)]">{booking.tour.title}</Link></Detail>
              <Detail label="Travel date"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-slate-400" />{booking.travelDate}</span></Detail>
              <Detail label="Booking option"><span>{booking.bookingType === "shared" ? "Join a group" : "Only my group"}</span></Detail>
              <Detail label="Guests"><span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-slate-400" />{booking.adults} adults, {booking.children} children{booking.childrenAges.length ? ` (ages ${booking.childrenAges.join(", ")})` : ""}</span></Detail>
              <Detail label="Estimated total">{estimatedPrice || "Not calculated"}</Detail>
              <Detail label="Final quote">{finalQuote || "Not set yet"}</Detail>
              <Detail label="Pickup area"><span className="capitalize">{booking.pickupZone?.replaceAll("_", " ") || "Not provided"}</span></Detail>
              <Detail label="Hotel / pickup">{booking.hotel || "Not provided"}</Detail>
              <Detail label="Preferred contact"><span className="capitalize">{booking.preferredContact}</span></Detail>
              <Detail label="WhatsApp">{booking.whatsapp}</Detail>
              <Detail label="Email">{booking.email || "Not provided"}</Detail>
            </dl>
            {booking.specialRequests && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Special requests</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{booking.specialRequests}</p>
              </div>
            )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
            <h2 className="font-display text-xl font-bold text-[var(--ocean)]">Booking timeline</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <Timeline label="Request received" value={booking.createdAt} />
              <Timeline label="Guest contacted" value={booking.contactedAt} />
              <Timeline label="Booking confirmed" value={booking.confirmedAt} />
              <Timeline label="Booking cancelled" value={booking.cancelledAt} />
            </div>
          </section>
        </div>

        <aside>
          <form onSubmit={save} className="sticky top-24 relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-[var(--turquoise)] before:to-[var(--accent)]">
            <h2 className="font-display text-xl font-bold text-[var(--ocean)]">Manage booking</h2>
            <label className="mt-5 grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</span>
              <select value={data.status} onChange={(event) => setData("status", event.target.value)} className="rounded-xl border px-4 py-3 text-sm font-semibold capitalize">
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              {errors.status && <span className="text-xs text-red-600">{errors.status}</span>}
              <span className="text-xs leading-5 text-slate-400">Use Contacted after speaking with the guest, then Confirmed once all details are agreed.</span>
            </label>
            <div className="mt-5 grid grid-cols-[1fr_6rem] gap-2">
              <label className="grid gap-1.5"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Final quote</span><input type="number" min="1" step="0.01" value={data.quoted_price} onChange={(event) => setData("quoted_price", event.target.value)} placeholder="e.g. 150" className="rounded-xl border px-4 py-3 text-sm" /></label>
              <label className="grid gap-1.5"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Currency</span><select value={data.quoted_currency} onChange={(event) => setData("quoted_currency", event.target.value)} className="rounded-xl border px-2 py-3 text-sm">{["USD","TZS","EUR","GBP"].map((currency) => <option key={currency}>{currency}</option>)}</select></label>
            </div>
            {(errors.quoted_price || errors.quoted_currency) && <span className="mt-1 block text-xs text-red-600">{errors.quoted_price || errors.quoted_currency}</span>}
            <label className="mt-5 grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Internal notes</span>
              <textarea
                rows={7}
                value={data.admin_notes}
                onChange={(event) => setData("admin_notes", event.target.value)}
                placeholder="Private notes for the team"
                className="rounded-xl border px-4 py-3 text-sm outline-none focus:border-[var(--turquoise)]"
              />
              {errors.admin_notes && <span className="text-xs text-red-600">{errors.admin_notes}</span>}
            </label>
            {recentlySuccessful && <p className="mt-4 text-center text-xs font-bold text-emerald-700">Booking saved successfully.</p>}
            <button disabled={processing || !isDirty} className="mt-5 w-full rounded-xl bg-[var(--ocean)] px-5 py-3 font-bold text-white transition hover:bg-[#0a516c] disabled:cursor-not-allowed disabled:opacity-50">
              {processing ? "Saving…" : isDirty ? "Save changes" : "No changes to save"}
            </button>
          </form>
        </aside>
      </div>
    </AdminLayout>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-slate-800">{children}</dd></div>;
}

function Timeline({ label, value }: { label: string; value: string | null }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><span className="text-slate-600">{label}</span><strong className={value ? "text-slate-900" : "text-slate-300"}>{value || "—"}</strong></div>;
}
