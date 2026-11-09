<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Support\WebImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SiteMediaController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Cms/Media', [
            'media' => SiteSetting::query()
                ->where('group', 'media')
                ->pluck('value', 'key'),
        ]);
    }

    public function update(Request $request, WebImageStorage $images): RedirectResponse
    {
        $validated = $request->validate([
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'cta_image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:8192'],
            'about_image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:8192'],
        ]);

        $mapping = [
            'logo' => ['logo_path', 900],
            'cta_image' => ['cta_image_path', 2200],
            'about_image' => ['about_image_path', 1800],
        ];

        foreach ($mapping as $field => [$key, $width]) {
            if (! $request->hasFile($field)) {
                continue;
            }

            $setting = SiteSetting::query()->where('key', $key)->firstOrFail();
            $oldPath = $setting->value;
            $path = $images->store($request->file($field), 'site', $width);
            $setting->update(['value' => '/storage/'.$path]);

            if ($oldPath && str_starts_with($oldPath, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldPath));
            }
        }

        SiteSetting::forgetCache();

        return back()->with('success', 'Website media updated.');
    }
}
