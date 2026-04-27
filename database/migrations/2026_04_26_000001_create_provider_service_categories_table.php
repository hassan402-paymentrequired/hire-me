<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_service_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->timestamps();

            $table->unique(['provider_id', 'slug']);
            $table->index(['provider_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_service_categories');
    }
};
