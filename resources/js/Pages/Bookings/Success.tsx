import { useState } from "react";
import { Head } from "@inertiajs/react";
import { Check, Copy, Download, Eye, MessageCircle, ShieldCheck } from "lucide-react";
import { Footer } from "@/Components/Footer";
import { Navbar } from "@/Components/Navbar";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";

type Props = {
  booking: {
    reference: string;
    tourTitle: string;
    tourSlug: string;
    travelDate: string;
    adults: number;
    children: number;
    childrenAges: number[];
    bookingType: string;
    pickupZone: string | null;
    estimatedPrice: number | null;
    estimatedCurrency: string | null;
    quotedPrice: number | null;
    quotedCurrency: string | null;
    voucherUrl: string;
  };
};

export default function BookingSuccess({ booking }: Props) {
  const site = useSiteConfig();
  const [copied, setCopied] = useState(false);
  const pickupLabel = ({ stone_town: "Stone Town / Airport", north: "North Coast", east: "East Coast", south_east: "South & South East Coast", other: "Other area", not_sure: "Not sure yet", dar_es_salaam: "Dar es Salaam", arusha: "Arusha", zanzibar: "Zanzibar" } as Record<string, string>)[booking.pickupZone ?? ""] ?? booking.pickupZone?.replaceAll("_", " ") ?? "Not provided";
  const guestsLabel = `${booking.adults} ${booking.adults === 1 ? "adult" : "adults"}${booking.children > 0 ? `, ${booking.children} ${booking.children === 1 ? "child" : "children"}` : ""}`;
  const message = `Hello Zola Tours, my confirmed booking is ${booking.reference}. Tour: ${booking.tourTitle}. Date: ${booking.travelDate}. Guests: ${guestsLabel}. Payment is due on arrival. Voucher: ${booking.voucherUrl}`;
  const estimatedPrice = booking.estimatedPrice && booking.estimatedCurrency
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: booking.estimatedCurrency, maximumFractionDigits: 0 }).format(booking.estimatedPrice)
    : null;
  const quotedPrice = booking.quotedPrice && booking.quotedCurrency
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: booking.quotedCurrency, maximumFractionDigits: 0 }).format(booking.quotedPrice)
    : null;

  return (
    <div className="min-h-screen bg-[var(--sand)]/45">
      <Head title="Booking request received">
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Navbar />
      <main className="mx-auto flex max-w-3xl items-center px-4 py-20 sm:px-6 md:min-h-[65vh]">
        <section className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-[var(--shadow-soft)] md:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--turquoise)]/15 text-[var(--turquoise)]">
            <Check className="h-8 w-8" />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--turquoise)]">Booking confirmed</p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-5xl">Your tour is booked</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            Your booking for <strong className="text-foreground">{booking.tourTitle}</strong> is confirmed. Download your voucher and present it when you arrive. Payment is due on arrival.
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-[var(--sand)]/70 p-5 text-left text-sm">
            <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Reference</span><span className="flex min-w-0 items-center gap-2"><strong className="truncate">{booking.reference}</strong><button type="button" aria-label="Copy booking reference" onClick={async () => { await navigator.clipboard.writeText(booking.reference); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-white text-[var(--ocean)]">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></span></div>
            <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Travel date</span><strong>{booking.travelDate}</strong></div>
            <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Tour style</span><strong className="capitalize">{booking.bookingType}</strong></div>
            <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Guests</span><strong>{guestsLabel}</strong></div>
            {booking.childrenAges.length > 0 && <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Children ages</span><strong>{booking.childrenAges.join(", ")}</strong></div>}
            <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Pickup area</span><strong className="text-right">{pickupLabel}</strong></div>
            {estimatedPrice && !quotedPrice && <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Total due on arrival</span><strong>{estimatedPrice}</strong></div>}
            {quotedPrice && <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Quoted total</span><strong>{quotedPrice}</strong></div>}
            {(estimatedPrice || quotedPrice) && <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">Payment status: unpaid. Pay the amount shown when you arrive. This voucher is not a receipt.</p>}
          </div>

          <div className="mx-auto mt-8 max-w-2xl border-t border-border pt-8">
            <h2 className="font-display text-2xl font-bold">What happens next?</h2>
            <div className="mt-5 grid gap-3 text-left sm:grid-cols-3">
              <div className="rounded-xl border border-border p-4">
                <Check className="h-5 w-5 text-[var(--turquoise)]" />
                <p className="mt-3 text-sm font-bold">Booking confirmed</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Your booking reference and tour details are secured.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <Download className="h-5 w-5 text-[var(--turquoise)]" />
                <p className="mt-3 text-sm font-bold">Keep your voucher</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Save the PDF on your phone and present it on arrival.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <ShieldCheck className="h-5 w-5 text-[var(--turquoise)]" />
                <p className="mt-3 text-sm font-bold">Pay on arrival</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Pay the exact amount shown after presenting your voucher.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={booking.voucherUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ocean)] px-6 py-3 font-bold text-white"
            >
              <Eye className="h-5 w-5" /> Open voucher
            </a>
            <a
              href={getWhatsAppLink(message, site)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white"
            >
              <MessageCircle className="h-5 w-5" /> Continue on WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
