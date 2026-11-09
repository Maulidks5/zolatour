<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomeContentItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HomeContentController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Cms/HomeContent', [
            'sections' => HomeContentItem::query()
                ->orderBy('sort_order')
                ->get()
                ->groupBy('section')
                ->map(fn ($items) => $items->map(fn (HomeContentItem $item): array => [
                    'title' => $item->title,
                    'description' => $item->description ?? '',
                    'meta' => $item->meta ?? '',
                    'icon' => $item->icon ?? '',
                    'is_active' => $item->is_active,
                ])->values()),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sections' => ['required', 'array'],
            'sections.trust' => ['array', 'max:8'],
            'sections.why' => ['array', 'max:12'],
            'sections.*.*.title' => ['required', 'string', 'max:160'],
            'sections.*.*.description' => ['nullable', 'string', 'max:1000'],
            'sections.*.*.meta' => ['nullable', 'string', 'max:160'],
            'sections.*.*.icon' => ['nullable', Rule::in(['users', 'car', 'calendar', 'message', 'award', 'sparkles', 'heart', 'shield'])],
            'sections.*.*.is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated): void {
            HomeContentItem::query()->whereIn('section', ['trust', 'why'])->delete();
            $order = 0;
            foreach (['trust', 'why'] as $section) {
                foreach ($validated['sections'][$section] ?? [] as $item) {
                    HomeContentItem::query()->create([
                        'section' => $section,
                        ...$item,
                        'sort_order' => $order++,
                    ]);
                }
            }
        });

        return back()->with('success', 'Homepage sections saved.');
    }
}
