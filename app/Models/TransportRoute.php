<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransportRoute extends Model
{
    protected $fillable = ['pickup_location', 'destination', 'currency', 'sedan_price', 'suv_minivan_price', 'van_price', 'minibus_price', 'return_discount_percent', 'night_surcharge', 'night_start', 'night_end', 'child_seat_fee', 'is_bidirectional', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['sedan_price'=>'decimal:2', 'suv_minivan_price'=>'decimal:2', 'van_price'=>'decimal:2', 'minibus_price'=>'decimal:2', 'return_discount_percent'=>'decimal:2', 'night_surcharge'=>'decimal:2', 'child_seat_fee'=>'decimal:2', 'is_bidirectional'=>'boolean', 'is_active'=>'boolean', 'sort_order'=>'integer'];
    }

    public function requests(): HasMany { return $this->hasMany(TransportRequest::class); }

    public function priceFor(string $vehicle): ?float
    {
        $column = ['sedan'=>'sedan_price', 'suv-minivan'=>'suv_minivan_price', 'van'=>'van_price', 'minibus'=>'minibus_price'][$vehicle] ?? null;
        return $column && $this->{$column} !== null ? (float) $this->{$column} : null;
    }
}
