<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use App\Models\TransportRequest;
use App\Models\TransportRoute;
use App\Mail\TransportConfirmationMail;
use App\Mail\NewWebsiteSubmission;
use App\Support\SendsSubmissionEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TransportController extends Controller
{
    use SendsSubmissionEmail;
    public function index(): Response
    {
        return Inertia::render('Transport', [
            'submittedRequest' => session('transport_request'),
            'tourDestinations' => Tour::query()
                ->published()
                ->orderBy('sort_order')
                ->orderBy('title')
                ->get(['title', 'location'])
                ->map(fn (Tour $tour): array => [
                    'title' => $tour->title,
                    'location' => $tour->location,
                ])
                ->values(),
            'pricedRoutes' => TransportRoute::query()->where('is_active', true)->orderBy('sort_order')->get()->map(fn (TransportRoute $route): array => [
                'id' => $route->id, 'pickup' => $route->pickup_location, 'destination' => $route->destination,
                'currency' => $route->currency, 'prices' => ['sedan'=>$route->priceFor('sedan'), 'suv-minivan'=>$route->priceFor('suv-minivan'), 'van'=>$route->priceFor('van'), 'minibus'=>$route->priceFor('minibus')],
                'returnDiscount' => (float) $route->return_discount_percent, 'nightSurcharge' => (float) $route->night_surcharge,
                'nightStart' => substr($route->night_start, 0, 5), 'nightEnd' => substr($route->night_end, 0, 5),
                'childSeatFee' => (float) $route->child_seat_fee, 'bidirectional' => $route->is_bidirectional,
            ])->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'min:7', 'max:40', 'regex:/^[0-9+()\\-\\s]+$/'],
            'email' => ['nullable', 'email', 'max:190'],
            'service_type' => ['required', 'in:airport-transfer,hotel-transfer,tour-transfer,private-driver,full-day-hire,group-transport,custom-transfer'],
            'trip_type' => ['required', 'in:one-way,return,hourly-hire,full-day-hire'],
            'hire_duration' => ['nullable', 'required_if:trip_type,hourly-hire', 'in:4-hours,8-hours,12-hours'],
            'pickup_location' => ['required', 'string', 'max:190'],
            'destination' => ['required', 'string', 'max:190'],
            'travel_date' => ['required', 'date', 'after_or_equal:today'],
            'pickup_time' => ['nullable', 'date_format:H:i'],
            'return_date' => ['nullable', 'required_if:trip_type,return', 'date', 'after_or_equal:travel_date'],
            'return_time' => ['nullable', 'date_format:H:i'],
            'passengers' => ['required', 'integer', 'min:1', 'max:100'],
            'luggage' => ['required', 'integer', 'min:0', 'max:100'],
            'child_seats' => ['required', 'integer', 'min:0', 'max:20'],
            'airport_direction' => ['nullable', 'required_if:service_type,airport-transfer', 'in:arrival,departure'],
            'airline' => ['nullable', 'string', 'max:120'],
            'flight_number' => ['nullable', 'string', 'max:60'],
            'vehicle_category' => ['required', 'in:sedan,suv-minivan,van,minibus'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'consent' => ['accepted'],
            'website' => ['nullable', 'max:0'],
        ]);

        unset($validated['website'], $validated['consent']);
        [$route, $estimate, $breakdown] = $this->estimate($validated);
        $transport = TransportRequest::query()->create($validated + [
            'reference' => 'TRN-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
            'transport_route_id' => $route?->id,
            'estimated_price' => $estimate,
            'estimated_currency' => $estimate !== null ? $route?->currency : null,
            'price_breakdown' => $breakdown,
            'quote_amount' => $estimate,
            'quote_currency' => $estimate !== null ? $route?->currency : 'USD',
            'vehicle_type' => str($validated['vehicle_category'])->replace('-', ' ')->title()->toString(),
            'vehicle_capacity' => match ($validated['vehicle_category']) { 'sedan' => 3, 'suv-minivan' => 6, 'van' => 14, 'minibus' => 28 },
            'quote_inclusions' => $estimate !== null ? 'Private vehicle, professional driver, fuel and luggage assistance' : null,
            'quoted_at' => $estimate !== null ? now() : null,
            'status' => $estimate !== null ? 'confirmed' : 'new',
        ]);

        $this->sendSubmissionEmail(new NewWebsiteSubmission(
            heading: 'New Transport Request', reference: $transport->reference,
            details: ['Customer' => $transport->full_name, 'Email' => $transport->email, 'Phone / WhatsApp' => $transport->phone, 'Service' => str($transport->service_type)->replace('-', ' ')->title()->toString(), 'Trip type' => str($transport->trip_type)->replace('-', ' ')->title()->toString(), 'Hire duration' => $transport->hire_duration ? str($transport->hire_duration)->replace('-', ' ')->title()->toString() : null, 'Route' => $transport->pickup_location.' → '.$transport->destination, 'Travel date' => $transport->travel_date->format('F j, Y'), 'Pickup time' => $transport->pickup_time, 'Return date' => $transport->return_date?->format('F j, Y'), 'Passengers' => $transport->passengers, 'Estimated price' => $transport->estimated_price ? $transport->estimated_currency.' '.$transport->estimated_price : 'Custom quote required', 'Vehicle' => str($transport->vehicle_category)->replace('-', ' ')->title()->toString(), 'Flight' => trim(($transport->airline ?? '').' '.($transport->flight_number ?? '')), 'Notes' => $transport->notes],
            replyToAddress: $transport->email, replyToName: $transport->full_name,
        ));

        if ($estimate !== null) {
            $successUrl = URL::temporarySignedRoute('transport.success', now()->addMonths(6), ['transportRequest' => $transport]);
            $voucherUrl = URL::temporarySignedRoute('transport.voucher', now()->addMonths(6), ['transportRequest' => $transport]);

            if ($transport->email) {
                try {
                    Mail::to($transport->email)->queue(new TransportConfirmationMail($transport, $voucherUrl));
                } catch (Throwable $exception) {
                    Log::error('Transport confirmation email could not be sent.', ['reference' => $transport->reference, 'exception' => $exception]);
                }
            }

            return redirect()->to($successUrl);
        }

        return back()->with('success', "Transport request {$transport->reference} received. Our team will contact you with a price shortly.")
            ->with('transport_request', [
                'reference' => $transport->reference,
                'route' => "{$transport->pickup_location} → {$transport->destination}",
                'date' => $transport->travel_date->format('F j, Y'),
                'passengers' => $transport->passengers,
                'estimatedPrice' => $transport->estimated_price !== null ? (float) $transport->estimated_price : null,
                'estimatedCurrency' => $transport->estimated_currency,
            ]);
    }

    public function success(TransportRequest $transportRequest): Response
    {
        abort_unless($transportRequest->estimated_price !== null, 404);

        return Inertia::render('TransportSuccess', [
            'booking' => [
                'reference' => $transportRequest->reference,
                'route' => $transportRequest->pickup_location.' → '.$transportRequest->destination,
                'travelDate' => $transportRequest->travel_date->format('F j, Y'),
                'pickupTime' => $transportRequest->pickup_time ? substr($transportRequest->pickup_time, 0, 5) : null,
                'returnDate' => $transportRequest->return_date?->format('F j, Y'),
                'passengers' => $transportRequest->passengers,
                'luggage' => $transportRequest->luggage,
                'vehicle' => str($transportRequest->vehicle_category)->replace('-', ' ')->title()->toString(),
                'price' => (float) $transportRequest->estimated_price,
                'currency' => $transportRequest->estimated_currency ?? 'USD',
                'voucherUrl' => URL::temporarySignedRoute('transport.voucher', now()->addMonths(6), ['transportRequest' => $transportRequest]),
            ],
        ]);
    }

    private function estimate(array $data): array
    {
        if (! in_array($data['trip_type'], ['one-way', 'return'], true)) return [null, null, null];

        $routes = TransportRoute::query()->where('is_active', true)->get();
        $route = $routes->first(function (TransportRoute $route) use ($data): bool {
            $forward = $this->locationMatches($route->pickup_location, $data['pickup_location']) && $this->locationMatches($route->destination, $data['destination']);
            $reverse = $route->is_bidirectional && $this->locationMatches($route->pickup_location, $data['destination']) && $this->locationMatches($route->destination, $data['pickup_location']);
            return $forward || $reverse;
        });
        if (! $route || ($base = $route->priceFor($data['vehicle_category'])) === null) return [$route, null, null];

        $journeys = $data['trip_type'] === 'return' ? 2 : 1;
        $subtotal = $base * $journeys;
        $discount = $data['trip_type'] === 'return' ? $subtotal * ((float) $route->return_discount_percent / 100) : 0;
        $nightTrips = $this->isNight($data['pickup_time'] ?? null, $route) ? 1 : 0;
        if ($data['trip_type'] === 'return' && $this->isNight($data['return_time'] ?? null, $route)) $nightTrips++;
        $night = (float) $route->night_surcharge * $nightTrips;
        $childSeats = (float) $route->child_seat_fee * (int) $data['child_seats'];
        $total = round($subtotal - $discount + $night + $childSeats, 2);

        return [$route, $total, ['base_price'=>$base, 'journeys'=>$journeys, 'return_discount'=>$discount, 'night_surcharge'=>$night, 'child_seat_fee'=>$childSeats]];
    }

    private function locationMatches(string $configured, string $requested): bool
    {
        $requested = str($requested)->lower()->squish()->toString();
        $configuredName = str($configured)->lower()->squish()->toString();
        return $configuredName === $requested || collect(explode('/', $configured))->map(fn ($part) => str($part)->lower()->squish()->toString())->contains($requested);
    }

    private function isNight(?string $time, TransportRoute $route): bool
    {
        if (! $time || (float) $route->night_surcharge <= 0) return false;
        $time = substr($time, 0, 5); $start = substr($route->night_start, 0, 5); $end = substr($route->night_end, 0, 5);
        return $start > $end ? ($time >= $start || $time < $end) : ($time >= $start && $time < $end);
    }

}
