<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Support\WebImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HeroSlideController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cms/HeroSlides', [
            'slides' => HeroSlide::query()->orderBy('sort_order')->get()->map(fn (HeroSlide $slide): array => [
                'id' => $slide->id,
                'eyebrow' => $slide->eyebrow ?? '',
                'title' => $slide->title,
                'description' => $slide->description ?? '',
                'imagePath' => $slide->image_path,
                'imageAlt' => $slide->image_alt ?? '',
                'imagePosition' => $slide->image_position,
                'primaryLabel' => $slide->primary_label,
                'primaryUrl' => $slide->primary_url,
                'secondaryLabel' => $slide->secondary_label ?? '',
                'secondaryUrl' => $slide->secondary_url ?? '',
                'sortOrder' => $slide->sort_order,
                'isActive' => $slide->is_active,
            ]),
        ]);
    }

    public function store(Request $request, WebImageStorage $images): RedirectResponse
    {
        $validated = $this->validated($request, true);
        $path = $images->store($request->file('image'), 'hero-slides', 2200);
        unset($validated['image']);
        HeroSlide::query()->create($validated + ['image_path' => '/storage/'.$path]);

        return back()->with('success', 'Hero slide created.');
    }

    public function update(Request $request, HeroSlide $slide, WebImageStorage $images): RedirectResponse
    {
        $validated = $this->validated($request, false);
        if ($request->hasFile('image')) {
            $oldPath = $slide->image_path;
            $path = $images->store($request->file('image'), 'hero-slides', 2200);
            $validated['image_path'] = '/storage/'.$path;
            if (str_starts_with($oldPath, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldPath));
            }
        }
        unset($validated['image']);
        $slide->update($validated);

        return back()->with('success', 'Hero slide updated.');
    }

    public function destroy(HeroSlide $slide): RedirectResponse
    {
        abort_if(HeroSlide::query()->count() <= 1, 422, 'At least one hero slide is required.');
        if (str_starts_with($slide->image_path, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $slide->image_path));
        }
        $slide->delete();

        return back()->with('success', 'Hero slide removed.');
    }

    private function validated(Request $request, bool $imageRequired): array
    {
        $validated = $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:500'],
            'image_alt' => ['nullable', 'string', 'max:180'],
            'image_position' => ['nullable', 'in:center,left,right,top,bottom'],
            'primary_label' => ['required', 'string', 'max:60'],
            'primary_url' => ['required', 'string', 'max:500'],
            'secondary_label' => ['nullable', 'string', 'max:60'],
            'secondary_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:999'],
            'is_active' => ['required', 'boolean'],
            'image' => [$imageRequired ? 'required' : 'nullable', 'image', 'mimes:jpeg,png,webp', 'max:8192'],
        ]);

        $validated['image_position'] ??= 'center';

        return $validated;
    }
}
