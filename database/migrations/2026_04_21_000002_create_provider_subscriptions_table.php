<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_subscriptions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('subscription_plan_id')->constrained('subscription_plans')->cascadeOnDelete();
            $table->string('status')->default('active');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['provider_id', 'status']);
            $table->index('ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_subscriptions');
    }
};
