import { DEFAULT_TOUR_IMAGE } from "@/config/image";

export interface Tour {
  slug: string;
  title: string;
  description: string;
  duration: string;
  location: string;
  rating: number;
  price: string;
  image: string;
}

export const tours: Tour[] = [
  {
    slug: "prison-island",
    title: "Prison Island Tour",
    description: "Meet giant Aldabra tortoises and snorkel around a historic island paradise.",
    duration: "Half Day",
    location: "Stone Town",
    rating: 4.8,
    price: "From $45",
    image: DEFAULT_TOUR_IMAGE,
  },
  {
    slug: "nakupenda-beach",
    title: "Nakupenda Beach & Sandbank",
    description: "Relax on a pristine white sandbank surrounded by turquoise Indian Ocean waters.",
    duration: "Full Day",
    location: "Zanzibar Coast",
    rating: 4.9,
    price: "From $60",
    image: DEFAULT_TOUR_IMAGE,
  },
  {
    slug: "safari-blue",
    title: "Safari Blue Zanzibar",
    description: "Full-day dhow adventure with snorkeling, sandbank picnic and seafood lunch.",
    duration: "Full Day",
    location: "Fumba Peninsula",
    rating: 5.0,
    price: "From $75",
    image: DEFAULT_TOUR_IMAGE,
  },
  {
    slug: "mnemba-island",
    title: "Mnemba Island Snorkeling",
    description: "Discover vibrant coral reefs and swim with dolphins around Mnemba atoll.",
    duration: "Full Day",
    location: "Northeast Zanzibar",
    rating: 4.9,
    price: "From $80",
    image: DEFAULT_TOUR_IMAGE,
  },
  {
    slug: "jozani-forest",
    title: "Jozani Forest & Red Colobus",
    description: "Walk through mangroves and meet the rare red colobus monkeys of Zanzibar.",
    duration: "Half Day",
    location: "Jozani",
    rating: 4.7,
    price: "From $40",
    image: DEFAULT_TOUR_IMAGE,
  },
  {
    slug: "spice-tour",
    title: "Zanzibar Spice Tour",
    description: "Taste, smell and learn the story behind Zanzibar's world-famous spices.",
    duration: "Half Day",
    location: "Kizimbani",
    rating: 4.8,
    price: "From $35",
    image: DEFAULT_TOUR_IMAGE,
  },
];

export const getTourBySlug = (slug: string) => tours.find((t) => t.slug === slug);
