<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeContentItem extends Model
{
    protected $fillable = ['section', 'title', 'description', 'meta', 'icon', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
