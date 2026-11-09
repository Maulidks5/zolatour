<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Faqs/Index', [
            'faqs' => Faq::query()->orderBy('sort_order')->orderBy('id')->get()->map(fn (Faq $faq): array => [
                'id' => $faq->id, 'category' => $faq->category, 'question' => $faq->question,
                'answer' => $faq->answer, 'sortOrder' => $faq->sort_order, 'isActive' => $faq->is_active,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Faq::query()->create($this->validated($request));

        return back()->with('success', 'FAQ added.');
    }

    public function update(Request $request, Faq $faq): RedirectResponse
    {
        $faq->update($this->validated($request));

        return back()->with('success', 'FAQ updated.');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();

        return back()->with('success', 'FAQ removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'category' => ['required', 'string', 'max:80'],
            'question' => ['required', 'string', 'max:220'],
            'answer' => ['required', 'string', 'max:3000'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
