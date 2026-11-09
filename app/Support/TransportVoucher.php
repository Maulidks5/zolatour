<?php

namespace App\Support;

use App\Models\TransportRequest;
use Dompdf\Dompdf;
use Dompdf\Options;

class TransportVoucher
{
    public function pdf(TransportRequest $booking): string
    {
        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml(view('pdf.transport-voucher', ['booking' => $booking])->render());
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }

    public function filename(TransportRequest $booking): string
    {
        return "Zola-Transfer-Voucher-{$booking->reference}.pdf";
    }
}
