<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Testimonial;
use App\Models\Tour;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function create(Request $request): Response
    {
        $booking = null;

        if ($request->filled('booking')) {
            abort_unless($request->hasValidSignature(), 403);
            $booking = Booking::query()
                ->with('tour:id,title')
                ->where('reference', $request->string('booking')->toString())
                ->where('status', 'completed')
                ->firstOrFail();
        }

        return Inertia::render('Feedback', [
            'prefill' => $booking ? [
                'name' => $booking->full_name,
                'email' => $booking->email ?? '',
                'tourName' => $booking->tour->title,
                'tourId' => $booking->tour->id,
                'bookingReference' => $booking->reference,
                'alreadySubmitted' => $booking->testimonial()->exists(),
            ] : null,
            'tours' => Tour::query()->published()->orderBy('experience_type')->orderBy('title')->get(['id', 'title', 'experience_type'])->map(fn (Tour $tour): array => [
                'id' => $tour->id, 'title' => $tour->title, 'type' => $tour->experience_type === 'safari' ? 'Tanzania Safari' : 'Zanzibar Tour',
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $booking = null;
        if ($request->filled('booking_reference')) {
            abort_unless($request->hasValidSignature(), 403);
            $booking = Booking::query()
                ->where('reference', $request->string('booking_reference')->toString())
                ->where('status', 'completed')
                ->firstOrFail();

            if ($booking->testimonial()->exists()) {
                return back()->withErrors(['content' => 'Feedback has already been submitted for this booking.']);
            }
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'country' => ['nullable', 'string', 'max:100'],
            'tour_name' => ['nullable', 'string', 'max:150'],
            'tour_id' => ['nullable', 'integer', 'exists:tours,id'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'content' => ['required', 'string', 'min:20', 'max:1500'],
            'website' => ['nullable', 'max:0'],
            'booking_reference' => ['nullable', 'string', 'max:24'],
        ]);

        unset($validated['website']);
        unset($validated['booking_reference']);
        $tour = $booking?->tour ?? (! empty($validated['tour_id']) ? Tour::query()->find($validated['tour_id']) : null);
        $validated['tour_id'] = $tour?->id;
        $validated['tour_name'] = $tour?->title ?? ($validated['tour_name'] ?? null);
        Testimonial::query()->create($validated + [
            'booking_id' => $booking?->id,
            'reference' => 'REV-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
            'status' => 'pending',
        ]);

        return back()->with('success', 'Thank you. Your feedback was received and will be reviewed before publishing.');
    }
}
