<?php

namespace App\Support;

use App\Models\Booking;
use Dompdf\Dompdf;
use Dompdf\Options;

class BookingVoucher
{
    public function pdf(Booking $booking): string
    {
        $booking->loadMissing('tour');

        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml(view('pdf.booking-voucher', [
            'booking' => $booking,
            'total' => $booking->quoted_price ?? $booking->estimated_price,
            'currency' => $booking->quoted_currency ?? $booking->estimated_currency ?? 'USD',
        ])->render());
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }

    public function filename(Booking $booking): string
    {
        return "Zola-Voucher-{$booking->reference}.pdf";
    }
}
