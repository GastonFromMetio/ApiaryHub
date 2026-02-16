<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hive_id')->constrained()->cascadeOnDelete();
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->decimal('temperature_c', 5, 2)->nullable();
            $table->decimal('humidity_percent', 5, 2)->nullable();
            $table->unsignedTinyInteger('activity_index')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['hive_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('readings');
    }
};
