import { useSiteConfig } from "@/config/site";

export function SocialLinks({
    light = false,
    compact = false,
    primaryOnly = false,
}: {
    light?: boolean;
    compact?: boolean;
    primaryOnly?: boolean;
}) {
    const site = useSiteConfig();
    const links = [
        {
            label: "Facebook",
            href: site.social.facebook,
            icon: <FacebookIcon />,
        },
        {
            label: "Instagram",
            href: site.social.instagram,
            icon: <InstagramIcon />,
        },
        { label: "TikTok", href: site.social.tiktok, icon: <TikTokIcon /> },
        {
            label: "X",
            href: site.social.twitter,
            icon: <span className="text-sm font-bold">𝕏</span>,
        },
        { label: "YouTube", href: site.social.youtube, icon: <YouTubeIcon /> },
    ].filter(
        (social) =>
            social.href &&
            social.href !== "#" &&
            (!primaryOnly || social.label === "Instagram"),
    );

    if (!links.length) return null;

    return (
        <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2.5"}`}>
            {links.map((social) => (
                <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit Zola Tours on ${social.label}`}
                    title={social.label}
                    className={`grid place-items-center rounded-full transition ${compact ? "h-7 w-7" : "h-10 w-10"} ${light ? "border border-border bg-white text-[var(--ocean)] hover:border-[var(--turquoise)] hover:bg-[var(--turquoise)] hover:text-white" : "bg-white/10 text-white hover:bg-[var(--gold)] hover:text-foreground"}`}
                >
                    {social.icon}
                </a>
            ))}
        </div>
    );
}

function TikTokIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-current"
        >
            <path d="M15.6 3c.3 2.1 1.5 3.4 3.6 3.6v3.1a8.1 8.1 0 0 1-3.6-1.1v6.2a5.8 5.8 0 1 1-5-5.7v3.2a2.7 2.7 0 1 0 1.9 2.5V3h3.1Z" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-current"
        >
            <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.2c0-1 .3-1.7 1.8-1.7h1.9V2.4c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v2.4H6.5V13h3.2v9h3.8Z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-none stroke-current"
            strokeWidth="2"
        >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle
                cx="17.5"
                cy="6.5"
                r="1"
                className="fill-current stroke-none"
            />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-current"
        >
            <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8ZM10 15.2V8.8l5.5 3.2-5.5 3.2Z" />
        </svg>
    );
}
