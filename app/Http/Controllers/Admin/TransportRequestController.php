<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransportRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransportRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $search = trim($request->string('search')->toString());
        $archived = $request->boolean('archived');

        return Inertia::render('Admin/Transport/Index', [
            'stats' => [
                'new' => TransportRequest::where('status', 'new')->count(),
                'quoted' => TransportRequest::where('status', 'quoted')->count(),
                'confirmed' => TransportRequest::where('status', 'confirmed')->count(),
                'completed' => TransportRequest::where('status', 'completed')->count(),
            ],
            'requests' => TransportRequest::query()
                ->when($archived, fn ($query) => $query->onlyTrashed())
                ->when($status, fn ($query) => $query->where('status', $status))
                ->when($search, fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('reference', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('pickup_location', 'like', "%{$search}%")
                        ->orWhere('destination', 'like', "%{$search}%");
                }))
                ->latest()->paginate(20)->withQueryString()->through(fn (TransportRequest $item): array => [
                'reference' => $item->reference,
                'fullName' => $item->full_name,
                'phone' => $item->phone,
                'email' => $item->email,
                'tripType' => str($item->trip_type)->replace('-', ' ')->title()->toString(),
                'hireDuration' => $item->hire_duration ? str($item->hire_duration)->replace('-', ' ')->title()->toString() : null,
                'serviceType' => str($item->service_type)->replace('-', ' ')->title()->toString(),
                'pickup' => $item->pickup_location,
                'destination' => $item->destination,
                'travelDate' => $item->travel_date->format('M j, Y'),
                'returnDate' => $item->return_date?->format('M j, Y'),
                'returnTime' => $item->return_time ? substr($item->return_time, 0, 5) : null,
                'pickupTime' => $item->pickup_time ? substr($item->pickup_time, 0, 5) : null,
                'passengers' => $item->passengers, 'requestedVehicle' => $item->vehicle_category, 'luggage' => $item->luggage, 'childSeats' => $item->child_seats, 'airportDirection' => $item->airport_direction, 'airline' => $item->airline,
                'flightNumber' => $item->flight_number,
                'notes' => $item->notes,
                'estimatedPrice' => $item->estimated_price !== null ? (float) $item->estimated_price : null,
                'estimatedCurrency' => $item->estimated_currency,
                'priceBreakdown' => $item->price_breakdown,
                'quoteAmount' => $item->quote_amount,
                'quoteCurrency' => $item->quote_currency,
                'vehicleType' => $item->vehicle_type,
                'vehicleCapacity' => $item->vehicle_capacity,
                'quoteValidHours' => $item->quote_valid_hours,
                'quoteInclusions' => $item->quote_inclusions,
                'quoteNotes' => $item->quote_notes,
                'quotedAt' => $item->quoted_at?->format('M j, Y H:i'),
                'status' => $item->status,
                'createdAt' => $item->created_at->format('M j, Y H:i'),
            ]),
            'activeStatus' => $status ?: null,
            'filters' => ['search' => $search, 'archived' => $archived],
            'statuses' => ['new', 'quoted', 'accepted', 'confirmed', 'completed', 'cancelled'],
            'canPermanentlyDelete' => $request->user()?->role === 'super_admin',
        ]);
    }

    public function show(TransportRequest $transportRequest): Response
    {
        return Inertia::render('Admin/Transport/Show', [
            'request' => [
                'reference' => $transportRequest->reference, 'fullName' => $transportRequest->full_name,
                'phone' => $transportRequest->phone, 'email' => $transportRequest->email,
                'serviceType' => str($transportRequest->service_type)->replace('-', ' ')->title()->toString(),
                'tripType' => str($transportRequest->trip_type)->replace('-', ' ')->title()->toString(),
                'hireDuration' => $transportRequest->hire_duration ? str($transportRequest->hire_duration)->replace('-', ' ')->title()->toString() : null,
                'pickup' => $transportRequest->pickup_location, 'destination' => $transportRequest->destination,
                'travelDate' => $transportRequest->travel_date->format('F j, Y'),
                'pickupTime' => $transportRequest->pickup_time ? substr($transportRequest->pickup_time, 0, 5) : null,
                'returnDate' => $transportRequest->return_date?->format('F j, Y'),
                'returnTime' => $transportRequest->return_time ? substr($transportRequest->return_time, 0, 5) : null,
                'passengers' => $transportRequest->passengers, 'luggage' => $transportRequest->luggage,
                'childSeats' => $transportRequest->child_seats, 'requestedVehicle' => $transportRequest->vehicle_category,
                'airportDirection' => $transportRequest->airport_direction, 'flightNumber' => $transportRequest->flight_number,
                'notes' => $transportRequest->notes, 'estimatedPrice' => $transportRequest->estimated_price !== null ? (float) $transportRequest->estimated_price : null,
                'estimatedCurrency' => $transportRequest->estimated_currency, 'status' => $transportRequest->status,
                'quoteAmount' => $transportRequest->quote_amount, 'quoteCurrency' => $transportRequest->quote_currency,
                'vehicleType' => $transportRequest->vehicle_type, 'vehicleCapacity' => $transportRequest->vehicle_capacity,
                'quoteValidHours' => $transportRequest->quote_valid_hours, 'quoteInclusions' => $transportRequest->quote_inclusions,
                'quoteNotes' => $transportRequest->quote_notes, 'quotedAt' => $transportRequest->quoted_at?->format('F j, Y \a\t H:i'),
                'createdAt' => $transportRequest->created_at->format('F j, Y \a\t H:i'),
            ],
            'statuses' => ['new', 'quoted', 'accepted', 'confirmed', 'completed', 'cancelled'],
        ]);
    }

    public function update(Request $request, TransportRequest $transportRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['new', 'quoted', 'accepted', 'confirmed', 'completed', 'cancelled'])],
            'quote_amount' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'quote_currency' => ['nullable', Rule::in(['USD', 'TZS', 'EUR', 'GBP'])],
            'vehicle_type' => ['nullable', 'string', 'max:120'],
            'vehicle_capacity' => ['nullable', 'integer', 'min:1', 'max:100'],
            'quote_valid_hours' => ['nullable', 'integer', 'min:1', 'max:720'],
            'quote_inclusions' => ['nullable', 'string', 'max:1000'],
            'quote_notes' => ['nullable', 'string', 'max:1000'],
        ]);
        $isQuote = filled($validated['quote_amount'] ?? null);
        if ($isQuote && $validated['status'] === 'new') $validated['status'] = 'quoted';
        $transportRequest->update($validated + [
            'quoted_at' => $isQuote ? now() : $transportRequest->quoted_at,
            'read_at' => $validated['status'] !== 'new' ? ($transportRequest->read_at ?? now()) : null,
        ]);
        return back()->with('success', "Transport request {$transportRequest->reference} updated.");
    }

    public function destroy(TransportRequest $transportRequest): RedirectResponse
    {
        $reference = $transportRequest->reference;
        $transportRequest->delete();
        return redirect()->route('admin.transport-requests.index')->with('success', "Transport request {$reference} archived.");
    }

    public function restore(string $reference): RedirectResponse
    {
        TransportRequest::onlyTrashed()->where('reference', $reference)->firstOrFail()->restore();
        return back()->with('success', "Transport request {$reference} restored.");
    }

    public function forceDestroy(Request $request, string $reference): RedirectResponse
    {
        abort_unless($request->user()?->role === 'super_admin', 403);
        TransportRequest::onlyTrashed()->where('reference', $reference)->firstOrFail()->forceDelete();
        return back()->with('success', "Transport request {$reference} permanently deleted.");
    }
}
