<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tour extends Model
{
    protected $fillable = [
        'tour_category_id',
        'experience_type',
        'title',
        'slug',
        'excerpt',
        'description',
        'duration',
        'location',
        'price',
        'shared_available',
        'shared_adult_price',
        'shared_group_adult_price',
        'shared_child_price',
        'shared_infant_price',
        'private_available',
        'private_1_2_price',
        'private_3_4_price',
        'private_5_6_price',
        'private_7_10_price',
        'private_child_supplement',
        'large_group_quote',
        'currency',
        'rating',
        'reviews_count',
        'cover_image_path',
        'pickup_details',
        'minimum_age',
        'difficulty',
        'is_featured',
        'is_popular',
        'is_published',
        'sort_order',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'shared_available' => 'boolean',
            'shared_adult_price' => 'decimal:2',
            'shared_group_adult_price' => 'decimal:2',
            'shared_child_price' => 'decimal:2',
            'shared_infant_price' => 'decimal:2',
            'private_available' => 'boolean',
            'private_1_2_price' => 'decimal:2',
            'private_3_4_price' => 'decimal:2',
            'private_5_6_price' => 'decimal:2',
            'private_7_10_price' => 'decimal:2',
            'private_child_supplement' => 'decimal:2',
            'large_group_quote' => 'boolean',
            'rating' => 'decimal:1',
            'is_featured' => 'boolean',
            'is_popular' => 'boolean',
            'is_published' => 'boolean',
            'minimum_age' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TourCategory::class, 'tour_category_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(TourImage::class)->orderBy('sort_order');
    }

    public function highlights(): HasMany
    {
        return $this->hasMany(TourHighlight::class)->orderBy('sort_order');
    }

    public function inclusions(): HasMany
    {
        return $this->hasMany(TourInclusion::class)->orderBy('sort_order');
    }

    public function itineraryItems(): HasMany
    {
        return $this->hasMany(TourItineraryItem::class)->orderBy('sort_order');
    }

    public function faqs(): HasMany
    {
        return $this->hasMany(TourFaq::class)->orderBy('sort_order');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }
}
