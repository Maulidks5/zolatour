<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = ['group', 'key', 'label', 'type', 'value', 'sort_order'];

    public static function publicValues(): array
    {
        return Cache::remember('site-settings.public', now()->addHour(), fn (): array =>
            static::query()->pluck('value', 'key')->all()
        );
    }

    public static function forgetCache(): void
    {
        Cache::forget('site-settings.public');
    }
}
