<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContactInquiry;
use App\Models\Tour;
use App\Models\TransportRequest;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $pendingBookings = Booking::query()->where('status', 'pending')->count();
        $newSafaris = ContactInquiry::query()->where('source', 'safari')->where('status', 'new')->count();
        $newTransfers = TransportRequest::query()->where('status', 'new')->count();

        $activity = Booking::query()->with('tour:id,title')->latest()->limit(5)->get()->map(fn (Booking $item): array => [
            'type' => 'Zanzibar tour', 'title' => $item->tour->title, 'customer' => $item->full_name,
            'reference' => $item->reference, 'status' => $item->status, 'date' => $item->travel_date->format('M j, Y'),
            'href' => "/admin/bookings/{$item->reference}", 'createdAt' => $item->created_at->toIso8601String(),
        ])->concat(ContactInquiry::query()->where('source', 'safari')->latest()->limit(5)->get()->map(fn (ContactInquiry $item): array => [
            'type' => 'Safari', 'title' => $item->subject, 'customer' => $item->name,
            'reference' => $item->reference, 'status' => $item->status, 'date' => $item->created_at->format('M j, Y'),
            'href' => "/admin/inquiries/{$item->reference}", 'createdAt' => $item->created_at->toIso8601String(),
        ]))->concat(TransportRequest::query()->latest()->limit(5)->get()->map(fn (TransportRequest $item): array => [
            'type' => 'Transfer', 'title' => "{$item->pickup_location} → {$item->destination}", 'customer' => $item->full_name,
            'reference' => $item->reference, 'status' => $item->status, 'date' => $item->travel_date->format('M j, Y'),
            'href' => "/admin/transport-requests/{$item->reference}", 'createdAt' => $item->created_at->toIso8601String(),
        ]))->sortByDesc('createdAt')->take(8)->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'publishedTours' => Tour::query()->published()->count(),
                'pendingBookings' => $pendingBookings,
                'newSafaris' => $newSafaris,
                'newTransfers' => $newTransfers,
                'needsAttention' => $pendingBookings + $newSafaris + $newTransfers,
            ],
            'recentActivity' => $activity,
        ]);
    }
}
