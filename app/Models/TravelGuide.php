<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class TravelGuide extends Model
{
    protected $fillable = ['title','slug','category','excerpt','content','image_path','reading_time','is_featured','is_published','published_at','meta_title','meta_description'];
    protected function casts(): array { return ['is_featured'=>'boolean','is_published'=>'boolean','published_at'=>'datetime','reading_time'=>'integer']; }
    public function getRouteKeyName(): string { return 'slug'; }
    public function scopePublished(Builder $query): Builder { return $query->where('is_published', true)->whereNotNull('published_at')->where('published_at', '<=', now()); }
}
