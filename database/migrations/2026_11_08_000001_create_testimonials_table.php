<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('reference')->unique();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('country')->nullable();
            $table->string('tour_name')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->text('content');
            $table->string('status')->default('pending');
            $table->boolean('is_featured')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
