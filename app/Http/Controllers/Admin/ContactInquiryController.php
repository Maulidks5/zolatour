<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactInquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $source = $request->string('source')->toString();
        $archived = $request->boolean('archived');

        return Inertia::render('Admin/Inquiries/Index', [
            'inquiries' => ContactInquiry::query()
                ->when($archived, fn ($query) => $query->onlyTrashed())
                ->when($source, fn ($query) => $query->where('source', $source))
                ->latest()->paginate(25)->withQueryString()->through(fn (ContactInquiry $item): array => [
                'reference' => $item->reference, 'name' => $item->name, 'email' => $item->email, 'phone' => $item->phone, 'preferredContact' => $item->preferred_contact, 'source' => $item->source, 'topic' => $item->topic,
                'subject' => $item->subject, 'message' => $item->message, 'status' => $item->status,
                'createdAt' => $item->created_at->format('M j, Y H:i'),
            ]),
            'filters' => ['source' => $source ?: null, 'archived' => $archived],
            'canPermanentlyDelete' => $request->user()?->role === 'super_admin',
        ]);
    }

    public function show(ContactInquiry $inquiry): Response
    {
        if (! $inquiry->read_at) $inquiry->update(['read_at' => now()]);

        return Inertia::render('Admin/Inquiries/Show', [
            'inquiry' => $this->item($inquiry),
            'statuses' => $inquiry->source === 'safari'
                ? ['new', 'contacted', 'planning', 'quoted', 'confirmed', 'closed']
                : ['new', 'read', 'replied', 'closed'],
        ]);
    }

    public function update(Request $request, ContactInquiry $inquiry): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['new', 'read', 'replied', 'contacted', 'planning', 'quoted', 'confirmed', 'closed'])],
            'admin_notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);
        $inquiry->update($validated + ['read_at' => $validated['status'] !== 'new' ? ($inquiry->read_at ?? now()) : null]);
        return back()->with('success', "Message {$inquiry->reference} updated.");
    }

    public function destroy(ContactInquiry $inquiry): RedirectResponse
    {
        $inquiry->delete();
        return redirect()->route('admin.inquiries.index')->with('success', "Message {$inquiry->reference} archived.");
    }

    public function restore(string $reference): RedirectResponse
    {
        $inquiry = ContactInquiry::onlyTrashed()->where('reference', $reference)->firstOrFail();
        $inquiry->restore();
        return back()->with('success', "Message {$reference} restored.");
    }

    public function forceDestroy(Request $request, string $reference): RedirectResponse
    {
        abort_unless($request->user()?->role === 'super_admin', 403);
        ContactInquiry::onlyTrashed()->where('reference', $reference)->firstOrFail()->forceDelete();
        return redirect()->route('admin.inquiries.index', ['archived' => 1])->with('success', "Message {$reference} permanently deleted.");
    }

    private function item(ContactInquiry $item): array
    {
        $details = [];
        foreach (preg_split('/\R/', $item->message) ?: [] as $line) {
            if (str_contains($line, ':')) {
                [$label, $value] = array_map('trim', explode(':', $line, 2));
                if ($label !== '' && $value !== '') $details[$label] = $value;
            }
        }

        return [
            'reference' => $item->reference, 'name' => $item->name, 'email' => $item->email,
            'phone' => $item->phone, 'preferredContact' => $item->preferred_contact,
            'source' => $item->source, 'topic' => $item->topic, 'subject' => $item->subject,
            'message' => $item->message, 'details' => $details, 'status' => $item->status,
            'adminNotes' => $item->admin_notes, 'createdAt' => $item->created_at->format('F j, Y \a\t H:i'),
            'readAt' => $item->read_at?->format('F j, Y \a\t H:i'),
        ];
    }
}
