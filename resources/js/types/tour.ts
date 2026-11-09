export type TourCardData = {
    slug: string;
    title: string;
    description: string;
    duration: string;
    location: string;
    rating: number;
    reviewsCount: number;
    price: number;
    currency: string;
    image: string;
    category: string | null;
    experienceType: string;
    minimumAge: number | null;
    difficulty: string | null;
    pricing?: TourPricing;
};

export type TourPricing = {
    sharedAvailable: boolean;
    sharedAdultPrice: number | null;
    sharedGroupAdultPrice: number | null;
    sharedChildPrice: number | null;
    sharedInfantPrice: number | null;
    privateAvailable: boolean;
    privateTiers: Array<{ min: number; max: number; price: number | null }>;
    privateChildSupplement: number | null;
    largeGroupQuote: boolean;
};

export type TourCategoryData = {
    name: string;
    slug: string;
    description: string | null;
    image: string;
    toursCount: number;
};

export type TourDetailData = TourCardData & {
    pricing: TourPricing;
    fullDescription: string;
    pickupDetails: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    highlights: string[];
    included: string[];
    notIncluded: string[];
    itinerary: Array<{
        time: string | null;
        title: string;
        description: string | null;
    }>;
    images: Array<{
        path: string;
        alt: string;
    }>;
    faqs: Array<{
        question: string;
        answer: string;
    }>;
};
