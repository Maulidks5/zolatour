<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tour_id',
        'booking_type',
        'estimated_price',
        'estimated_currency',
        'quoted_price',
        'quoted_currency',
        'reference',
        'full_name',
        'email',
        'whatsapp',
        'preferred_contact',
        'travel_date',
        'adults',
        'children',
        'children_ages',
        'pickup_zone',
        'hotel',
        'special_requests',
        'admin_notes',
        'status',
        'source',
        'contacted_at',
        'confirmed_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'travel_date' => 'date',
            'adults' => 'integer',
            'children' => 'integer',
            'children_ages' => 'array',
            'estimated_price' => 'decimal:2',
            'quoted_price' => 'decimal:2',
            'contacted_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function testimonial(): HasOne
    {
        return $this->hasOne(Testimonial::class);
    }
}
