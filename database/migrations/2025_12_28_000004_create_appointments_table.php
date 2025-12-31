<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('client_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('service_id')->constrained()->cascadeOnDelete();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->string('status')->default('pending');
            $table->decimal('price', 10, 2);
            $table->text('notes')->nullable();
            $table->string('client_name')->nullable(); // Fallback if regular user not registered
            $table->string('client_email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
