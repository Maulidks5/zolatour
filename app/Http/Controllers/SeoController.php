<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use App\Models\TravelGuide;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function sitemap(): Response
    {
        return response()
            ->view('sitemap', [
                'pages' => [
                    ['url' => route('home'), 'priority' => '1.0', 'frequency' => 'daily'],
                    ['url' => route('tours.index'), 'priority' => '0.9', 'frequency' => 'weekly'],
                    ['url' => route('tour-finder'), 'priority' => '0.8', 'frequency' => 'weekly'],
                    ['url' => route('safaris.index'), 'priority' => '0.9', 'frequency' => 'weekly'],
                    ['url' => route('transport.index'), 'priority' => '0.9', 'frequency' => 'weekly'],
                    ['url' => route('about'), 'priority' => '0.7', 'frequency' => 'monthly'],
                    ['url' => route('contact'), 'priority' => '0.7', 'frequency' => 'monthly'],
                    ['url' => route('faq'), 'priority' => '0.7', 'frequency' => 'monthly'],
                    ['url' => route('guides.index'), 'priority' => '0.8', 'frequency' => 'weekly'],
                    ['url' => route('feedback.create'), 'priority' => '0.4', 'frequency' => 'monthly'],
                    ['url' => route('legal.privacy'), 'priority' => '0.3', 'frequency' => 'yearly'],
                    ['url' => route('legal.terms'), 'priority' => '0.3', 'frequency' => 'yearly'],
                    ['url' => route('legal.cancellation'), 'priority' => '0.3', 'frequency' => 'yearly'],
                    ['url' => route('legal.refunds'), 'priority' => '0.3', 'frequency' => 'yearly'],
                ],
                'guides' => TravelGuide::query()->published()->orderByDesc('updated_at')->get(['slug', 'updated_at']),
                'tours' => Tour::query()
                    ->published()
                    ->orderByDesc('updated_at')
                    ->get(['slug', 'updated_at']),
            ])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            '',
            'Sitemap: '.route('sitemap'),
            '',
        ]);

        return response($content)->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
