<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $search = trim($request->string('search')->toString());
        $archived = $request->boolean('archived');

        return Inertia::render('Admin/Bookings/Index', [
            'stats' => [
                'pending' => Booking::where('status', 'pending')->count(),
                'confirmed' => Booking::where('status', 'confirmed')->count(),
                'upcoming' => Booking::whereDate('travel_date', '>=', today())
                    ->whereNotIn('status', ['completed', 'cancelled'])->count(),
                'completed' => Booking::where('status', 'completed')->count(),
            ],
            'bookings' => Booking::query()
                ->when($archived, fn ($query) => $query->onlyTrashed())
                ->with('tour:id,title')
                ->when($status, fn ($query) => $query->where('status', $status))
                ->when($search, fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('reference', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('whatsapp', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                }))
                ->latest()
                ->paginate(20)
                ->withQueryString()
                ->through(fn (Booking $booking): array => [
                    'reference' => $booking->reference,
                    'fullName' => $booking->full_name,
                    'whatsapp' => $booking->whatsapp,
                    'email' => $booking->email,
                    'tour' => $booking->tour->title,
                    'travelDate' => $booking->travel_date->format('M j, Y'),
                    'guests' => $booking->adults + $booking->children,
                    'hotel' => $booking->hotel,
                    'requests' => $booking->special_requests,
                    'status' => $booking->status,
                    'createdAt' => $booking->created_at->format('M j, Y H:i'),
                ]),
            'activeStatus' => $status ?: null,
            'filters' => ['search' => $search, 'archived' => $archived],
            'statuses' => ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'],
            'canPermanentlyDelete' => $request->user()?->role === 'super_admin',
        ]);
    }

    public function show(Booking $booking): Response
    {
        $booking->load('tour:id,title,slug,cover_image_path');

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => [
                'reference' => $booking->reference,
                'fullName' => $booking->full_name,
                'email' => $booking->email,
                'whatsapp' => $booking->whatsapp,
                'travelDate' => $booking->travel_date->format('F j, Y'),
                'adults' => $booking->adults,
                'children' => $booking->children,
                'childrenAges' => $booking->children_ages ?? [],
                'bookingType' => $booking->booking_type,
                'pickupZone' => $booking->pickup_zone,
                'preferredContact' => $booking->preferred_contact,
                'estimatedPrice' => $booking->estimated_price ? (float) $booking->estimated_price : null,
                'estimatedCurrency' => $booking->estimated_currency,
                'hotel' => $booking->hotel,
                'specialRequests' => $booking->special_requests,
                'adminNotes' => $booking->admin_notes,
                'status' => $booking->status,
                'quotedPrice' => $booking->quoted_price ? (float) $booking->quoted_price : null,
                'quotedCurrency' => $booking->quoted_currency,
                'source' => $booking->source,
                'createdAt' => $booking->created_at->format('F j, Y \a\t H:i'),
                'contactedAt' => $booking->contacted_at?->format('F j, Y \a\t H:i'),
                'confirmedAt' => $booking->confirmed_at?->format('F j, Y \a\t H:i'),
                'cancelledAt' => $booking->cancelled_at?->format('F j, Y \a\t H:i'),
                'feedbackUrl' => $booking->status === 'completed'
                    ? URL::signedRoute('feedback.create', ['booking' => $booking->reference])
                    : null,
                'voucherUrl' => ($booking->estimated_price !== null || $booking->quoted_price !== null)
                    ? URL::temporarySignedRoute('bookings.voucher', now()->addMonths(6), ['booking' => $booking])
                    : null,
                'tour' => [
                    'title' => $booking->tour->title,
                    'slug' => $booking->tour->slug,
                    'image' => $booking->tour->cover_image_path,
                ],
            ],
            'statuses' => ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'],
        ]);
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(['pending', 'contacted', 'confirmed', 'completed', 'cancelled'])],
            'admin_notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'quoted_price' => ['sometimes', 'nullable', 'numeric', 'min:1', 'max:99999999'],
            'quoted_currency' => ['sometimes', 'nullable', 'required_with:quoted_price', Rule::in(['USD', 'TZS', 'EUR', 'GBP'])],
        ]);

        if (isset($validated['status']) && $validated['status'] !== $booking->status) {
            $validated['contacted_at'] = $validated['status'] === 'contacted'
                ? ($booking->contacted_at ?? now())
                : $booking->contacted_at;
            $validated['confirmed_at'] = $validated['status'] === 'confirmed'
                ? ($booking->confirmed_at ?? now())
                : $booking->confirmed_at;
            $validated['cancelled_at'] = $validated['status'] === 'cancelled'
                ? ($booking->cancelled_at ?? now())
                : $booking->cancelled_at;
        }

        $booking->update($validated);

        return back()->with('success', "Booking {$booking->reference} updated.");
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        $reference = $booking->reference;
        $booking->delete();

        return redirect()->route('admin.bookings.index')->with('success', "Booking {$reference} archived.");
    }

    public function restore(string $reference): RedirectResponse
    {
        $booking = Booking::onlyTrashed()->where('reference', $reference)->firstOrFail();
        $booking->restore();

        return back()->with('success', "Booking {$reference} restored.");
    }

    public function forceDestroy(Request $request, string $reference): RedirectResponse
    {
        abort_unless($request->user()?->role === 'super_admin', 403);
        Booking::onlyTrashed()->where('reference', $reference)->firstOrFail()->forceDelete();

        return back()->with('success', "Booking {$reference} permanently deleted.");
    }
}
