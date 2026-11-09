<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $fillable = [
        'eyebrow', 'title', 'description', 'image_path', 'image_alt', 'image_position',
        'primary_label', 'primary_url', 'secondary_label', 'secondary_url',
        'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
