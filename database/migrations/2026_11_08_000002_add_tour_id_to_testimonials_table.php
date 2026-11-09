<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void { Schema::table('testimonials', function (Blueprint $table): void { $table->foreignId('tour_id')->nullable()->after('booking_id')->constrained()->nullOnDelete(); }); }
    public function down(): void { Schema::table('testimonials', fn (Blueprint $table) => $table->dropConstrainedForeignId('tour_id')); }
};
