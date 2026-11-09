<?php

namespace App\Http\Controllers;

use App\Models\ContactInquiry;
use App\Mail\NewWebsiteSubmission;
use App\Support\SendsSubmissionEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContactInquiryController extends Controller
{
    use SendsSubmissionEmail;
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'required_if:preferred_contact,whatsapp', 'string', 'min:7', 'max:40', 'regex:/^[0-9+()\\-\\s]+$/'],
            'preferred_contact' => ['required', 'in:email,whatsapp'],
            'topic' => ['required', 'in:tour,safari,transport,booking,partnership,other'],
            'subject' => ['nullable', 'string', 'max:190'],
            'message' => ['required', 'string', 'max:5000'],
            'consent' => ['accepted'],
            'website' => ['nullable', 'max:0'],
        ]);

        unset($validated['website'], $validated['consent']);
        $reference = 'MSG-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        $topicLabel = str($validated['topic'])->replace('-', ' ')->title()->toString();
        $inquiry = ContactInquiry::query()->create($validated + [
            'reference' => $reference, 'source' => 'contact',
            'subject' => $validated['subject'] ?: $topicLabel.' inquiry', 'status' => 'new',
        ]);

        $this->sendSubmissionEmail(new NewWebsiteSubmission(
            heading: 'New Contact Message', reference: $inquiry->reference,
            details: ['Topic' => $topicLabel, 'Name' => $inquiry->name, 'Email' => $inquiry->email, 'Phone / WhatsApp' => $inquiry->phone, 'Preferred contact' => $inquiry->preferred_contact, 'Subject' => $inquiry->subject, 'Message' => $inquiry->message],
            replyToAddress: $inquiry->email, replyToName: $inquiry->name,
        ));

        return back()->with(['success' => 'Thank you. Your message has been sent to our team.', 'contactRequest' => ['reference' => $reference, 'topic' => $topicLabel, 'phone' => $validated['phone'] ?? null]]);
    }
}
