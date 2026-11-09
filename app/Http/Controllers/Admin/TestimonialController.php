<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Models\Tour;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $archived = $request->boolean('archived');

        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => Testimonial::query()
                ->when($archived, fn ($query) => $query->onlyTrashed())
                ->when(in_array($status, ['pending', 'approved', 'rejected'], true), fn ($query) => $query->where('status', $status))
                ->latest()
                ->paginate(20)
                ->withQueryString()
                ->through(fn (Testimonial $item): array => [
                    'reference' => $item->reference, 'name' => $item->name, 'email' => $item->email,
                    'country' => $item->country, 'tourName' => $item->tour_name, 'rating' => $item->rating,
                    'content' => $item->content, 'status' => $item->status, 'isFeatured' => $item->is_featured,
                    'createdAt' => $item->created_at->format('M j, Y H:i'),
                ]),
            'activeStatus' => $status,
            'archived' => $archived,
            'canPermanentlyDelete' => $request->user()?->role === 'super_admin',
        ]);
    }

    public function update(Request $request, Testimonial $testimonial): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'is_featured' => ['required', 'boolean'],
        ]);
        $testimonial->update($validated + [
            'approved_at' => $validated['status'] === 'approved' ? ($testimonial->approved_at ?? now()) : null,
        ]);
        $this->refreshTourRating($testimonial->tour_id);

        return back()->with('success', "Review {$testimonial->reference} updated.");
    }

    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $reference = $testimonial->reference;
        $tourId = $testimonial->tour_id;
        $testimonial->delete();
        $this->refreshTourRating($tourId);

        return back()->with('success', "Review {$reference} archived.");
    }

    public function restore(string $reference): RedirectResponse
    {
        $testimonial = Testimonial::onlyTrashed()->where('reference', $reference)->firstOrFail();
        $testimonial->restore();
        $this->refreshTourRating($testimonial->tour_id);

        return back()->with('success', "Review {$reference} restored.");
    }

    public function forceDestroy(Request $request, string $reference): RedirectResponse
    {
        abort_unless($request->user()?->role === 'super_admin', 403);
        $testimonial = Testimonial::onlyTrashed()->where('reference', $reference)->firstOrFail();
        $tourId = $testimonial->tour_id;
        $testimonial->forceDelete();
        $this->refreshTourRating($tourId);

        return back()->with('success', "Review {$reference} permanently deleted.");
    }

    private function refreshTourRating(?int $tourId): void
    {
        if (! $tourId || ! ($tour = Tour::query()->find($tourId))) return;
        $reviews = Testimonial::query()->where('tour_id', $tourId)->where('status', 'approved');
        $tour->update(['rating' => round((float) ($reviews->avg('rating') ?? 0), 1), 'reviews_count' => $reviews->count()]);
    }
}
