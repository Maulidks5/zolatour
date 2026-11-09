<?php

namespace App\Mail;

use App\Models\TransportRequest;
use App\Support\TransportVoucher;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TransportConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public TransportRequest $booking, public string $voucherUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Transfer confirmed — {$this->booking->reference}");
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.transport-confirmation');
    }

    public function attachments(): array
    {
        $voucher = app(TransportVoucher::class);

        return [Attachment::fromData(fn (): string => $voucher->pdf($this->booking), $voucher->filename($this->booking))->withMime('application/pdf')];
    }
}
