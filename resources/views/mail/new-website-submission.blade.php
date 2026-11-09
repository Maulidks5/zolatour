<x-mail::message>
# {{ $heading }}

A new request has been submitted through the Zola Tours & Safaris website.

**Reference:** {{ $reference }}

@foreach ($details as $label => $value)
**{{ $label }}:** {{ is_array($value) ? implode(', ', $value) : ($value ?: 'Not provided') }}

@endforeach

Please sign in to the admin dashboard to review and manage this request.

Thanks,<br>
{{ config('app.name') }} Website
</x-mail::message>
