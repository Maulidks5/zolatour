<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('partners', function (Blueprint $table): void { $table->id(); $table->string('name'); $table->string('icon')->default('building'); $table->string('url')->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->boolean('is_active')->default(true); $table->timestamps(); });
        DB::table('partners')->insert([
            ['name'=>'Local hotels','icon'=>'hotel','sort_order'=>1,'is_active'=>true,'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Licensed guides','icon'=>'guide','sort_order'=>2,'is_active'=>true,'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Safari camps','icon'=>'camp','sort_order'=>3,'is_active'=>true,'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Transport teams','icon'=>'transport','sort_order'=>4,'is_active'=>true,'created_at'=>now(),'updated_at'=>now()],
        ]);
    }
    public function down(): void { Schema::dropIfExists('partners'); }
};
