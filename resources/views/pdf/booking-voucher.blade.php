<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Booking Voucher {{ $booking->reference }}</title>
    <style>
        @page { margin: 30px; }
        body { font-family: DejaVu Sans, sans-serif; color: #102f3a; font-size: 12px; line-height: 1.5; }
        .header { background: #0b4c5f; color: white; padding: 24px; }
        .brand { font-size: 24px; font-weight: bold; }
        .tagline { color: #bfeaf1; margin-top: 3px; }
        .badge { float: right; background: #21b8c7; color: white; padding: 7px 12px; font-weight: bold; }
        .title { font-size: 22px; margin: 28px 0 4px; }
        .reference { color: #637882; }
        table { width: 100%; border-collapse: collapse; margin-top: 22px; }
        td { border-bottom: 1px solid #dce5e8; padding: 10px 8px; vertical-align: top; }
        td.label { width: 35%; color: #6b7f87; }
        td.value { font-weight: bold; }
        .total { margin-top: 24px; background: #eef8f9; border-left: 5px solid #21b8c7; padding: 18px; }
        .total-label { color: #60777f; font-size: 11px; text-transform: uppercase; }
        .amount { font-size: 28px; font-weight: bold; color: #0b4c5f; }
        .notice { margin-top: 24px; padding: 14px; border: 1px solid #dce5e8; color: #526a73; }
        .footer { margin-top: 38px; padding-top: 14px; border-top: 1px solid #dce5e8; color: #6b7f87; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <span class="badge">CONFIRMED</span>
        <div class="brand">ZOLA TOURS &amp; SAFARIS</div>
        <div class="tagline">Explore. Experience. Remember.</div>
    </div>

    <div class="title">Booking Confirmation &amp; Payment Voucher</div>
    <div class="reference">Voucher reference: {{ $booking->reference }}</div>

    <table>
        <tr><td class="label">Guest name</td><td class="value">{{ $booking->full_name }}</td></tr>
        <tr><td class="label">Service</td><td class="value">{{ $booking->tour->title }}</td></tr>
        <tr><td class="label">Travel date</td><td class="value">{{ $booking->travel_date->format('F j, Y') }}</td></tr>
        <tr><td class="label">Booking option</td><td class="value">{{ $booking->tour->experience_type === 'safari' ? 'Tanzania safari' : ucfirst($booking->booking_type).' tour' }}</td></tr>
        <tr><td class="label">Guests</td><td class="value">{{ $booking->adults }} adult(s), {{ $booking->children }} child(ren)@if($booking->children && $booking->children_ages) — ages {{ implode(', ', $booking->children_ages) }}@endif</td></tr>
        <tr><td class="label">Pickup area</td><td class="value">{{ str($booking->pickup_zone)->replace('_', ' ')->title() }}</td></tr>
        <tr><td class="label">Hotel / meeting point</td><td class="value">{{ $booking->hotel ?: 'To be confirmed' }}</td></tr>
        @if($booking->special_requests)<tr><td class="label">Special request</td><td class="value">{{ $booking->special_requests }}</td></tr>@endif
    </table>

    <div class="total">
        <div class="total-label">Total amount due on arrival</div>
        <div class="amount">{{ $currency }} {{ number_format((float) $total, 2) }}</div>
        <strong>Payment status: Unpaid — pay on arrival</strong>
    </div>

    <div class="notice">
        Present this voucher on arrival. This document confirms your booking and the amount due for the service shown above. It is not a receipt or proof of payment. Hotel transfer is excluded unless it is explicitly included in the booking details.
    </div>

    <div class="footer">
        Zola Tours &amp; Safaris · Zanzibar, Tanzania · +255 775 110 089<br>
        Generated {{ now()->format('F j, Y') }} · Keep your reference {{ $booking->reference }} when contacting our team.
    </div>
</body>
</html>
