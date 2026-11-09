<x-mail::message>
# Your transfer is confirmed

Hello {{ $booking->full_name }},

Your private transfer with **Zola Tours & Safaris** is confirmed.

**Reference:** {{ $booking->reference }}  
**Route:** {{ $booking->pickup_location }} → {{ $booking->destination }}  
**Travel date:** {{ $booking->travel_date->format('F j, Y') }}  
**Passengers:** {{ $booking->passengers }}  
**Vehicle:** {{ str($booking->vehicle_category)->replace('-', ' ')->title() }}  
**Total due on arrival:** {{ $booking->estimated_currency ?? 'USD' }} {{ number_format((float) $booking->estimated_price, 2) }}

Your transfer voucher is attached. Keep it on your phone and present it to the driver. Payment is due on arrival.

<x-mail::button :url="$voucherUrl">
Open transfer voucher
</x-mail::button>

Thanks,<br>
Zola Tours & Safaris
</x-mail::message>
