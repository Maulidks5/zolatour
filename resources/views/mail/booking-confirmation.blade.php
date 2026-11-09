<x-mail::message>
# Your booking is confirmed

Hello {{ $booking->full_name }},

Thank you for booking **{{ $booking->tour->title }}** with Zola Tours & Safaris.

**Booking reference:** {{ $booking->reference }}  
**Travel date:** {{ $booking->travel_date->format('F j, Y') }}  
**Guests:** {{ $booking->adults }} adult(s), {{ $booking->children }} child(ren)  
**Total due on arrival:** {{ $booking->quoted_currency ?? $booking->estimated_currency ?? 'USD' }} {{ number_format((float) ($booking->quoted_price ?? $booking->estimated_price), 2) }}

Your Payment Voucher is attached. Please keep it on your phone or print it and present it when you arrive. This voucher confirms the service and amount due; it is not proof of payment.

<x-mail::button :url="$voucherUrl">
Open payment voucher
</x-mail::button>

Hotel transfer is excluded unless it is specifically written in your confirmed booking.

Thanks,<br>
Zola Tours & Safaris
</x-mail::message>
