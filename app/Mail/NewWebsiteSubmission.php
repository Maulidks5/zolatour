<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewWebsiteSubmission extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $heading,
        public readonly string $reference,
        public readonly array $details,
        public readonly ?string $replyToAddress = null,
        public readonly ?string $replyToName = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: $this->replyToAddress ? [new Address($this->replyToAddress, $this->replyToName)] : [],
            subject: "{$this->heading} — {$this->reference}",
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.new-website-submission');
    }
}
