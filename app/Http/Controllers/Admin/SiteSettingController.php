<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Cms/Settings', [
            'groups' => SiteSetting::query()
                ->where('group', '!=', 'media')
                ->orderBy('group')
                ->orderBy('sort_order')
                ->get(['group', 'key', 'label', 'type', 'value'])
                ->groupBy('group')
                ->map(fn ($settings) => $settings->values()),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $allowedKeys = SiteSetting::query()->pluck('key')->all();
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string', 'max:10000'],
        ]);

        foreach ($validated['settings'] as $key => $value) {
            abort_unless(in_array($key, $allowedKeys, true), 422);
            SiteSetting::query()->where('key', $key)->update(['value' => trim((string) $value)]);
        }

        SiteSetting::forgetCache();

        return back()->with('success', 'Website content settings saved.');
    }
}
