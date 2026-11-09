<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transport_routes', function (Blueprint $table): void {
            $table->id();
            $table->string('pickup_location');
            $table->string('destination');
            $table->string('currency', 3)->default('USD');
            $table->decimal('sedan_price', 10, 2)->nullable();
            $table->decimal('suv_minivan_price', 10, 2)->nullable();
            $table->decimal('van_price', 10, 2)->nullable();
            $table->decimal('minibus_price', 10, 2)->nullable();
            $table->decimal('return_discount_percent', 5, 2)->default(0);
            $table->decimal('night_surcharge', 10, 2)->default(0);
            $table->time('night_start')->default('22:00');
            $table->time('night_end')->default('06:00');
            $table->decimal('child_seat_fee', 10, 2)->default(0);
            $table->boolean('is_bidirectional')->default(true);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('transport_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('transport_route_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference')->unique();
            $table->string('full_name');
            $table->string('phone', 40);
            $table->string('email')->nullable();
            $table->string('service_type');
            $table->string('trip_type')->default('one-way');
            $table->string('hire_duration')->nullable();
            $table->string('pickup_location');
            $table->string('destination');
            $table->date('travel_date');
            $table->time('pickup_time')->nullable();
            $table->date('return_date')->nullable();
            $table->time('return_time')->nullable();
            $table->unsignedSmallInteger('passengers')->default(1);
            $table->unsignedSmallInteger('luggage')->default(0);
            $table->unsignedTinyInteger('child_seats')->default(0);
            $table->string('airport_direction')->nullable();
            $table->string('airline')->nullable();
            $table->string('flight_number')->nullable();
            $table->string('vehicle_category')->default('sedan');
            $table->text('notes')->nullable();
            $table->decimal('estimated_price', 10, 2)->nullable();
            $table->string('estimated_currency', 3)->nullable();
            $table->json('price_breakdown')->nullable();
            $table->decimal('quote_amount', 10, 2)->nullable();
            $table->string('quote_currency', 3)->default('USD');
            $table->string('vehicle_type')->nullable();
            $table->unsignedSmallInteger('vehicle_capacity')->nullable();
            $table->unsignedSmallInteger('quote_valid_hours')->default(48);
            $table->text('quote_inclusions')->nullable();
            $table->text('quote_notes')->nullable();
            $table->timestamp('quoted_at')->nullable();
            $table->string('status')->default('new');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transport_requests');
        Schema::dropIfExists('transport_routes');
    }
};
