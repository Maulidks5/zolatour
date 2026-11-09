<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use App\Models\TourCategory;
use App\Models\TransportRequest;
use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = Schema::hasTable('site_settings') ? SiteSetting::publicValues() : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'isAdmin' => $request->user()->is_admin,
                    'role' => $request->user()->role,
                    'canManageUsers' => $request->user()->can('manage-users'),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'transportRequest' => fn () => $request->session()->get('transport_request'),
            ],
            'adminCounts' => fn (): array => $request->user()?->is_admin && Schema::hasTable('transport_requests')
                ? ['newTransportRequests' => TransportRequest::query()->where('status', 'new')->count(), 'newMessages' => ContactInquiry::query()->where('status', 'new')->count()]
                : ['newTransportRequests' => 0, 'newMessages' => 0],
            'site' => [
                'name' => 'Zola Tours & Safaris',
                'tagline' => 'Explore. Experience. Remember.',
                'footerDescription' => 'Simple, memorable Zanzibar tours planned by a local team.',
                'seoTitle' => 'Zola Tours & Safaris — Zanzibar Tours',
                'seoDescription' => 'Explore Zanzibar with simple, memorable tours planned by a trusted local team.',
                'logoPath' => '/brand/zola-tours-logo.jpeg',
                'ctaImagePath' => $settings['cta_image_path'] ?? '/images/experiences/cta-zanzibar.webp',
                'phone' => $settings['phone'] ?? '+255 775 110 089',
                'whatsappNumber' => $settings['whatsapp_number'] ?? '255775110089',
                'whatsappMessage' => 'Hello Zola Tours, I would like help planning a Zanzibar tour.',
                'email' => $settings['email'] ?? 'info@zolatoursandsafaris.com',
                'location' => $settings['location'] ?? 'Zanzibar, Tanzania',
                'workingHours' => $settings['working_hours'] ?? 'Daily 08:00–20:00 EAT',
                'social' => [
                    'facebook' => '',
                    'instagram' => '',
                    'tiktok' => '',
                    'twitter' => '',
                    'youtube' => '',
                ],
            ],
            'navigation' => [
                'categories' => Schema::hasTable('tour_categories')
                    ? TourCategory::query()
                        ->where('is_active', true)
                        ->where('slug', '!=', 'tanzania-safaris')
                        ->whereHas('tours', fn ($query) => $query->published()->where('experience_type', '!=', 'safari'))
                        ->withCount(['tours' => fn ($query) => $query->published()])
                        ->orderBy('sort_order')
                        ->limit(8)
                        ->get(['name', 'slug', 'description'])
                        ->map(fn (TourCategory $category): array => [
                            'name' => $category->name,
                            'slug' => $category->slug,
                            'description' => $category->description,
                            'count' => $category->tours_count,
                        ])
                    : [],
            ],
        ];
    }
}
