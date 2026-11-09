<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Support\BookingVoucher;
use Symfony\Component\HttpFoundation\Response;

class BookingVoucherController extends Controller
{
    public function __invoke(Booking $booking, BookingVoucher $voucher): Response
    {
        abort_unless($booking->estimated_price !== null || $booking->quoted_price !== null, 404);

        return response($voucher->pdf($booking), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$voucher->filename($booking).'"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
