import { usePage } from "@inertiajs/react";

export type SiteConfig = {
  name: string;
  tagline: string;
  footerDescription: string;
  seoTitle: string;
  seoDescription: string;
  logoPath: string;
  ctaImagePath: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  phone: string;
  location: string;
  workingHours: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    twitter: string;
    youtube: string;
  };
};

export const SITE_CONFIG: SiteConfig = {
  name: "Zola Tours & Safaris",
  tagline: "Explore. Experience. Remember.",
  footerDescription: "Simple, memorable Zanzibar tours planned by a local team.",
  seoTitle: "Zola Tours & Safaris — Zanzibar Tours",
  seoDescription: "Explore Zanzibar with simple, memorable tours planned by a trusted local team.",
  logoPath: "/brand/zola-tours-logo.jpeg",
  ctaImagePath: "/images/experiences/cta-zanzibar.webp",
  whatsappNumber: "255775110089",
  whatsappMessage: "Hello Zola Tours, I would like help planning a Zanzibar tour.",
  email: "info@zolatoursandsafaris.com",
  phone: "+255 775 110 089",
  location: "Zanzibar, Tanzania",
  workingHours: "Daily 08:00–20:00 EAT",
  social: {
    facebook: "https://www.facebook.com/share/1EnsuYC6DD/",
    instagram: "",
    tiktok: "",
    twitter: "#",
    youtube: "#",
  },
};

export function useSiteConfig(): SiteConfig {
  return (usePage().props.site as SiteConfig | undefined) ?? SITE_CONFIG;
}

export const getWhatsAppLink = (customMessage?: string, config: SiteConfig = SITE_CONFIG) => {
  const msg = encodeURIComponent(customMessage || config.whatsappMessage);
  return `https://wa.me/${config.whatsappNumber}?text=${msg}`;
};
