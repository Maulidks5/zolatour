<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Faq', [
            'groups' => Faq::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'category', 'question', 'answer'])
                ->groupBy('category')
                ->map(fn ($items) => $items->values())
                ->values(),
        ]);
    }
}
