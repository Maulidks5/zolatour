<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TourCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image_path',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function tours(): HasMany
    {
        return $this->hasMany(Tour::class);
    }
}
