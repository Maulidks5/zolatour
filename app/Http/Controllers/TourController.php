<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use App\Models\TourCategory;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TourController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->catalogue($request, false);
    }

    public function safaris(Request $request): Response
    {
        return $this->catalogue($request, true);
    }

    private function catalogue(Request $request, bool $safaris): Response
    {
        $settings = SiteSetting::publicValues();
        $category = $safaris ? '' : $request->string('category')->trim()->toString();
        $search = mb_substr($request->string('q')->trim()->toString(), 0, 100);
        $type = $safaris ? 'safari' : $request->string('type')->toString();
        $type = in_array($type, ['zanzibar_tour', 'water_sport'], true) ? $type : '';
        $sort = $request->string('sort')->toString();
        $sort = in_array($sort, ['recommended', 'price_low', 'price_high', 'name'], true) ? $sort : 'recommended';

        $query = Tour::query()
            ->published()
            ->when($safaris, fn ($builder) => $builder->where('experience_type', 'safari'))
            ->unless($safaris, fn ($builder) => $builder->where('experience_type', '!=', 'safari'))
            ->with('category:id,name,slug')
            ->when($category, fn ($builder) => $builder->whereHas(
                'category',
                fn ($categoryQuery) => $categoryQuery->where('slug', $category),
            ))
            ->when($search, fn ($builder) => $builder->where(function ($searchQuery) use ($search): void {
                $searchQuery
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            }))
            ->when($type && ! $safaris, fn ($builder) => $builder->where('experience_type', $type));

        match ($sort) {
            'price_low' => $query->orderByRaw('price = 0')->orderBy('price')->orderBy('sort_order'),
            'price_high' => $query->orderByDesc('price')->orderBy('sort_order'),
            'name' => $query->orderBy('title'),
            default => $query->orderByDesc('is_popular')->orderBy('sort_order'),
        };

        $tours = $query->paginate(9)->withQueryString()->through(fn (Tour $tour): array => $this->tourCard($tour));

        return Inertia::render('Tours/Index', [
            'tours' => $tours,
            'categories' => $safaris ? [] : TourCategory::query()
                ->where('is_active', true)
                ->where('slug', '!=', 'tanzania-safaris')
                ->whereHas('tours', fn ($builder) => $builder->published()->where('experience_type', '!=', 'safari'))
                ->orderBy('sort_order')
                ->get(['name', 'slug']),
            'filters' => [
                'q' => $search,
                'category' => $category ?: null,
                'type' => $type ?: null,
                'sort' => $sort,
            ],
            'isSafari' => $safaris,
            'basePath' => $safaris ? '/safaris' : '/tours',
            'eyebrow' => $safaris ? ($settings['safaris_eyebrow'] ?? 'Mainland Tanzania') : ($settings['tours_eyebrow'] ?? 'Explore Zanzibar'),
            'pageTitle' => $safaris ? ($settings['safaris_title'] ?? 'Safari journeys planned around you') : ($settings['tours_title'] ?? 'Tours designed around unforgettable moments'),
            'pageDescription' => $safaris
                ? ($settings['safaris_description'] ?? 'Tell us your dates, preferred parks and travel style. Our team will help shape the right mainland safari package.')
                : ($settings['tours_description'] ?? 'Choose an island, cultural, nature or water experience and book directly with our local team.'),
        ]);
    }

    public function finder(): Response
    {
        return Inertia::render('TourFinder', [
            'tours' => Tour::query()
                ->published()
                ->with('category:id,name,slug')
                ->orderByDesc('is_popular')
                ->orderByDesc('is_featured')
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Tour $tour): array => $this->tourCard($tour)),
        ]);
    }

    public function show(Tour $tour): Response
    {
        abort_unless($tour->is_published && $tour->experience_type !== 'safari', 404);

        return $this->detail($tour, false);
    }

    public function showSafari(Tour $tour): Response
    {
        abort_unless($tour->is_published && $tour->experience_type === 'safari', 404);

        return $this->detail($tour, true);
    }

    private function detail(Tour $tour, bool $safari): Response
    {

        $tour->load(['category:id,name,slug', 'highlights', 'inclusions', 'itineraryItems', 'images', 'faqs']);

        $related = Tour::query()
            ->published()
            ->where('experience_type', $safari ? '=' : '!=', 'safari')
            ->whereKeyNot($tour->id)
            ->where('tour_category_id', $tour->tour_category_id)
            ->with('category:id,name,slug')
            ->orderBy('sort_order')
            ->limit(3)
            ->get();

        if ($related->count() < 3) {
            $related = $related->concat(
                Tour::query()
                    ->published()
                    ->where('experience_type', $safari ? '=' : '!=', 'safari')
                    ->whereKeyNot($tour->id)
                    ->whereNotIn('id', $related->modelKeys())
                    ->with('category:id,name,slug')
                    ->orderBy('sort_order')
                    ->limit(3 - $related->count())
                    ->get(),
            );
        }

        return Inertia::render('Tours/Show', [
            'tour' => [
                ...$this->tourCard($tour),
                'fullDescription' => $tour->description,
                'pickupDetails' => $tour->pickup_details,
                'metaTitle' => $tour->meta_title,
                'metaDescription' => $tour->meta_description,
                'highlights' => $tour->highlights->pluck('label'),
                'included' => $tour->inclusions->where('is_included', true)->pluck('label')->values(),
                'notIncluded' => $tour->inclusions->where('is_included', false)->pluck('label')->values(),
                'itinerary' => $tour->itineraryItems->map(fn ($item): array => [
                    'time' => $item->time_label,
                    'title' => $item->title,
                    'description' => $item->description,
                ]),
                'images' => $tour->images->map(fn ($image): array => [
                    'path' => $image->path,
                    'alt' => $image->alt_text ?: $tour->title,
                ]),
                'faqs' => $tour->faqs->map(fn ($faq): array => [
                    'question' => $faq->question,
                    'answer' => $faq->answer,
                ]),
            ],
            'relatedTours' => $related->map(fn (Tour $item): array => $this->tourCard($item)),
        ]);
    }

    private function tourCard(Tour $tour): array
    {
        return [
            'slug' => $tour->slug,
            'title' => $tour->title,
            'description' => $tour->excerpt,
            'duration' => $tour->duration,
            'location' => $tour->location,
            'rating' => (float) $tour->rating,
            'reviewsCount' => $tour->reviews_count,
            'price' => (float) $tour->price,
            'currency' => $tour->currency,
            'image' => $tour->cover_image_path ?: '/images/experiences/hero-zanzibar.webp',
            'category' => $tour->category?->name,
            'experienceType' => $tour->experience_type,
            'minimumAge' => $tour->minimum_age,
            'difficulty' => $tour->difficulty,
            'pricing' => [
                'sharedAvailable' => $tour->shared_available,
                'sharedAdultPrice' => $tour->shared_adult_price !== null ? (float) $tour->shared_adult_price : ($tour->price > 0 ? (float) $tour->price : null),
                'sharedGroupAdultPrice' => $tour->shared_group_adult_price !== null ? (float) $tour->shared_group_adult_price : null,
                'sharedChildPrice' => $tour->shared_child_price !== null ? (float) $tour->shared_child_price : null,
                'sharedInfantPrice' => $tour->shared_infant_price !== null ? (float) $tour->shared_infant_price : null,
                'privateAvailable' => $tour->private_available,
                'privateTiers' => [
                    ['min' => 1, 'max' => 2, 'price' => $tour->private_1_2_price !== null ? (float) $tour->private_1_2_price : null],
                    ['min' => 3, 'max' => 4, 'price' => $tour->private_3_4_price !== null ? (float) $tour->private_3_4_price : null],
                    ['min' => 5, 'max' => 6, 'price' => $tour->private_5_6_price !== null ? (float) $tour->private_5_6_price : null],
                    ['min' => 7, 'max' => 10, 'price' => $tour->private_7_10_price !== null ? (float) $tour->private_7_10_price : null],
                ],
                'privateChildSupplement' => $tour->private_child_supplement !== null ? (float) $tour->private_child_supplement : null,
                'largeGroupQuote' => $tour->large_group_quote,
            ],
        ];
    }
}
