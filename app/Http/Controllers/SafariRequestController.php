<?php

namespace App\Http\Controllers;

use App\Mail\BookingConfirmationMail;
use App\Mail\NewWebsiteSubmission;
use App\Models\Booking;
use App\Models\Tour;
use App\Support\SendsSubmissionEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SafariRequestController extends Controller
{
    use SendsSubmissionEmail;

    public function create(Request $request, Tour $tour): Response
    {
        abort_unless($tour->is_published && $tour->experience_type === 'safari', 404);

        return Inertia::render('Safaris/Request', [
            'tour' => [
                'slug' => $tour->slug,
                'title' => $tour->title,
                'duration' => $tour->duration,
                'days' => max(1, (int) $tour->duration),
                'location' => $tour->location,
                'price' => (float) ($tour->shared_adult_price ?? $tour->price),
                'groupPrice' => $tour->shared_group_adult_price !== null ? (float) $tour->shared_group_adult_price : null,
                'childPrice' => (float) ($tour->shared_child_price ?? round($tour->price * .7, 2)),
                'currency' => $tour->currency,
                'image' => $tour->cover_image_path,
                'parks' => match ($tour->slug) {
                    'mikumi-day-safari-from-zanzibar' => ['Mikumi'],
                    'nyerere-two-day-safari' => ['Nyerere'],
                    'tarangire-day-safari' => ['Tarangire'],
                    'ngorongoro-crater-day-safari' => ['Ngorongoro'],
                    'serengeti-ngorongoro-four-day-safari' => ['Serengeti', 'Ngorongoro'],
                    default => ['Tarangire', 'Serengeti', 'Ngorongoro'],
                },
            ],
            'defaults' => [
                'date' => $request->string('date')->toString(),
                'adults' => max(1, $request->integer('adults', 2)),
                'children' => max(0, $request->integer('children', 0)),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'tour_slug' => ['required', 'string', Rule::exists('tours', 'slug')->where('experience_type', 'safari')],
            'name' => ['required', 'string', 'max:120'],
            'preferred_contact' => ['required', Rule::in(['whatsapp', 'email'])],
            'email' => ['nullable', 'required_if:preferred_contact,email', 'email', 'max:190'],
            'whatsapp' => ['required', 'string', 'min:7', 'max:40', 'regex:/^[0-9+()\-\s]+$/'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'days' => ['required', 'integer', 'min:1', 'max:30'],
            'adults' => ['required', 'integer', 'min:1', 'max:30'],
            'children' => ['required', 'integer', 'min:0', 'max:20'],
            'parks' => ['required', 'array', 'min:1'],
            'parks.*' => ['string', Rule::in(['Mikumi', 'Nyerere', 'Serengeti', 'Ngorongoro', 'Tarangire', 'Lake Manyara', 'Not sure'])],
            'accommodation' => ['required', Rule::in(['Budget', 'Mid-range', 'Luxury', 'Not sure'])],
            'arrival_point' => ['required', Rule::in(['Zanzibar', 'Dar es Salaam', 'Arusha', 'Other', 'Not sure'])],
            'notes' => ['nullable', 'string', 'max:2000'],
            'consent' => ['accepted'],
            'website' => ['nullable', 'max:0'],
        ]);

        $tour = Tour::query()->published()->where('experience_type', 'safari')->where('slug', $data['tour_slug'])->firstOrFail();
        $adultPrice = (float) ($tour->shared_adult_price ?? $tour->price);
        if (($data['adults'] + $data['children']) >= 6 && $tour->shared_group_adult_price !== null) {
            $adultPrice = (float) $tour->shared_group_adult_price;
        }
        $childPrice = (float) ($tour->shared_child_price ?? round($adultPrice * .7, 2));
        $total = ($adultPrice * $data['adults']) + ($childPrice * $data['children']);
        $plan = implode("\n", array_filter([
            'Parks: '.implode(', ', $data['parks']),
            "Accommodation: {$data['accommodation']}",
            "Starting point: {$data['arrival_point']}",
            filled($data['notes'] ?? null) ? "Guest notes: {$data['notes']}" : null,
        ]));

        $booking = $tour->bookings()->create([
            'booking_type' => 'shared',
            'estimated_price' => $total,
            'estimated_currency' => $tour->currency,
            'reference' => $this->newReference(),
            'full_name' => trim($data['name']),
            'email' => filled($data['email'] ?? null) ? trim($data['email']) : null,
            'whatsapp' => trim($data['whatsapp']),
            'preferred_contact' => $data['preferred_contact'],
            'travel_date' => $data['start_date'],
            'adults' => $data['adults'],
            'children' => $data['children'],
            'children_ages' => [],
            'pickup_zone' => Str::snake($data['arrival_point']),
            'hotel' => "Accommodation: {$data['accommodation']}",
            'special_requests' => $plan,
            'status' => 'confirmed',
            'confirmed_at' => now(),
            'source' => 'website',
        ]);

        $voucherUrl = URL::temporarySignedRoute('bookings.voucher', now()->addMonths(6), ['booking' => $booking]);

        $this->sendSubmissionEmail(new NewWebsiteSubmission(
            heading: 'New Confirmed Safari Booking',
            reference: $booking->reference,
            details: [
                'Safari' => $tour->title,
                'Guest' => $booking->full_name,
                'Email' => $booking->email,
                'WhatsApp' => $booking->whatsapp,
                'Start date' => $data['start_date'],
                'Guests' => $data['adults'].' adult(s), '.$data['children'].' child(ren)',
                'Parks' => $data['parks'],
                'Accommodation' => $data['accommodation'],
                'Starting point' => $data['arrival_point'],
                'Total due on arrival' => $tour->currency.' '.number_format($total, 2),
            ],
            replyToAddress: $booking->email,
            replyToName: $booking->full_name,
        ));

        if ($booking->email) {
            try {
                Mail::to($booking->email)->queue(new BookingConfirmationMail($booking->load('tour'), $voucherUrl));
            } catch (Throwable $exception) {
                Log::error('Safari booking confirmation email could not be sent.', ['reference' => $booking->reference, 'exception' => $exception]);
            }
        }

        return redirect()->to(URL::temporarySignedRoute('bookings.success', now()->addDays(7), ['booking' => $booking]));
    }

    private function newReference(): string
    {
        do {
            $reference = 'SAF-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
        } while (Booking::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
