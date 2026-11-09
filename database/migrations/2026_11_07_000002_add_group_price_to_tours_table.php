<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->decimal('shared_group_adult_price', 10, 2)->nullable()->after('shared_adult_price');
        });
    }

    public function down(): void
    {
        Schema::table('tours', fn (Blueprint $table) => $table->dropColumn('shared_group_adult_price'));
    }
};
