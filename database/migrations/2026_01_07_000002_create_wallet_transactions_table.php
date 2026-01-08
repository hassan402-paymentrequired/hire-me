<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->string('type'); // deposit, withdrawal, escrow_hold, escrow_release, escrow_refund, escrow_forfeit
            $table->decimal('amount', 10, 2);
            $table->decimal('balance_before', 10, 2);
            $table->decimal('balance_after', 10, 2);
            $table->string('status')->default('pending'); // pending, completed, failed, refunded
            $table->text('description')->nullable();
            $table->string('reference')->nullable()->unique(); // External payment reference
            $table->json('metadata')->nullable(); // Additional data
            $table->timestamps();

            $table->index('wallet_id');
            $table->index('user_id');
            $table->index('appointment_id');
            $table->index('type');
            $table->index('status');
            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
