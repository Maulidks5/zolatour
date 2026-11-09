import { useState } from "react";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";
import { MessageCircle } from "lucide-react";

interface Props {
  tourTitle?: string;
}

export function BookingForm({ tourTitle = "" }: Props) {
  const site = useSiteConfig();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    date: "",
    adults: "2",
    children: "0",
    hotel: "",
    requests: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const waMsg = `Hello Zola Tours, I would like to book${tourTitle ? ` the ${tourTitle}` : ""} tour.
Name: ${form.name}
Date: ${form.date}
Adults: ${form.adults}, Children: ${form.children}
Hotel: ${form.hotel}`;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl bg-card border border-border/60 p-6 md:p-8 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" name="name" value={form.name} onChange={onChange} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
        <Field label="WhatsApp Number" name="whatsapp" value={form.whatsapp} onChange={onChange} required />
        <Field label="Travel Date" name="date" type="date" value={form.date} onChange={onChange} required />
        <Field label="Number of Adults" name="adults" type="number" min="1" value={form.adults} onChange={onChange} />
        <Field label="Number of Children" name="children" type="number" min="0" value={form.children} onChange={onChange} />
      </div>
      <Field label="Hotel / Pickup Location" name="hotel" value={form.hotel} onChange={onChange} />
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Special Requests</span>
        <textarea
          name="requests"
          value={form.requests}
          onChange={onChange}
          rows={3}
          className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[var(--ocean)]"
        />
      </label>

      {submitted && (
        <p className="rounded-xl bg-[var(--turquoise)]/15 border border-[var(--turquoise)]/30 text-sm px-4 py-3 text-foreground">
          Thanks {form.name || "traveller"}! Your booking request has been received. We'll reach out shortly.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 inline-flex items-center justify-center rounded-full bg-[var(--ocean)] text-white font-semibold py-3 hover:opacity-95 transition"
        >
          Submit Booking Request
        </button>
        <a
          href={getWhatsAppLink(waMsg, site)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-semibold py-3 hover:opacity-95 transition"
        >
          <MessageCircle className="h-4 w-4" /> Book on WhatsApp
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        {...props}
        className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[var(--ocean)]"
      />
    </label>
  );
}
