<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\TourImage;
use App\Support\WebImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TourImageController extends Controller
{
    public function store(Request $request, Tour $tour, WebImageStorage $images): RedirectResponse
    {
        $validated = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:10'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $nextOrder = ((int) $tour->images()->max('sort_order')) + 1;

        foreach ($validated['images'] as $position => $file) {
            $path = $images->store($file, "tours/{$tour->id}/gallery");
            $tour->images()->create([
                'path' => '/storage/'.$path,
                'alt_text' => $tour->title.' gallery image',
                'sort_order' => $nextOrder + $position,
            ]);
        }

        return back()->with('success', 'Gallery images uploaded and optimized.');
    }

    public function update(Request $request, Tour $tour, TourImage $image): RedirectResponse
    {
        abort_unless($image->tour_id === $tour->id, 404);

        $validated = $request->validate([
            'alt_text' => ['nullable', 'string', 'max:190'],
            'sort_order' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        $image->update($validated);

        return back()->with('success', 'Gallery image updated.');
    }

    public function destroy(Tour $tour, TourImage $image): RedirectResponse
    {
        abort_unless($image->tour_id === $tour->id, 404);

        if (Str::startsWith($image->path, '/storage/')) {
            Storage::disk('public')->delete(Str::after($image->path, '/storage/'));
        }

        $image->delete();

        return back()->with('success', 'Gallery image removed.');
    }
}
