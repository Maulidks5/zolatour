<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use SoftDeletes;

    protected $fillable = ['booking_id', 'tour_id', 'reference', 'name', 'email', 'country', 'tour_name', 'rating', 'content', 'status', 'is_featured', 'approved_at'];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean', 'approved_at' => 'datetime'];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
