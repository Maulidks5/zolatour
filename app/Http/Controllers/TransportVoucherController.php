<?php

namespace App\Http\Controllers;

use App\Models\TransportRequest;
use App\Support\TransportVoucher;
use Illuminate\Http\Response;

class TransportVoucherController extends Controller
{
    public function __invoke(TransportRequest $transportRequest, TransportVoucher $voucher): Response
    {
        abort_unless($transportRequest->estimated_price !== null, 404);

        return response($voucher->pdf($transportRequest), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$voucher->filename($transportRequest).'"',
        ]);
    }
}
