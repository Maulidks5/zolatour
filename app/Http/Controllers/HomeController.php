<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use App\Models\HeroSlide;
use App\Models\Testimonial;
use App\Models\Partner;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $tours = Tour::query()
            ->published()
            ->where('experience_type', '!=', 'safari')
            ->with('category:id,name,slug')
            ->orderByDesc('is_popular')
            ->orderBy('sort_order')
            ->limit(6)
            ->get();

        return Inertia::render('Home', [
            'heroSlides' => HeroSlide::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->limit(5)
                ->get()
                ->map(fn (HeroSlide $slide): array => [
                    'id' => $slide->id,
                    'eyebrow' => $slide->eyebrow,
                    'title' => $slide->title,
                    'description' => $slide->description,
                    'image' => $slide->image_path,
                    'imageAlt' => $slide->image_alt ?: $slide->title,
                    'imagePosition' => $slide->image_position,
                    'primaryLabel' => $slide->primary_label,
                    'primaryUrl' => $slide->primary_url,
                    'secondaryLabel' => $slide->secondary_label,
                    'secondaryUrl' => $slide->secondary_url,
                ]),
            'tours' => $tours->map(fn (Tour $tour): array => $this->tourCard($tour)),
            'safaris' => Tour::query()
                ->published()
                ->where('experience_type', 'safari')
                ->with('category:id,name,slug')
                ->orderByDesc('is_featured')
                ->orderBy('sort_order')
                ->limit(3)
                ->get()
                ->map(fn (Tour $tour): array => $this->tourCard($tour)),
            'testimonials' => Testimonial::query()
                ->where('status', 'approved')
                ->orderByDesc('is_featured')
                ->latest('approved_at')
                ->limit(6)
                ->get()
                ->map(fn (Testimonial $item): array => [
                    'name' => $item->name,
                    'country' => $item->country,
                    'tourName' => $item->tour_name,
                    'rating' => $item->rating,
                    'content' => $item->content,
                ]),
            'partners' => Partner::query()->where('is_active', true)->orderBy('sort_order')->get()->map(fn (Partner $partner): array => ['name'=>$partner->name,'icon'=>$partner->icon,'url'=>$partner->url]),
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
        ];
    }
}
