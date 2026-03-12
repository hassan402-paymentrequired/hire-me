<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_gallery_images', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('gallery_item_id')->constrained('provider_gallery_items')->cascadeOnDelete();
            $table->string('image_path');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('gallery_item_id');
            $table->index(['gallery_item_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_gallery_images');
    }
};

