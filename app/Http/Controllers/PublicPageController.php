<?php

namespace App\Http\Controllers;

use App\Models\HomeContentItem;
use App\Models\SiteSetting;
use Inertia\Inertia;
use Inertia\Response;

class PublicPageController extends Controller
{
    public function about(): Response
    {
        $settings = SiteSetting::publicValues();

        return Inertia::render('About', [
            'content' => [
                'eyebrow' => $settings['about_eyebrow'] ?? 'Your local Zanzibar team',
                'title' => $settings['about_title'] ?? 'Meaningful journeys, planned with local care',
                'description' => 'Zola Tours & Safaris helps travellers discover Zanzibar through simple, well-planned island experiences.',
                'storyTitle' => $settings['about_story_title'] ?? 'More than a tour, a local connection',
                'story' => 'From island escapes and cultural visits to ocean adventures, our goal is to make your Zanzibar experience clear, comfortable and memorable.',
                'image' => $settings['about_image_path'] ?? ($settings['cta_image_path'] ?? '/images/experiences/cta-zanzibar.webp'),
            ],
            'values' => HomeContentItem::query()
                ->where('section', 'why')
                ->where('is_active', true)
                ->whereIn('title', ['Experienced Local Guides', 'Reliable Private Transport', 'Personalized Experiences', 'Fast WhatsApp Support'])
                ->orderBy('sort_order')
                ->get(['title', 'description', 'icon']),
        ]);
    }

    public function contact(): Response
    {
        $settings = SiteSetting::publicValues();

        return Inertia::render('Contact', [
            'submittedInquiry' => session('contactRequest'),
            'content' => [
                'eyebrow' => $settings['contact_page_eyebrow'] ?? 'Talk to our local team',
                'title' => $settings['contact_page_title'] ?? "Let's plan your Zanzibar experience",
                'description' => $settings['contact_page_description'] ?? 'Tell us your travel dates, group size and the experiences you are interested in. We will help you with the next steps.',
            ],
        ]);
    }

    public function privacy(): Response { return $this->legalPage('privacy', 'Privacy Policy', 'How we collect, use and protect your personal information.'); }
    public function terms(): Response { return $this->legalPage('terms', 'Terms & Conditions', 'The terms that apply when you use our website or request travel services.'); }
    public function cancellation(): Response { return $this->legalPage('cancellation', 'Booking & Cancellation Policy', 'How requests, confirmations, changes and cancellations are handled.'); }
    public function refunds(): Response { return $this->legalPage('refunds', 'Refund Policy', 'When refunds may apply and how approved refunds are handled.'); }

    private function legalPage(string $page, string $title, string $description): Response
    {
        return Inertia::render('Legal', compact('page', 'title', 'description'));
    }

}
