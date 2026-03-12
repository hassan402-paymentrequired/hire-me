<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_gallery_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('business_profile_id')->constrained('business_profiles')->cascadeOnDelete();
            $table->foreignUlid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('business_profile_id');
            $table->index('provider_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_gallery_items');
    }
};

