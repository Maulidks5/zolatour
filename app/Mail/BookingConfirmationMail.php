<?php

namespace App\Mail;

use App\Models\Booking;
use App\Support\BookingVoucher;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $voucherUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Booking confirmed — {$this->booking->reference}");
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.booking-confirmation');
    }

    public function attachments(): array
    {
        $voucher = app(BookingVoucher::class);

        return [Attachment::fromData(
            fn (): string => $voucher->pdf($this->booking),
            $voucher->filename($this->booking),
        )->withMime('application/pdf')];
    }
}
