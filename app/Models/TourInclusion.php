<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourInclusion extends Model
{
    protected $fillable = ['label', 'is_included', 'sort_order'];

    protected function casts(): array
    {
        return ['is_included' => 'boolean'];
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
