<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tour_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('tours', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tour_category_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->string('experience_type')->default('zanzibar_tour');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('description');
            $table->string('duration');
            $table->string('location');
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('shared_available')->default(true);
            $table->decimal('shared_adult_price', 10, 2)->nullable();
            $table->decimal('shared_child_price', 10, 2)->nullable();
            $table->decimal('shared_infant_price', 10, 2)->nullable();
            $table->boolean('private_available')->default(true);
            $table->decimal('private_1_2_price', 10, 2)->nullable();
            $table->decimal('private_3_4_price', 10, 2)->nullable();
            $table->decimal('private_5_6_price', 10, 2)->nullable();
            $table->decimal('private_7_10_price', 10, 2)->nullable();
            $table->decimal('private_child_supplement', 10, 2)->nullable();
            $table->boolean('large_group_quote')->default(true);
            $table->string('currency', 3)->default('USD');
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->string('cover_image_path');
            $table->text('pickup_details')->nullable();
            $table->unsignedTinyInteger('minimum_age')->default(0);
            $table->string('difficulty')->default('Easy');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
            $table->index(['experience_type', 'is_published', 'sort_order']);
        });

        Schema::create('tour_highlights', function (Blueprint $table): void { $table->id(); $table->foreignId('tour_id')->constrained()->cascadeOnDelete(); $table->string('label'); $table->unsignedInteger('sort_order')->default(0); $table->timestamps(); });
        Schema::create('tour_inclusions', function (Blueprint $table): void { $table->id(); $table->foreignId('tour_id')->constrained()->cascadeOnDelete(); $table->string('label'); $table->boolean('is_included')->default(true); $table->unsignedInteger('sort_order')->default(0); $table->timestamps(); });
        Schema::create('tour_itinerary_items', function (Blueprint $table): void { $table->id(); $table->foreignId('tour_id')->constrained()->cascadeOnDelete(); $table->string('time_label')->nullable(); $table->string('title'); $table->text('description')->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps(); });
        Schema::create('tour_images', function (Blueprint $table): void { $table->id(); $table->foreignId('tour_id')->constrained()->cascadeOnDelete(); $table->string('path'); $table->string('alt_text')->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps(); });
        Schema::create('tour_faqs', function (Blueprint $table): void { $table->id(); $table->foreignId('tour_id')->constrained()->cascadeOnDelete(); $table->string('question'); $table->text('answer'); $table->unsignedInteger('sort_order')->default(0); $table->timestamps(); });

        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tour_id')->constrained()->restrictOnDelete();
            $table->string('booking_type')->default('shared');
            $table->decimal('estimated_price', 10, 2)->nullable();
            $table->string('estimated_currency', 3)->nullable();
            $table->decimal('quoted_price', 10, 2)->nullable();
            $table->string('quoted_currency', 3)->nullable();
            $table->string('reference')->unique();
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('whatsapp');
            $table->string('preferred_contact')->default('whatsapp');
            $table->date('travel_date');
            $table->unsignedTinyInteger('adults')->default(1);
            $table->unsignedTinyInteger('children')->default(0);
            $table->json('children_ages')->nullable();
            $table->string('pickup_zone');
            $table->string('hotel')->nullable();
            $table->text('special_requests')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('status')->default('pending');
            $table->string('source')->default('website');
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('contact_inquiries', function (Blueprint $table): void {
            $table->id(); $table->string('reference')->unique(); $table->string('name'); $table->string('email')->nullable(); $table->string('phone')->nullable(); $table->string('preferred_contact')->default('whatsapp'); $table->string('subject')->nullable(); $table->string('source')->default('contact'); $table->string('topic')->default('tour'); $table->text('message'); $table->text('admin_notes')->nullable(); $table->string('status')->default('new'); $table->timestamp('read_at')->nullable(); $table->timestamps(); $table->softDeletes();
        });
        Schema::create('site_settings', function (Blueprint $table): void { $table->id(); $table->string('group'); $table->string('key')->unique(); $table->string('label'); $table->string('type')->default('text'); $table->text('value')->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps(); });
        Schema::create('home_content_items', function (Blueprint $table): void { $table->id(); $table->string('section'); $table->string('title'); $table->text('description')->nullable(); $table->string('meta')->nullable(); $table->string('icon')->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->boolean('is_active')->default(true); $table->timestamps(); });
        Schema::create('hero_slides', function (Blueprint $table): void { $table->id(); $table->string('eyebrow')->nullable(); $table->string('title'); $table->text('description')->nullable(); $table->string('image_path'); $table->string('image_alt')->nullable(); $table->string('image_position')->default('center'); $table->string('primary_label')->nullable(); $table->string('primary_url')->nullable(); $table->string('secondary_label')->nullable(); $table->string('secondary_url')->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->boolean('is_active')->default(true); $table->timestamps(); });
    }

    public function down(): void
    {
        foreach (['hero_slides','home_content_items','site_settings','contact_inquiries','bookings','tour_faqs','tour_images','tour_itinerary_items','tour_inclusions','tour_highlights','tours','tour_categories'] as $table) Schema::dropIfExists($table);
    }
};
