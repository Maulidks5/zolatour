<?php

namespace App\Support;

use App\Mail\NewWebsiteSubmission;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

trait SendsSubmissionEmail
{
    private function sendSubmissionEmail(NewWebsiteSubmission $message): void
    {
        try {
            Mail::to(config('mail.admin_address'))->queue($message);
        } catch (Throwable $exception) {
            Log::error('Website submission email could not be sent.', [
                'reference' => $message->reference,
                'exception' => $exception,
            ]);
        }
    }
}
