<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTourRequest;
use App\Models\Tour;
use App\Models\TourCategory;
use App\Support\WebImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TourController extends Controller
{
    public function index(Request $request): Response
    {
        $catalogue = $request->string('type')->toString();
        $catalogue = in_array($catalogue, ['tour', 'safari'], true) ? $catalogue : 'tour';

        $query = Tour::query()->with('category:id,name');
        $catalogue === 'safari'
            ? $query->where('experience_type', 'safari')
            : $query->where('experience_type', '!=', 'safari');

        return Inertia::render('Admin/Tours/Index', [
            'catalogue' => $catalogue,
            'tours' => $query
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Tour $tour): array => [
                    'slug' => $tour->slug,
                    'title' => $tour->title,
                    'category' => $tour->category->name,
                    'type' => $tour->experience_type,
                    'image' => $tour->cover_image_path ?: '/images/experiences/hero-zanzibar.webp',
                    'duration' => $tour->duration,
                    'location' => $tour->location,
                    'price' => (float) $tour->price,
                    'currency' => $tour->currency,
                    'isPublished' => $tour->is_published,
                    'isPopular' => $tour->is_popular,
                ]),
        ]);
    }

    public function edit(Tour $tour): Response
    {
        $tour->load(['highlights', 'inclusions', 'itineraryItems', 'images', 'faqs']);

        return Inertia::render('Admin/Tours/Edit', [
            'tour' => [
                'id' => $tour->id,
                'tour_category_id' => $tour->tour_category_id,
                'experience_type' => $tour->experience_type,
                'title' => $tour->title,
                'slug' => $tour->slug,
                'excerpt' => $tour->excerpt,
                'description' => $tour->description,
                'duration' => $tour->duration,
                'location' => $tour->location,
                'price' => (float) $tour->price,
                'shared_available' => $tour->shared_available,
                'shared_adult_price' => $tour->shared_adult_price !== null ? (float) $tour->shared_adult_price : ($tour->price > 0 ? (float) $tour->price : null),
                'shared_group_adult_price' => $tour->shared_group_adult_price !== null ? (float) $tour->shared_group_adult_price : null,
                'shared_child_price' => $tour->shared_child_price !== null ? (float) $tour->shared_child_price : null,
                'shared_infant_price' => $tour->shared_infant_price !== null ? (float) $tour->shared_infant_price : null,
                'private_available' => $tour->private_available,
                'private_1_2_price' => $tour->private_1_2_price !== null ? (float) $tour->private_1_2_price : null,
                'private_3_4_price' => $tour->private_3_4_price !== null ? (float) $tour->private_3_4_price : null,
                'private_5_6_price' => $tour->private_5_6_price !== null ? (float) $tour->private_5_6_price : null,
                'private_7_10_price' => $tour->private_7_10_price !== null ? (float) $tour->private_7_10_price : null,
                'private_child_supplement' => $tour->private_child_supplement !== null ? (float) $tour->private_child_supplement : null,
                'large_group_quote' => $tour->large_group_quote,
                'currency' => $tour->currency,
                'minimum_age' => $tour->minimum_age,
                'difficulty' => $tour->difficulty,
                'pickup_details' => $tour->pickup_details,
                'meta_title' => $tour->meta_title,
                'meta_description' => $tour->meta_description,
                'cover_image_path' => $tour->cover_image_path,
                'is_featured' => $tour->is_featured,
                'is_popular' => $tour->is_popular,
                'is_published' => $tour->is_published,
                'highlights' => $tour->highlights->pluck('label'),
                'included' => $tour->inclusions->where('is_included', true)->pluck('label')->values(),
                'not_included' => $tour->inclusions->where('is_included', false)->pluck('label')->values(),
                'itinerary' => $tour->itineraryItems->map(fn ($item): array => [
                    'time' => $item->time_label,
                    'title' => $item->title,
                    'description' => $item->description,
                ]),
                'faqs' => $tour->faqs->map(fn ($faq): array => [
                    'question' => $faq->question,
                    'answer' => $faq->answer,
                ]),
                'images' => $tour->images->map(fn ($image): array => [
                    'id' => $image->id,
                    'path' => $image->path,
                    'alt_text' => $image->alt_text,
                    'sort_order' => $image->sort_order,
                ]),
            ],
            'categories' => TourCategory::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name']),
        ]);
    }

    public function create(Request $request): Response
    {
        $defaultType = $request->string('type')->toString() === 'safari' ? 'safari' : 'zanzibar_tour';
        $categories = TourCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug']);

        return Inertia::render('Admin/Tours/Create', [
            'categories' => $categories->map->only(['id', 'name']),
            'defaultType' => $defaultType,
            'defaultCategoryId' => $defaultType === 'safari'
                ? ($categories->firstWhere('slug', 'tanzania-safaris')?->id ?? $categories->first()?->id)
                : $categories->first()?->id,
        ]);
    }

    public function store(UpdateTourRequest $request, WebImageStorage $images): RedirectResponse
    {
        $data = $request->safe()->except('cover_image');
        $data['is_featured'] = $request->boolean('is_featured');
        $data['is_popular'] = $request->boolean('is_popular');
        $data['is_published'] = $request->boolean('is_published');
        $data = $this->normalisePricing($request, $data);
        $data['sort_order'] = ((int) Tour::query()->max('sort_order')) + 1;

        $tour = Tour::query()->create($data);

        if ($request->hasFile('cover_image')) {
            $path = $images->store($request->file('cover_image'), "tours/{$tour->id}");
            $tour->update(['cover_image_path' => '/storage/'.$path]);
        }

        return to_route('admin.tours.edit', $tour)->with('success', 'Tour created. You can now add highlights, itinerary and gallery images.');
    }

    public function update(UpdateTourRequest $request, Tour $tour, WebImageStorage $images): RedirectResponse
    {
        $data = $request->safe()->except('cover_image');
        $data['is_featured'] = $request->boolean('is_featured');
        $data['is_popular'] = $request->boolean('is_popular');
        $data['is_published'] = $request->boolean('is_published');
        $data = $this->normalisePricing($request, $data);

        if ($request->hasFile('cover_image')) {
            if (Str::startsWith((string) $tour->cover_image_path, '/storage/')) {
                Storage::disk('public')->delete(Str::after($tour->cover_image_path, '/storage/'));
            }

            $path = $images->store($request->file('cover_image'), "tours/{$tour->id}");
            $data['cover_image_path'] = '/storage/'.$path;
        }

        $tour->update($data);

        return to_route('admin.tours.edit', $tour)->with('success', 'Tour updated successfully.');
    }
    private function normalisePricing(Request $request, array $data): array
    {
        if (! $request->has('shared_available') && ! $request->has('private_available')) {
            return $data;
        }

        $data['shared_available'] = $request->boolean('shared_available');
        $data['private_available'] = $request->boolean('private_available');
        $data['large_group_quote'] = $request->boolean('large_group_quote');

        $prices = $data['shared_available']
            ? [$data['shared_adult_price'] ?? null]
            : [$data['private_1_2_price'] ?? null, $data['private_3_4_price'] ?? null, $data['private_5_6_price'] ?? null, $data['private_7_10_price'] ?? null];
        $prices = array_values(array_filter($prices, fn ($price) => $price !== null && $price !== ''));
        $data['price'] = $prices ? min(array_map('floatval', $prices)) : 0;

        return $data;
    }
}
