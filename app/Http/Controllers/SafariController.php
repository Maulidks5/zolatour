<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use App\Models\Tour;
use Inertia\Inertia;
use Inertia\Response;

class SafariController extends Controller
{
    public function __invoke(): Response
    {
        $settings = SiteSetting::publicValues();

        return Inertia::render('Safaris', [
            'pageTitle' => $settings['safaris_title'] ?? 'Safari journeys planned around you',
            'pageDescription' => $settings['safaris_description'] ?? 'Tell us your dates, preferred parks and travel style.',
            'ideas' => Tour::query()
                ->published()
                ->where('experience_type', 'safari')
                ->where('is_featured', true)
                ->with('highlights:id,tour_id,label,sort_order')
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Tour $tour): array => [
                    'slug' => $tour->slug,
                    'title' => $tour->title,
                    'description' => $tour->excerpt,
                    'duration' => $tour->duration,
                    'image' => $tour->cover_image_path ?: '/images/experiences/hero-zanzibar.webp',
                    'location' => $tour->location,
                    'price' => (float) $tour->price,
                    'currency' => $tour->currency,
                    'highlights' => $tour->highlights->pluck('label')->values(),
                ]),
        ]);
    }
}
