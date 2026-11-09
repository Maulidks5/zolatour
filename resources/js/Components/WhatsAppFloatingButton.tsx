import { MessageCircle } from "lucide-react";
import { getWhatsAppLink, useSiteConfig } from "@/config/site";

export function WhatsAppFloatingButton() {
    const site = useSiteConfig();
    return (
        <a
            href={getWhatsAppLink("Hello Zola Tours, I would like help planning a Zanzibar tour.", site)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Zola Tours on WhatsApp"
            className="fixed bottom-6 right-5 z-[61] inline-flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 font-bold text-white shadow-[0_14px_35px_-8px_rgb(3_37_67/0.55)] transition hover:-translate-y-0.5 hover:brightness-95 sm:right-6"
        >
            <MessageCircle className="h-6 w-6" />
            <span className="hidden pr-1 text-sm sm:inline">Plan your tour</span>
        </a>
    );
}
