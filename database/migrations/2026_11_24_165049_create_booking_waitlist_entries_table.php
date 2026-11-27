<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_waitlist_entries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->json('service_ids')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->unique(['client_id', 'provider_id', 'date']);
            $table->index(['provider_id', 'date', 'notified_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_waitlist_entries');
    }
};
