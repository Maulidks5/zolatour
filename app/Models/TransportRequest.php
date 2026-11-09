<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TransportRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'reference', 'transport_route_id', 'full_name', 'phone', 'email', 'service_type', 'trip_type', 'hire_duration', 'pickup_location',
        'destination', 'travel_date', 'pickup_time', 'return_date', 'return_time', 'passengers', 'vehicle_category', 'luggage', 'child_seats', 'airport_direction', 'airline', 'flight_number',
        'notes', 'estimated_price', 'estimated_currency', 'price_breakdown', 'quote_amount', 'quote_currency', 'vehicle_type', 'vehicle_capacity',
        'quote_valid_hours', 'quote_inclusions', 'quote_notes', 'quoted_at', 'status', 'read_at',
    ];

    protected function casts(): array
    {
        return ['travel_date' => 'date', 'return_date' => 'date', 'estimated_price' => 'decimal:2', 'price_breakdown' => 'array', 'quote_amount' => 'decimal:2', 'quoted_at' => 'datetime', 'read_at' => 'datetime'];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }
}
