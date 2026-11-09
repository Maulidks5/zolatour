<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TourContentController extends Controller
{
    public function update(Request $request, Tour $tour): RedirectResponse
    {
        $validated = $request->validate([
            'highlights' => ['array', 'max:12'],
            'highlights.*' => ['required', 'string', 'max:160'],
            'included' => ['array', 'max:20'],
            'included.*' => ['required', 'string', 'max:160'],
            'not_included' => ['array', 'max:20'],
            'not_included.*' => ['required', 'string', 'max:160'],
            'itinerary' => ['array', 'max:20'],
            'itinerary.*.time' => ['nullable', 'string', 'max:50'],
            'itinerary.*.title' => ['required', 'string', 'max:160'],
            'itinerary.*.description' => ['nullable', 'string', 'max:1000'],
            'faqs' => ['array', 'max:12'],
            'faqs.*.question' => ['required', 'string', 'max:200'],
            'faqs.*.answer' => ['required', 'string', 'max:1500'],
        ]);

        DB::transaction(function () use ($tour, $validated): void {
            $tour->highlights()->delete();
            $tour->highlights()->createMany(
                collect($validated['highlights'] ?? [])->map(fn (string $label, int $index): array => [
                    'label' => $label,
                    'sort_order' => $index + 1,
                ])->all(),
            );

            $tour->inclusions()->delete();
            $included = collect($validated['included'] ?? [])->map(fn (string $label, int $index): array => [
                'label' => $label,
                'is_included' => true,
                'sort_order' => $index + 1,
            ]);
            $notIncluded = collect($validated['not_included'] ?? [])->map(fn (string $label, int $index): array => [
                'label' => $label,
                'is_included' => false,
                'sort_order' => $included->count() + $index + 1,
            ]);
            $tour->inclusions()->createMany($included->concat($notIncluded)->all());

            $tour->itineraryItems()->delete();
            $tour->itineraryItems()->createMany(
                collect($validated['itinerary'] ?? [])->map(fn (array $item, int $index): array => [
                    'time_label' => $item['time'] ?: null,
                    'title' => $item['title'],
                    'description' => $item['description'] ?: null,
                    'sort_order' => $index + 1,
                ])->all(),
            );

            $tour->faqs()->delete();
            $tour->faqs()->createMany(
                collect($validated['faqs'] ?? [])->map(fn (array $faq, int $index): array => [
                    'question' => $faq['question'],
                    'answer' => $faq['answer'],
                    'sort_order' => $index + 1,
                ])->all(),
            );
        });

        return back()->with('success', 'Tour details updated successfully.');
    }
}
