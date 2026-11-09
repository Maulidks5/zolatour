<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourHighlight extends Model
{
    protected $fillable = ['label', 'sort_order'];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
