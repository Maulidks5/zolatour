<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TourCategory;
use App\Support\WebImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TourCategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cms/Categories', [
            'categories' => TourCategory::query()
                ->withCount('tours')
                ->orderBy('sort_order')
                ->get()
                ->map(fn (TourCategory $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description ?? '',
                    'imagePath' => $category->image_path,
                    'sortOrder' => $category->sort_order,
                    'isActive' => $category->is_active,
                    'toursCount' => $category->tours_count,
                ]),
        ]);
    }

    public function store(Request $request, WebImageStorage $images): RedirectResponse
    {
        $validated = $this->validated($request);
        unset($validated['image']);
        $category = TourCategory::query()->create([
            ...$validated,
            'sort_order' => $validated['sort_order'] ?? (((int) TourCategory::query()->max('sort_order')) + 1),
            'is_active' => $request->boolean('is_active'),
        ]);

        if ($request->hasFile('image')) {
            $storedPath = $images->store($request->file('image'), "categories/{$category->id}", 1400);
            $category->update(['image_path' => '/storage/'.$storedPath]);
        }

        return back()->with('success', "Category {$category->name} created.");
    }

    public function update(Request $request, TourCategory $category, WebImageStorage $images): RedirectResponse
    {
        $validated = $this->validated($request, $category);

        if ($request->hasFile('image')) {
            $oldPath = $category->image_path;
            $storedPath = $images->store($request->file('image'), "categories/{$category->id}", 1400);
            $validated['image_path'] = '/storage/'.$storedPath;
            if ($oldPath && str_starts_with($oldPath, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldPath));
            }
        }

        unset($validated['image']);
        $category->update($validated);

        return back()->with('success', "Category {$category->name} updated.");
    }

    private function validated(Request $request, ?TourCategory $category = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'alpha_dash', 'max:140', Rule::unique('tour_categories', 'slug')->ignore($category)],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
        ]);
    }
}
