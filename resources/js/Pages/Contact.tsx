import { FormEvent, useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    Check,
    Clock3,
    Copy,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    ShieldCheck,
} from "lucide-react";
import { Footer } from "@/Components/Footer";
import { Navbar } from "@/Components/Navbar";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";
import { SocialLinks } from "@/Components/SocialLinks";

type Props = {
    content: { eyebrow: string; title: string; description: string };
    submittedInquiry: {
        reference: string;
        topic: string;
        phone: string | null;
    } | null;
};

export default function Contact({ content, submittedInquiry }: Props) {
    const site = useSiteConfig();
    const [copied, setCopied] = useState(false);
    const form = useForm({
        name: "",
        email: "",
        phone: "",
        preferred_contact: "email",
        topic: "tour",
        subject: "",
        message: "",
        consent: false,
        website: "",
    });
    useEffect(() => {
        try {
            const saved = localStorage.getItem("zola-tours-contact-draft");
            if (saved)
                form.setData({
                    ...form.data,
                    ...JSON.parse(saved),
                    consent: false,
                    website: "",
                });
        } catch {}
    }, []);
    useEffect(() => {
        if (submittedInquiry)
            localStorage.removeItem("zola-tours-contact-draft");
        else
            localStorage.setItem(
                "zola-tours-contact-draft",
                JSON.stringify({ ...form.data, consent: false, website: "" }),
            );
    }, [form.data, submittedInquiry]);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post("/contact", {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <div className="min-h-screen bg-[var(--sand)]/35">
            <Head title={`Contact ${site.name}`}>
                <meta name="description" content={content.description} />
            </Head>
            <Navbar />
            <main>
                <section className="bg-[var(--ocean)] text-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                            {content.eyebrow}
                        </p>
                        <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold md:text-6xl">
                            {content.title}
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                            {content.description}
                        </p>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-8">
                    <aside className="space-y-4 lg:sticky lg:top-28">
                        <ContactCard
                            icon={MessageCircle}
                            label="WhatsApp"
                            value={site.phone}
                            href={getWhatsAppLink(
                                "Hello Zola Tours, I would like help planning a Zanzibar tour.",
                                site,
                            )}
                            accent
                        />
                        <ContactCard
                            icon={Phone}
                            label="Call us"
                            value={site.phone}
                            href={`tel:${site.phone.replace(/\s/g, "")}`}
                        />
                        <ContactCard
                            icon={MapPin}
                            label="Location"
                            value={site.location}
                        />
                        <div className="rounded-2xl bg-[var(--ocean)] p-5 text-white">
                            <Clock3 className="h-5 w-5 text-[var(--gold)]" />
                            <p className="mt-3 font-bold">
                                Quick local support
                            </p>
                            <p className="mt-1 text-xs leading-5 text-white/65">
                                For the fastest response, contact our team
                                directly on WhatsApp.
                            </p>
                        </div>
                    </aside>

                    <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-10">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--turquoise)]">
                            Send an inquiry
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold">
                            Tell us about your trip
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Share as much as you know. Dates, group size and
                            preferred tours help us give you a useful response.
                        </p>

                        {submittedInquiry && (
                            <div
                                role="status"
                                className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900"
                            >
                                <p className="font-bold">Message received</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span>
                                        Reference:{" "}
                                        <strong>
                                            {submittedInquiry.reference}
                                        </strong>
                                    </span>
                                    <button
                                        type="button"
                                        aria-label="Copy reference"
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(
                                                submittedInquiry.reference,
                                            );
                                            setCopied(true);
                                            setTimeout(
                                                () => setCopied(false),
                                                2000,
                                            );
                                        }}
                                        className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-200 bg-white"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs">
                                    Topic: {submittedInquiry.topic}. Our team
                                    will reply using your preferred contact
                                    method.
                                </p>
                                {submittedInquiry.phone && (
                                    <a
                                        href={getWhatsAppLink(
                                            `Hello Zola Tours, I submitted message ${submittedInquiry.reference}.`,
                                            site,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white"
                                    >
                                        <MessageCircle className="h-4 w-4" />{" "}
                                        Continue on WhatsApp
                                    </a>
                                )}
                            </div>
                        )}
                        {Object.keys(form.errors).length > 0 && (
                            <div
                                role="alert"
                                className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
                            >
                                Please check the highlighted fields and try
                                again.
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-7 grid gap-5">
                            <input
                                type="hidden"
                                tabIndex={-1}
                                autoComplete="off"
                                value={form.data.website}
                                onChange={(event) =>
                                    form.setData("website", event.target.value)
                                }
                                className="absolute -left-[10000px] h-px w-px"
                                aria-hidden="true"
                            />
                            <Field
                                label="What can we help with?"
                                error={form.errors.topic}
                            >
                                <select
                                    value={form.data.topic}
                                    onChange={(e) =>
                                        form.setData("topic", e.target.value)
                                    }
                                    className={inputClass(form.errors.topic)}
                                >
                                    <option value="tour">Tour question</option>
                                    <option value="safari">
                                        Safari planning
                                    </option>
                                    <option value="transport">Transport</option>
                                    <option value="booking">
                                        Existing booking
                                    </option>
                                    <option value="partnership">
                                        Partnership
                                    </option>
                                    <option value="other">Other</option>
                                </select>
                            </Field>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Full name"
                                    error={form.errors.name}
                                >
                                    <input
                                        required
                                        autoComplete="name"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                "name",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Your full name"
                                        className={inputClass(form.errors.name)}
                                    />
                                </Field>
                                <Field
                                    label="Email address"
                                    error={form.errors.email}
                                >
                                    <input
                                        required
                                        type="email"
                                        autoComplete="email"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData(
                                                "email",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="you@example.com"
                                        className={inputClass(
                                            form.errors.email,
                                        )}
                                    />
                                </Field>
                                <Field
                                    label={`WhatsApp (${form.data.preferred_contact === "whatsapp" ? "required" : "optional"})`}
                                    error={form.errors.phone}
                                >
                                    <input
                                        required={
                                            form.data.preferred_contact ===
                                            "whatsapp"
                                        }
                                        autoComplete="tel"
                                        value={form.data.phone}
                                        onChange={(e) =>
                                            form.setData(
                                                "phone",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+255 ..."
                                        className={inputClass(
                                            form.errors.phone,
                                        )}
                                    />
                                </Field>
                                <Field
                                    label="Preferred response"
                                    error={form.errors.preferred_contact}
                                >
                                    <select
                                        value={form.data.preferred_contact}
                                        onChange={(e) =>
                                            form.setData(
                                                "preferred_contact",
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass(
                                            form.errors.preferred_contact,
                                        )}
                                    >
                                        <option value="email">Email</option>
                                        <option value="whatsapp">
                                            WhatsApp
                                        </option>
                                    </select>
                                </Field>
                            </div>
                            <Field
                                label="Short subject (optional)"
                                error={form.errors.subject}
                            >
                                <input
                                    value={form.data.subject}
                                    onChange={(event) =>
                                        form.setData(
                                            "subject",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Example: Private Mnemba tour for four guests"
                                    className={inputClass(form.errors.subject)}
                                />
                            </Field>
                            <Field
                                label="Your message"
                                error={form.errors.message}
                            >
                                <textarea
                                    required
                                    rows={6}
                                    value={form.data.message}
                                    onChange={(event) =>
                                        form.setData(
                                            "message",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Travel dates, number of guests, hotel and experiences you are interested in…"
                                    className={inputClass(form.errors.message)}
                                />
                            </Field>
                            <label className="flex items-start gap-3 rounded-xl bg-[var(--sand)]/70 p-4 text-xs leading-5 text-muted-foreground">
                                <input
                                    required
                                    type="checkbox"
                                    checked={form.data.consent}
                                    onChange={(e) =>
                                        form.setData(
                                            "consent",
                                            e.target.checked,
                                        )
                                    }
                                    className="mt-1"
                                />
                                <span>
                                    I agree to be contacted and accept the{" "}
                                    <a
                                        href="/terms-and-conditions"
                                        target="_blank"
                                        className="font-bold text-[var(--ocean)] underline"
                                    >
                                        Terms
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        href="/privacy-policy"
                                        target="_blank"
                                        className="font-bold text-[var(--ocean)] underline"
                                    >
                                        Privacy Policy
                                    </a>
                                    .
                                </span>
                            </label>
                            {form.errors.consent && (
                                <span className="text-xs font-medium text-red-600">
                                    {form.errors.consent}
                                </span>
                            )}
                            <button
                                disabled={form.processing}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--ocean)] px-6 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                            >
                                <Send className="h-4 w-4" />
                                {form.processing
                                    ? "Sending message…"
                                    : "Send message"}
                            </button>
                        </form>
                    </section>
                </section>
            </main>
            <Footer />
        </div>
    );
}

function ContactCard({
    icon: Icon,
    label,
    value,
    href,
    accent = false,
}: {
    icon: typeof Phone;
    label: string;
    value: string;
    href?: string;
    accent?: boolean;
}) {
    const body = (
        <>
            <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${accent ? "bg-[#25D366]/15 text-[#159447]" : "bg-[var(--turquoise)]/15 text-[var(--ocean)]"}`}
            >
                <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">
                    {label}
                </span>
                <span className="block break-words text-sm font-bold">
                    {value}
                </span>
            </span>
        </>
    );
    return href ? (
        <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-[var(--turquoise)]"
        >
            {body}
        </a>
    ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            {body}
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/75">
                {label}
            </span>
            {children}
            {error && (
                <span className="text-xs font-medium text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

function inputClass(error?: string) {
    return `w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--turquoise)]/25 ${error ? "border-red-500" : "border-input focus:border-[var(--turquoise)]"}`;
}
